package handlers

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"

	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const subDirMateri = "materi"

// namaUnduhan menyusun nama berkas yang diterima pengguna saat mengunduh.
//
// Struktur tabel materi (Tabel 4.17) tidak memiliki kolom nama berkas asli,
// sehingga nama unduhan diturunkan dari judul materi ditambah ekstensi berkas
// yang tersimpan. Karakter yang tidak aman untuk nama berkas diganti "-".
func namaUnduhan(judul, berkasURL string) string {
	bersih := strings.Map(func(r rune) rune {
		if strings.ContainsRune(`/\:*?"<>|`, r) {
			return '-'
		}
		return r
	}, strings.TrimSpace(judul))

	if bersih == "" {
		bersih = "berkas"
	}
	return bersih + strings.ToLower(filepath.Ext(berkasURL))
}

// muatMataKuliahUntukKelola mengambil mata kuliah lalu memastikan pengguna
// berhak mengelolanya. Membalas response galat sendiri bila tidak berhak.
func (h *Handler) muatMataKuliahUntukKelola(c *gin.Context, mkID uuid.UUID) (*models.MataKuliah, bool) {
	var mk models.MataKuliah
	if err := h.db.First(&mk, "id = ?", mkID).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "mata_kuliah_tidak_ditemukan", "Mata kuliah tidak ditemukan")
		return nil, false
	}

	peran, _ := middleware.PeranDari(c)
	userID, _ := middleware.UserIDDari(c)
	if !bolehKelolaMataKuliah(peran, userID, &mk) {
		utils.Error(c, http.StatusForbidden, "bukan_pengampu", "Anda bukan dosen pengampu mata kuliah ini")
		return nil, false
	}
	return &mk, true
}

// DaftarMateri — GET /api/mata-kuliah/:id/materi
func (h *Handler) DaftarMateri(c *gin.Context) {
	mkID, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var daftar []models.Materi
	err := h.db.Where("mata_kuliah_id = ?", mkID).Order("diunggah_pada DESC").Find(&daftar).Error
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar materi")
		return
	}
	utils.OK(c, daftar, "")
}

// UnggahMateri — POST /api/mata-kuliah/:id/materi (dosen pengampu)
//
// Menerima multipart/form-data: judul, deskripsi, berkas.
// Validasi format dan ukuran berkas mengacu skenario pengujian Tabel 3.9 nomor 5 dan 6.
func (h *Handler) UnggahMateri(c *gin.Context) {
	mkID, ok := paramUUID(c, "id")
	if !ok {
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, mkID); !boleh {
		return
	}

	judul := strings.TrimSpace(c.PostForm("judul"))
	if judul == "" || len(judul) > 150 {
		utils.Error(c, http.StatusBadRequest, "judul_tidak_valid", "Judul wajib diisi, maksimal 150 karakter")
		return
	}

	berkas, err := c.FormFile("berkas")
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "berkas_kosong", "Berkas materi wajib dipilih")
		return
	}

	pathRelatif, ukuranKB, err := utils.SimpanBerkas(
		berkas, h.cfg.UploadDir, subDirMateri, h.cfg.MaksMateriMB, h.cfg.EkstensiMateri,
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

	// Berkas baru ditulis ke disk setelah seluruh validasi lolos, sehingga
	// tidak ada berkas yatim ketika permintaan ditolak.
	if err := c.SaveUploadedFile(berkas, filepath.Join(h.cfg.UploadDir, pathRelatif)); err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_penyimpanan", "Gagal menyimpan berkas materi")
		return
	}

	materi := models.Materi{
		MataKuliahID: mkID,
		Judul:        judul,
		Deskripsi:    strings.TrimSpace(c.PostForm("deskripsi")),
		BerkasURL:    pathRelatif,
		UkuranBerkas: ukuranKB,
	}

	if err := h.db.Create(&materi).Error; err != nil {
		_ = utils.HapusBerkas(h.cfg.UploadDir, pathRelatif)
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan data materi")
		return
	}

	utils.Created(c, materi, "Materi berhasil diunggah")
}

// UbahMateri — PUT /api/materi/:id (dosen pengampu)
//
// Menerima multipart/form-data. Berkas bersifat opsional; bila tidak dikirim,
// hanya judul dan deskripsi yang diperbarui dan berkas lama tetap dipakai.
func (h *Handler) UbahMateri(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var materi models.Materi
	if err := h.db.First(&materi, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "materi_tidak_ditemukan", "Materi tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, materi.MataKuliahID); !boleh {
		return
	}

	if judul := strings.TrimSpace(c.PostForm("judul")); judul != "" {
		if len(judul) > 150 {
			utils.Error(c, http.StatusBadRequest, "judul_tidak_valid", "Judul maksimal 150 karakter")
			return
		}
		materi.Judul = judul
	}
	if _, ada := c.GetPostForm("deskripsi"); ada {
		materi.Deskripsi = strings.TrimSpace(c.PostForm("deskripsi"))
	}

	berkasLama := materi.BerkasURL
	adaBerkasBaru := false

	if berkas, err := c.FormFile("berkas"); err == nil {
		pathRelatif, ukuranKB, err := utils.SimpanBerkas(
			berkas, h.cfg.UploadDir, subDirMateri, h.cfg.MaksMateriMB, h.cfg.EkstensiMateri,
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
			utils.Error(c, http.StatusInternalServerError, "galat_penyimpanan", "Gagal menyimpan berkas materi")
			return
		}
		materi.BerkasURL = pathRelatif
		materi.UkuranBerkas = ukuranKB
		adaBerkasBaru = true
	}

	if err := h.db.Save(&materi).Error; err != nil {
		if adaBerkasBaru {
			_ = utils.HapusBerkas(h.cfg.UploadDir, materi.BerkasURL)
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal memperbarui materi")
		return
	}

	// Berkas lama baru dihapus setelah baris basis data berhasil menunjuk ke
	// berkas baru, agar materi tidak pernah kehilangan berkasnya.
	if adaBerkasBaru {
		_ = utils.HapusBerkas(h.cfg.UploadDir, berkasLama)
	}

	utils.OK(c, materi, "Materi berhasil diperbarui")
}

// HapusMateri — DELETE /api/materi/:id (dosen pengampu)
func (h *Handler) HapusMateri(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var materi models.Materi
	if err := h.db.First(&materi, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "materi_tidak_ditemukan", "Materi tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, materi.MataKuliahID); !boleh {
		return
	}

	if err := h.db.Delete(&models.Materi{}, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menghapus materi")
		return
	}
	_ = utils.HapusBerkas(h.cfg.UploadDir, materi.BerkasURL)

	utils.OK(c, nil, "Materi berhasil dihapus")
}

// UnduhMateri — GET /api/materi/:id/unduh
//
// Berkas disajikan melalui handler, bukan sebagai direktori statis, sehingga
// pengunduhan tetap melewati pemeriksaan token JWT (Tabel 4.9 langkah 4).
func (h *Handler) UnduhMateri(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var materi models.Materi
	if err := h.db.First(&materi, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "materi_tidak_ditemukan", "Materi tidak ditemukan")
		return
	}

	c.FileAttachment(filepath.Join(h.cfg.UploadDir, materi.BerkasURL), namaUnduhan(materi.Judul, materi.BerkasURL))
}
