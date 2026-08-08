package handlers

import (
	"errors"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const subDirPengumpulan = "pengumpulan"

type nilaiRequest struct {
	Nilai      *int   `json:"nilai" binding:"required"`
	UmpanBalik string `json:"umpan_balik"`
}

// barisPengumpulan menggabungkan data mahasiswa dengan pengumpulannya.
// Mahasiswa yang belum mengumpulkan tetap muncul dengan status "belum",
// sesuai rancangan tampilan daftar pengumpulan (Gambar 4.12).
type barisPengumpulan struct {
	Mahasiswa   models.User              `json:"mahasiswa"`
	Status      models.StatusPengumpulan `json:"status"`
	Pengumpulan *models.PengumpulanTugas `json:"pengumpulan"`
}

// KumpulkanTugas — POST /api/tugas/:id/pengumpulan (mahasiswa)
//
// Menerima multipart/form-data dengan field `berkas`. Waktu pengumpulan dan
// status ditetapkan sistem (KF-07 dan KF-08), bukan dikirim front-end.
func (h *Handler) KumpulkanTugas(c *gin.Context) {
	tugasID, ok := paramUUID(c, "id")
	if !ok {
		return
	}
	mahasiswaID, ok := middleware.UserIDDari(c)
	if !ok {
		utils.Error(c, http.StatusUnauthorized, "token_tidak_valid", "Sesi tidak valid")
		return
	}

	tugas, err := h.muatTugas(tugasID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
		return
	}

	// Pengumpulan yang sudah dinilai tidak boleh ditimpa, karena nilai dan
	// umpan balik dosen mengacu pada berkas yang sudah diperiksa.
	var lama models.PengumpulanTugas
	adaLama := false
	if err := h.db.Where("tugas_id = ? AND mahasiswa_id = ?", tugasID, mahasiswaID).First(&lama).Error; err == nil {
		if lama.Status == models.StatusDinilai {
			utils.Error(c, http.StatusConflict, "sudah_dinilai", "Tugas sudah dinilai dan tidak dapat dikumpulkan ulang")
			return
		}
		adaLama = true
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal memeriksa pengumpulan sebelumnya")
		return
	}

	berkas, err := c.FormFile("berkas")
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "berkas_kosong", "Berkas jawaban wajib dipilih")
		return
	}

	pathRelatif, _, err := utils.SimpanBerkas(
		berkas, h.cfg.UploadDir, subDirPengumpulan, h.cfg.MaksPengumpulanMB, h.cfg.EkstensiPengumpulan,
	)
	if err != nil {
		var eb *utils.ErrBerkas
		if errors.As(err, &eb) {
			utils.Error(c, http.StatusBadRequest, eb.Kode, eb.Pesan)
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_penyimpanan", "Gagal menyiapkan penyimpanan berkas")
		return
	}
	if err := c.SaveUploadedFile(berkas, filepath.Join(h.cfg.UploadDir, pathRelatif)); err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_penyimpanan", "Gagal menyimpan berkas jawaban")
		return
	}

	waktuKumpul := time.Now()
	status := models.TentukanStatus(waktuKumpul, tugas.BatasWaktu)

	pengumpulan := lama
	berkasLama := lama.BerkasURL
	pengumpulan.TugasID = tugasID
	pengumpulan.MahasiswaID = mahasiswaID
	pengumpulan.BerkasURL = pathRelatif
	pengumpulan.WaktuKumpul = waktuKumpul
	pengumpulan.Status = status

	if err := h.db.Save(&pengumpulan).Error; err != nil {
		_ = utils.HapusBerkas(h.cfg.UploadDir, pathRelatif)
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan pengumpulan tugas")
		return
	}
	if adaLama {
		_ = utils.HapusBerkas(h.cfg.UploadDir, berkasLama)
	}

	pesan := "Tugas berhasil dikumpulkan"
	if status == models.StatusTerlambat {
		pesan = "Tugas dikumpulkan melewati batas waktu dan ditandai terlambat"
	}
	utils.Created(c, pengumpulan, pesan)
}

