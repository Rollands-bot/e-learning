package handlers

import (
	"net/http"

	"elearning-unipi/internal/config"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Handler menampung dependensi bersama seluruh handler HTTP.
type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func New(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

// paramUUID membaca parameter path bertipe UUID dan langsung membalas 400
// bila formatnya tidak valid. Mengembalikan false bila request sudah dibatalkan.
func paramUUID(c *gin.Context, nama string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(nama))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "id_tidak_valid", "Format id tidak valid")
		return uuid.Nil, false
	}
	return id, true
}

// muatTugas mengambil tugas beserta mata kuliahnya, dipakai untuk memeriksa
// kepemilikan dosen pengampu sebelum mengizinkan aksi pada tugas tersebut.
func (h *Handler) muatTugas(id uuid.UUID) (*models.Tugas, error) {
	var tugas models.Tugas
	err := h.db.Preload("MataKuliah").First(&tugas, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &tugas, nil
}

// bolehKelolaMataKuliah menentukan apakah pengguna berhak mengubah isi sebuah
// mata kuliah. Administrator berhak atas seluruh mata kuliah, sedangkan dosen
// hanya atas mata kuliah yang diampunya (Tabel 4.3).
func bolehKelolaMataKuliah(peran models.Peran, userID uuid.UUID, mk *models.MataKuliah) bool {
	switch peran {
	case models.PeranAdministrator:
		return true
	case models.PeranDosen:
		return mk != nil && mk.DosenID != nil && *mk.DosenID == userID
	default:
		return false
	}
}
