package handlers

import (
	"errors"
	"net/http"
	"time"

	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// barisNilai adalah satu tugas beserta capaian mahasiswa atasnya.
type barisNilai struct {
	Tugas         models.Tugas             `json:"tugas"`
	Status        models.StatusPengumpulan `json:"status"`
	Nilai         *int                     `json:"nilai"`
	NilaiMaksimum int                      `json:"nilai_maksimum"`
	UmpanBalik    string                   `json:"umpan_balik"`
	WaktuKumpul   *time.Time               `json:"waktu_kumpul"`
	DinilaiPada   *time.Time               `json:"dinilai_pada"`
	PengumpulanID *uuid.UUID               `json:"pengumpulan_id"`
}

// rekapMataKuliah mengelompokkan nilai per mata kuliah sesuai KF-12.
type rekapMataKuliah struct {
	MataKuliah    models.MataKuliah `json:"mata_kuliah"`
	Daftar        []barisNilai      `json:"daftar"`
	JumlahTugas   int               `json:"jumlah_tugas"`
	JumlahDinilai int               `json:"jumlah_dinilai"`
	RataRata      *float64          `json:"rata_rata"`
}

// NilaiSaya — GET /api/saya/nilai (mahasiswa)
//
// Menampilkan nilai dan umpan balik seluruh tugas yang dikelompokkan per mata
// kuliah beserta rata-ratanya (KF-11, KF-12, dan Gambar 4.15).
func (h *Handler) NilaiSaya(c *gin.Context) {
	mahasiswaID, ok := middleware.UserIDDari(c)
	if !ok {
		utils.Error(c, http.StatusUnauthorized, "token_tidak_valid", "Sesi tidak valid")
		return
	}

	var mataKuliah []models.MataKuliah
	if err := h.db.Preload("Dosen").Order("semester ASC, kode ASC").Find(&mataKuliah).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar mata kuliah")
		return
	}

	var tugas []models.Tugas
	if err := h.db.Order("batas_waktu ASC").Find(&tugas).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar tugas")
		return
	}

	var pengumpulan []models.PengumpulanTugas
	if err := h.db.Where("mahasiswa_id = ?", mahasiswaID).Find(&pengumpulan).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil data pengumpulan")
		return
	}

	// Tiga query tetap (bukan per mata kuliah) lalu digabung di memori, agar
	// jumlah query tidak bertambah seiring banyaknya mata kuliah dan tugas.
	perMataKuliah := make(map[uuid.UUID][]models.Tugas, len(mataKuliah))
	for _, t := range tugas {
		perMataKuliah[t.MataKuliahID] = append(perMataKuliah[t.MataKuliahID], t)
	}
	indeks := make(map[uuid.UUID]*models.PengumpulanTugas, len(pengumpulan))
	for i := range pengumpulan {
		indeks[pengumpulan[i].TugasID] = &pengumpulan[i]
	}

	rekap := make([]rekapMataKuliah, 0, len(mataKuliah))
	for _, mk := range mataKuliah {
		daftarTugas := perMataKuliah[mk.ID]
		baris := make([]barisNilai, 0, len(daftarTugas))

		totalNilai, jumlahDinilai := 0, 0
		for _, t := range daftarTugas {
			b := barisNilai{Tugas: t, Status: models.StatusBelum, NilaiMaksimum: t.NilaiMaksimum}
			if p, ada := indeks[t.ID]; ada {
				b.Status = p.Status
				b.Nilai = p.Nilai
				b.UmpanBalik = p.UmpanBalik
				b.WaktuKumpul = &p.WaktuKumpul
				b.DinilaiPada = p.DinilaiPada
				b.PengumpulanID = &p.ID
				if p.Nilai != nil {
					totalNilai += *p.Nilai
					jumlahDinilai++
				}
			}
			baris = append(baris, b)
		}

		item := rekapMataKuliah{
			MataKuliah:    mk,
			Daftar:        baris,
			JumlahTugas:   len(daftarTugas),
			JumlahDinilai: jumlahDinilai,
		}
		if jumlahDinilai > 0 {
			rata := float64(totalNilai) / float64(jumlahDinilai)
			item.RataRata = &rata
		}
		rekap = append(rekap, item)
	}

	utils.OK(c, rekap, "")
}

