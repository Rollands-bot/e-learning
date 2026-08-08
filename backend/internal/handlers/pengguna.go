package handlers

import (
	"net/http"
	"strings"

	"elearning-unipi/internal/database"
	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
)

type penggunaCreateRequest struct {
	Nama       string `json:"nama" binding:"required,min=3,max=100"`
	Email      string `json:"email" binding:"required,email,max=100"`
	Password   string `json:"password" binding:"required,min=8,max=72"`
	Peran      string `json:"peran" binding:"required,oneof=administrator dosen mahasiswa"`
	NomorInduk string `json:"nomor_induk" binding:"max=20"`
	Status     string `json:"status" binding:"omitempty,oneof=aktif nonaktif"`
}

type penggunaUpdateRequest struct {
	Nama       string  `json:"nama" binding:"omitempty,min=3,max=100"`
	Email      string  `json:"email" binding:"omitempty,email,max=100"`
	Password   string  `json:"password" binding:"omitempty,min=8,max=72"`
	Peran      string  `json:"peran" binding:"omitempty,oneof=administrator dosen mahasiswa"`
	NomorInduk *string `json:"nomor_induk" binding:"omitempty,max=20"`
	Status     string  `json:"status" binding:"omitempty,oneof=aktif nonaktif"`
}

// DaftarPengguna — GET /api/pengguna?peran=dosen
//
// Mendukung filter peran agar halaman Kelola Mata Kuliah dapat mengambil
// daftar dosen untuk pilihan dosen pengampu (Tabel 4.7 langkah 5).
func (h *Handler) DaftarPengguna(c *gin.Context) {
	q := h.db.Order("nama ASC")

	if peran := c.Query("peran"); peran != "" {
		if !models.PeranValid(models.Peran(peran)) {
			utils.Error(c, http.StatusBadRequest, "peran_tidak_valid", "Nilai peran tidak dikenali")
			return
		}
		q = q.Where("peran = ?", peran)
	}

	var daftar []models.User
	if err := q.Find(&daftar).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil daftar pengguna")
		return
	}
	utils.OK(c, daftar, "")
}

// DetailPengguna — GET /api/pengguna/:id
func (h *Handler) DetailPengguna(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "pengguna_tidak_ditemukan", "Pengguna tidak ditemukan")
		return
	}
	utils.OK(c, user, "")
}

// BuatPengguna — POST /api/pengguna
//
// Seluruh akun dibuat oleh administrator; sistem tidak menyediakan registrasi
// mandiri (Tabel 4.6 Skenario Use Case Mengelola Data Pengguna).
func (h *Handler) BuatPengguna(c *gin.Context) {
	var req penggunaCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "hash_gagal", "Gagal memproses kata sandi")
		return
	}

	status := models.StatusPengguna(req.Status)
	if status == "" {
		status = models.StatusAktif
	}

	user := models.User{
		Nama:       strings.TrimSpace(req.Nama),
		Email:      strings.ToLower(strings.TrimSpace(req.Email)),
		Password:   hash,
		Peran:      models.Peran(req.Peran),
		NomorInduk: strings.TrimSpace(req.NomorInduk),
		Status:     status,
	}

	if err := h.db.Create(&user).Error; err != nil {
		if database.PelanggaranUnik(err) {
			utils.Error(c, http.StatusConflict, "surel_terdaftar", "Surel sudah terdaftar")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menyimpan pengguna")
		return
	}

	utils.Created(c, user, "Pengguna berhasil ditambahkan")
}

// UbahPengguna — PUT /api/pengguna/:id
//
// Hanya field yang dikirim yang diperbarui, sehingga front-end dapat mengubah
// sebagian data (misal hanya status) tanpa harus mengirim ulang seluruh field.
func (h *Handler) UbahPengguna(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	var req penggunaUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_valid", err.Error())
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "pengguna_tidak_ditemukan", "Pengguna tidak ditemukan")
		return
	}

	if req.Nama != "" {
		user.Nama = strings.TrimSpace(req.Nama)
	}
	if req.Email != "" {
		user.Email = strings.ToLower(strings.TrimSpace(req.Email))
	}
	if req.Peran != "" {
		user.Peran = models.Peran(req.Peran)
	}
	if req.NomorInduk != nil {
		user.NomorInduk = strings.TrimSpace(*req.NomorInduk)
	}
	if req.Status != "" {
		user.Status = models.StatusPengguna(req.Status)
	}
	if req.Password != "" {
		hash, err := utils.HashPassword(req.Password)
		if err != nil {
			utils.Error(c, http.StatusInternalServerError, "hash_gagal", "Gagal memproses kata sandi")
			return
		}
		user.Password = hash
	}

	if err := h.db.Save(&user).Error; err != nil {
		if database.PelanggaranUnik(err) {
			utils.Error(c, http.StatusConflict, "surel_terdaftar", "Surel sudah digunakan pengguna lain")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal memperbarui pengguna")
		return
	}

	utils.OK(c, user, "Pengguna berhasil diperbarui")
}

// HapusPengguna — DELETE /api/pengguna/:id
func (h *Handler) HapusPengguna(c *gin.Context) {
	id, ok := paramUUID(c, "id")
	if !ok {
		return
	}

	// Administrator tidak boleh menghapus akunnya sendiri agar sistem tidak
	// kehilangan seluruh akses pengelolaan.
	if pelaku, ada := middleware.UserIDDari(c); ada && pelaku == id {
		utils.Error(c, http.StatusBadRequest, "hapus_diri_sendiri", "Anda tidak dapat menghapus akun Anda sendiri")
		return
	}

	res := h.db.Delete(&models.User{}, "id = ?", id)
	if res.Error != nil {
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal menghapus pengguna")
		return
	}
	if res.RowsAffected == 0 {
		utils.Error(c, http.StatusNotFound, "pengguna_tidak_ditemukan", "Pengguna tidak ditemukan")
		return
	}

	utils.OK(c, nil, "Pengguna berhasil dihapus")
}
