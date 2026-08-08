package middleware

import (
	"net/http"
	"strings"

	"elearning-unipi/internal/config"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	CtxUserID = "user_id"
	CtxEmail  = "email"
	CtxPeran  = "peran"
)

// JWTAuth memvalidasi header Authorization: Bearer <token> dan menyimpan klaim ke context.
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			utils.Error(c, http.StatusUnauthorized, "token_tidak_ada", "Token tidak ditemukan")
			return
		}
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			utils.Error(c, http.StatusUnauthorized, "format_token_salah", "Format token tidak valid")
			return
		}

		claims, err := utils.ParseToken(cfg.JWTSecret, parts[1])
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "token_tidak_valid", "Token tidak valid atau kedaluwarsa")
			return
		}

		c.Set(CtxUserID, claims.UserID)
		c.Set(CtxEmail, claims.Email)
		c.Set(CtxPeran, claims.Peran)
		c.Next()
	}
}

// RequirePeran membatasi akses route hanya untuk peran tertentu (RBAC).
// Dipakai SETELAH JWTAuth. Lihat skenario pengujian Tabel 3.9 nomor 14.
func RequirePeran(diizinkan ...models.Peran) gin.HandlerFunc {
	set := make(map[models.Peran]struct{}, len(diizinkan))
	for _, p := range diizinkan {
		set[p] = struct{}{}
	}
	return func(c *gin.Context) {
		peran, ok := PeranDari(c)
		if !ok {
			utils.Error(c, http.StatusUnauthorized, "peran_tidak_ada", "Peran tidak ditemukan di token")
			return
		}
		if _, boleh := set[peran]; !boleh {
			utils.Error(c, http.StatusForbidden, "akses_ditolak", "Akses ditolak untuk peran Anda")
			return
		}
		c.Next()
	}
}

// UserIDDari mengambil id pengguna yang sudah divalidasi JWTAuth dari context.
func UserIDDari(c *gin.Context) (uuid.UUID, bool) {
	v, exists := c.Get(CtxUserID)
	if !exists {
		return uuid.Nil, false
	}
	id, ok := v.(uuid.UUID)
	return id, ok
}

// PeranDari mengambil peran pengguna yang sudah divalidasi JWTAuth dari context.
func PeranDari(c *gin.Context) (models.Peran, bool) {
	v, exists := c.Get(CtxPeran)
	if !exists {
		return "", false
	}
	p, ok := v.(models.Peran)
	return p, ok
}
