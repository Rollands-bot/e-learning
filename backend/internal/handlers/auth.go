package handlers

import (
	"errors"
	"net/http"
	"strings"

	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type loginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Login — POST /api/auth/login
//
// Autentikasi menggunakan surel dan kata sandi sesuai Skenario Use Case Login
// (Tabel 4.5). Pesan kesalahan sengaja disamakan untuk seluruh penyebab
// kegagalan agar penyerang tidak dapat menebak surel mana yang terdaftar.
func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "data_tidak_lengkap", "Surel dan kata sandi wajib diisi dengan format yang benar")
		return
	}

	const pesanGagal = "Surel atau kata sandi salah"

	var user models.User
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if err := h.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusUnauthorized, "kredensial_salah", pesanGagal)
			return
		}
		utils.Error(c, http.StatusInternalServerError, "galat_basis_data", "Gagal mengambil data pengguna")
		return
	}

	if !utils.CheckPassword(user.Password, req.Password) {
		utils.Error(c, http.StatusUnauthorized, "kredensial_salah", pesanGagal)
		return
	}

	// Akun nonaktif tetap tersimpan di basis data namun tidak boleh masuk.
	if user.Status != models.StatusAktif {
		utils.Error(c, http.StatusForbidden, "akun_nonaktif", "Akun Anda nonaktif. Hubungi administrator.")
		return
	}

	token, err := utils.GenerateToken(h.cfg.JWTSecret, h.cfg.JWTExpireHours, user.ID, user.Email, user.Peran)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "token_gagal", "Gagal membuat token")
		return
	}

	utils.OK(c, loginResponse{Token: token, User: user}, "Login berhasil")
}

// Me — GET /api/auth/me
func (h *Handler) Me(c *gin.Context) {
	userID, ok := middleware.UserIDDari(c)
	if !ok {
		utils.Error(c, http.StatusUnauthorized, "token_tidak_valid", "Sesi tidak valid")
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "pengguna_tidak_ditemukan", "Pengguna tidak ditemukan")
		return
	}
	utils.OK(c, user, "")
}

// Logout — POST /api/auth/logout
//
// JWT bersifat stateless sehingga tidak ada sesi yang perlu dihapus di server.
// Endpoint disediakan agar front-end memiliki titik akhir yang eksplisit untuk
// use case Logout (Tabel 4.14); penghapusan token dilakukan di sisi klien.
func (h *Handler) Logout(c *gin.Context) {
	utils.OK(c, nil, "Logout berhasil")
}