// PengumpulanSaya — GET /api/tugas/:id/pengumpulan-saya (mahasiswa)
//
// Mengembalikan status pengumpulan mahasiswa atas satu tugas. Bila belum
// mengumpulkan, `pengumpulan` bernilai null dan status "belum".
func (h *Handler) PengumpulanSaya(c *gin.Context) {
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

	var pengumpulan models.PengumpulanTugas
	err = h.db.Where("tugas_id = ? AND mahasiswa_id = ?", tugasID, mahasiswaID).First(&pengumpulan).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		utils.OK(c, gin.H{"tugas": tugas, "status": models.StatusBelum, "pengumpulan": nil}, "")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil data pengumpulan")
		return
	}

	utils.OK(c, gin.H{"tugas": tugas, "status": pengumpulan.Status, "pengumpulan": pengumpulan}, "")
}

// RekapNilaiMataKuliah — GET /api/mata-kuliah/:id/rekap-nilai (dosen pengampu)
//
// Rekapitulasi nilai seluruh mahasiswa pada satu mata kuliah (KF-12 sisi dosen).
func (h *Handler) RekapNilaiMataKuliah(c *gin.Context) {
	mkID, ok := paramUUID(c, "id")
	if !ok {
		return
	}
	mk, boleh := h.muatMataKuliahUntukKelola(c, mkID)
	if !boleh {
		return
	}

	var daftarTugas []models.Tugas
	if err := h.db.Where("mata_kuliah_id = ?", mkID).Order("batas_waktu ASC").Find(&daftarTugas).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar tugas")
		return
	}

	var mahasiswa []models.User
	if err := h.db.Where("peran = ?", models.PeranMahasiswa).Order("nama ASC").Find(&mahasiswa).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar mahasiswa")
		return
	}

	idTugas := make([]uuid.UUID, 0, len(daftarTugas))
	for _, t := range daftarTugas {
		idTugas = append(idTugas, t.ID)
	}

	var pengumpulan []models.PengumpulanTugas
	if len(idTugas) > 0 {
		if err := h.db.Where("tugas_id IN ?", idTugas).Find(&pengumpulan).Error; err != nil {
			utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil data pengumpulan")
			return
		}
	}

	// Kunci gabungan mahasiswa+tugas agar pencarian saat penggabungan O(1).
	type kunci struct{ mahasiswa, tugas uuid.UUID }
	indeks := make(map[kunci]*models.PengumpulanTugas, len(pengumpulan))
	for i := range pengumpulan {
		indeks[kunci{pengumpulan[i].MahasiswaID, pengumpulan[i].TugasID}] = &pengumpulan[i]
	}

	type rekapMahasiswa struct {
		Mahasiswa     models.User  `json:"mahasiswa"`
		Daftar        []barisNilai `json:"daftar"`
		JumlahDinilai int          `json:"jumlah_dinilai"`
		RataRata      *float64     `json:"rata_rata"`
	}

	hasil := make([]rekapMahasiswa, 0, len(mahasiswa))
	for _, m := range mahasiswa {
		baris := make([]barisNilai, 0, len(daftarTugas))
		totalNilai, jumlahDinilai := 0, 0

		for _, t := range daftarTugas {
			b := barisNilai{Tugas: t, Status: models.StatusBelum, NilaiMaksimum: t.NilaiMaksimum}
			if p, ada := indeks[kunci{m.ID, t.ID}]; ada {
				b.Status = p.Status
				b.Nilai = p.Nilai
				b.UmpanBalik = p.UmpanBalik
				b.WaktuKumpul = &p.WaktuKumpul
				b.DinilaiPada = p.DinilaiPada
				b.PengumpulanID = &p.ID
				if p.Nilai != nil {
					totalNilai += *p.Nilai
					jumlahDinilai++
				}
			}
			baris = append(baris, b)
		}

		item := rekapMahasiswa{Mahasiswa: m, Daftar: baris, JumlahDinilai: jumlahDinilai}
		if jumlahDinilai > 0 {
			rata := float64(totalNilai) / float64(jumlahDinilai)
			item.RataRata = &rata
		}
		hasil = append(hasil, item)
	}

	utils.OK(c, gin.H{"mata_kuliah": mk, "tugas": daftarTugas, "rekap": hasil}, "")
}