// DaftarPengumpulan — GET /api/tugas/:id/pengumpulan (dosen pengampu)
//
// Mengembalikan seluruh mahasiswa beserta status pengumpulannya, termasuk yang
// belum mengumpulkan, agar dosen dapat memantau kelengkapan (KF-09).
func (h *Handler) DaftarPengumpulan(c *gin.Context) {
	tugasID, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	tugas, err := h.muatTugas(tugasID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, tugas.MataKuliahID); !boleh {
		return
	}

	var mahasiswa []models.User
	if err := h.db.Where("peran = ?", models.PeranMahasiswa).Order("nama ASC").Find(&mahasiswa).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar mahasiswa")
		return
	}

	var pengumpulan []models.PengumpulanTugas
	if err := h.db.Where("tugas_id = ?", tugasID).Find(&pengumpulan).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil data pengumpulan")
		return
	}

	// Diindeks lebih dulu agar penggabungan tidak menghasilkan query per mahasiswa.
	indeks := make(map[uuid.UUID]*models.PengumpulanTugas, len(pengumpulan))
	for i := range pengumpulan {
		indeks[pengumpulan[i].MahasiswaID] = &pengumpulan[i]
	}

	baris := make([]barisPengumpulan, 0, len(mahasiswa))
	for _, m := range mahasiswa {
		b := barisPengumpulan{Mahasiswa: m, Status: models.StatusBelum}
		if p, ada := indeks[m.ID]; ada {
			b.Status = p.Status
			b.Pengumpulan = p
		}
		baris = append(baris, b)
	}

	utils.OK(c, gin.H{"tugas": tugas, "daftar": baris}, "")
}

// BeriNilai — PUT /api/pengumpulan/:id/nilai (dosen pengampu)
//
// Nilai divalidasi terhadap nilai maksimum tugas sesuai skenario pengujian
// Tabel 3.9 nomor 12, lalu status berubah menjadi "dinilai" (KF-10).
func (h *Handler) BeriNilai(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var pengumpulan models.PengumpulanTugas
	if err := h.db.First(&pengumpulan, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "pengumpulan_tidak_ditemukan", "Pengumpulan tugas tidak ditemukan")
		return
	}

	tugas, err := h.muatTugas(pengumpulan.TugasID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, tugas.MataKuliahID); !boleh {
		return
	}

	var req nilaiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", "Nilai wajib diisi")
		return
	}

	if *req.Nilai < 0 || *req.Nilai > tugas.NilaiMaksimum {
		utils.Error(c, http.StatusBadRequest, "nilai_di_luar_rentang",
			"Nilai harus berada di antara 0 sampai "+strconv.Itoa(tugas.NilaiMaksimum))
		return
	}

	sekarang := time.Now()
	pengumpulan.Nilai = req.Nilai
	pengumpulan.UmpanBalik = strings.TrimSpace(req.UmpanBalik)
	pengumpulan.DinilaiPada = &sekarang
	pengumpulan.Status = models.StatusDinilai

	if err := h.db.Save(&pengumpulan).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan nilai")
		return
	}

	utils.OK(c, pengumpulan, "Nilai dan umpan balik berhasil disimpan")
}

// UnduhPengumpulan — GET /api/pengumpulan/:id/unduh
//
// Dosen pengampu dapat mengunduh berkas jawaban untuk diperiksa; mahasiswa
// hanya dapat mengunduh berkas miliknya sendiri.
func (h *Handler) UnduhPengumpulan(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var pengumpulan models.PengumpulanTugas
	if err := h.db.Preload("Mahasiswa").First(&pengumpulan, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "pengumpulan_tidak_ditemukan", "Pengumpulan tugas tidak ditemukan")
		return
	}

	peran, _ := middleware.PeranDari(c)
	userID, _ := middleware.UserIDDari(c)

	if peran == models.PeranMahasiswa {
		if pengumpulan.MahasiswaID != userID {
			utils.Error(c, http.StatusForbidden, "akses_ditolak", "Anda hanya dapat mengunduh berkas milik sendiri")
			return
		}
	} else {
		tugas, err := h.muatTugas(pengumpulan.TugasID)
		if err != nil {
			utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
			return
		}
		if !bolehKelolaMataKuliah(peran, userID, tugas.MataKuliah) {
			utils.Error(c, http.StatusForbidden, "bukan_pengampu", "Anda bukan dosen pengampu mata kuliah ini")
			return
		}
	}

	nama := "jawaban"
	if pengumpulan.Mahasiswa != nil {
		nama = pengumpulan.Mahasiswa.Nama
	}
	c.FileAttachment(
		filepath.Join(h.cfg.UploadDir, pengumpulan.BerkasURL),
		namaUnduhan(nama, pengumpulan.BerkasURL),
	)
}
