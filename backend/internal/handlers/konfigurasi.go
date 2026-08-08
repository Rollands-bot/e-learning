package handlers

import (
	"elearning-unipi/internal/utils"

	"github.com/gin-gonic/gin"
)

type batasUnggah struct {
	MaksMB   int      `json:"maks_mb"`
	Ekstensi []string `json:"ekstensi"`
}

// Konfigurasi — GET /api/konfigurasi
//
// Menyajikan batas ukuran dan format berkas yang berlaku agar front-end tidak
// menyalin ulang aturannya. Back-end tetap menjadi satu-satunya penentu: nilai
// di sini hanya dipakai untuk menyaring berkas lebih awal dan menampilkan
// keterangan pada form, bukan sebagai pengganti validasi saat unggah.
func (h *Handler) Konfigurasi(c *gin.Context) {
	utils.OK(c, gin.H{
		"materi": batasUnggah{
			MaksMB:   h.cfg.MaksMateriMB,
			Ekstensi: h.cfg.EkstensiMateri,
		},
		"pengumpulan": batasUnggah{
			MaksMB:   h.cfg.MaksPengumpulanMB,
			Ekstensi: h.cfg.EkstensiPengumpulan,
		},
	}, "")
}
