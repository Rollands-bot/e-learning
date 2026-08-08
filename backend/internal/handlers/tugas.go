package handlers

import (
	"net/http"
	"strings"
	"time"

	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
)

type tugasRequest struct {
	Judul         string    `json:"judul" binding:"required,max=150"`
	Deskripsi     string    `json:"deskripsi"`
	BatasWaktu    time.Time `json:"batas_waktu" binding:"required"`
	NilaiMaksimum int       `json:"nilai_maksimum" binding:"required,min=1,max=1000"`
}

// DaftarTugas — GET /api/mata-kuliah/:id/tugas
func (h *Handler) DaftarTugas(c *gin.Context) {
	mkID, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var daftar []models.Tugas
	err := h.db.Where("mata_kuliah_id = ?", mkID).Order("batas_waktu ASC").Find(&daftar).Error
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar tugas")
		return
	}
	utils.OK(c, daftar, "")
}

// BuatTugas — POST /api/mata-kuliah/:id/tugas (dosen pengampu)
//
// Sesuai Tabel 4.10, tugas dibuat dengan judul, deskripsi, batas waktu, dan
// nilai maksimum. Struktur tabel tugas (Tabel 4.18) tidak memuat berkas
// lampiran, sehingga instruksi tugas disampaikan melalui kolom deskripsi.
func (h *Handler) BuatTugas(c *gin.Context) {
	mkID, ok := paramUUID(c, "id")
	if !ok {
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, mkID); !boleh {
		return
	}

	var req tugasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}

	tugas := models.Tugas{
		MataKuliahID:  mkID,
		Judul:         strings.TrimSpace(req.Judul),
		Deskripsi:     strings.TrimSpace(req.Deskripsi),
		BatasWaktu:    req.BatasWaktu,
		NilaiMaksimum: req.NilaiMaksimum,
	}

	if err := h.db.Create(&tugas).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan tugas")
		return
	}

	utils.Created(c, tugas, "Tugas berhasil dibuat")
}

// UbahTugas — PUT /api/tugas/:id (dosen pengampu)
func (h *Handler) UbahTugas(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	tugas, err := h.muatTugas(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, tugas.MataKuliahID); !boleh {
		return
	}

	var req tugasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}

	tugas.Judul = strings.TrimSpace(req.Judul)
	tugas.Deskripsi = strings.TrimSpace(req.Deskripsi)
	tugas.BatasWaktu = req.BatasWaktu
	tugas.NilaiMaksimum = req.NilaiMaksimum

	if err := h.db.Save(tugas).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal memperbarui tugas")
		return
	}

	utils.OK(c, tugas, "Tugas berhasil diperbarui")
}

// HapusTugas — DELETE /api/tugas/:id (dosen pengampu)
func (h *Handler) HapusTugas(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	tugas, err := h.muatTugas(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "tugas_tidak_ditemukan", "Tugas tidak ditemukan")
		return
	}
	if _, boleh := h.muatMataKuliahUntukKelola(c, tugas.MataKuliahID); !boleh {
		return
	}

	// Berkas jawaban ikut dihapus dari disk sebelum barisnya hilang karena
	// cascade, agar tidak menyisakan berkas yatim di direktori unggahan.
	var pengumpulan []models.PengumpulanTugas
	h.db.Where("tugas_id = ?", id).Find(&pengumpulan)

	if err := h.db.Delete(&models.Tugas{}, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menghapus tugas")
		return
	}
	for _, p := range pengumpulan {
		_ = utils.HapusBerkas(h.cfg.UploadDir, p.BerkasURL)
	}

	utils.OK(c, nil, "Tugas berhasil dihapus")
}
