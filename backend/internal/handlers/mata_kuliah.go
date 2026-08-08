package handlers

import (
	"net/http"
	"strings"

	"elearning-unipi/internal/database"
	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type mataKuliahRequest struct {
	Kode     string     `json:"kode" binding:"required,max=10"`
	Nama     string     `json:"nama" binding:"required,max=100"`
	SKS      int        `json:"sks" binding:"required,min=1,max=24"`
	Semester int        `json:"semester" binding:"omitempty,min=1,max=14"`
	DosenID  *uuid.UUID `json:"dosen_id"`
}

// pastikanDosen memverifikasi bahwa id yang ditetapkan sebagai dosen pengampu
// benar-benar milik pengguna berperan dosen.
func (h *Handler) pastikanDosen(c *gin.Context, dosenID *uuid.UUID) bool {
	if dosenID == nil {
		return true
	}
	var dosen models.User
	if err := h.db.First(&dosen, "id = ?", *dosenID).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "dosen_tidak_ditemukan", "Dosen pengampu tidak ditemukan")
		return false
	}
	if dosen.Peran != models.PeranDosen {
		utils.Error(c, http.StatusBadRequest, "bukan_dosen", "Pengguna yang dipilih bukan berperan dosen")
		return false
	}
	return true
}

// DaftarMataKuliah — GET /api/mata-kuliah
//
// Administrator dan mahasiswa melihat seluruh mata kuliah, sedangkan dosen
// secara otomatis hanya melihat mata kuliah yang diampunya sesuai deskripsi
// dasbor dosen (Gambar 4.9).
func (h *Handler) DaftarMataKuliah(c *gin.Context) {
	q := h.db.Preload("Dosen").Order("semester ASC, kode ASC")

	peran, _ := middleware.PeranDari(c)
	if peran == models.PeranDosen {
		userID, _ := middleware.UserIDDari(c)
		q = q.Where("dosen_id = ?", userID)
	}

	var daftar []models.MataKuliah
	if err := q.Find(&daftar).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar mata kuliah")
		return
	}
	utils.OK(c, daftar, "")
}

// DetailMataKuliah — GET /api/mata-kuliah/:id
func (h *Handler) DetailMataKuliah(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var mk models.MataKuliah
	if err := h.db.Preload("Dosen").First(&mk, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "mata_kuliah_tidak_ditemukan", "Mata kuliah tidak ditemukan")
		return
	}
	utils.OK(c, mk, "")
}

// BuatMataKuliah — POST /api/mata-kuliah (administrator)
func (h *Handler) BuatMataKuliah(c *gin.Context) {
	var req mataKuliahRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}
	if !h.pastikanDosen(c, req.DosenID) {
		return
	}

	mk := models.MataKuliah{
		Kode:     strings.ToUpper(strings.TrimSpace(req.Kode)),
		Nama:     strings.TrimSpace(req.Nama),
		SKS:      req.SKS,
		Semester: req.Semester,
		DosenID:  req.DosenID,
	}

	if err := h.db.Create(&mk).Error; err != nil {
		if database.PelanggaranUnik(err) {
			utils.Error(c, http.StatusConflict, "kode_terdaftar", "Kode mata kuliah sudah digunakan")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan mata kuliah")
		return
	}

	h.db.Preload("Dosen").First(&mk, "id = ?", mk.ID)
	utils.Created(c, mk, "Mata kuliah berhasil ditambahkan")
}

// UbahMataKuliah — PUT /api/mata-kuliah/:id (administrator)
func (h *Handler) UbahMataKuliah(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var req mataKuliahRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}
	if !h.pastikanDosen(c, req.DosenID) {
		return
	}

	var mk models.MataKuliah
	if err := h.db.First(&mk, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "mata_kuliah_tidak_ditemukan", "Mata kuliah tidak ditemukan")
		return
	}

	mk.Kode = strings.ToUpper(strings.TrimSpace(req.Kode))
	mk.Nama = strings.TrimSpace(req.Nama)
	mk.SKS = req.SKS
	mk.Semester = req.Semester
	mk.DosenID = req.DosenID

	if err := h.db.Save(&mk).Error; err != nil {
		if database.PelanggaranUnik(err) {
			utils.Error(c, http.StatusConflict, "kode_terdaftar", "Kode mata kuliah sudah digunakan")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal memperbarui mata kuliah")
		return
	}

	h.db.Preload("Dosen").First(&mk, "id = ?", mk.ID)
	utils.OK(c, mk, "Mata kuliah berhasil diperbarui")
}

// HapusMataKuliah — DELETE /api/mata-kuliah/:id (administrator)
func (h *Handler) HapusMataKuliah(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	res := h.db.Delete(&models.MataKuliah{}, "id = ?", id)
	if res.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menghapus mata kuliah")
		return
	}
	if res.RowsAffected == 0 {
		utils.Error(c, http.StatusNotFound, "mata_kuliah_tidak_ditemukan", "Mata kuliah tidak ditemukan")
		return
	}

	utils.OK(c, nil, "Mata kuliah berhasil dihapus")
}
