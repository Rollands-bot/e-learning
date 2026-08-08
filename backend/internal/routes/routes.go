package routes

import (
	"elearning-unipi/internal/config"
	"elearning-unipi/internal/handlers"
	"elearning-unipi/internal/middleware"
	"elearning-unipi/internal/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition"},
		AllowCredentials: true,
	}))

	r.GET("/health", handlers.Health)

	h := handlers.New(db, cfg)
	api := r.Group("/api")

	// --- Publik ---------------------------------------------------------
	// Tidak ada endpoint registrasi: seluruh akun dibuat administrator.
	api.POST("/auth/login", h.Login)

	// --- Terproteksi JWT ------------------------------------------------
	auth := api.Group("")
	auth.Use(middleware.JWTAuth(cfg))
	{
		auth.GET("/auth/me", h.Me)
		auth.POST("/auth/logout", h.Logout)
		auth.GET("/konfigurasi", h.Konfigurasi)

		// Dapat diakses seluruh peran.
		auth.GET("/mata-kuliah", h.DaftarMataKuliah)
		auth.GET("/mata-kuliah/:id", h.DetailMataKuliah)
		auth.GET("/mata-kuliah/:id/materi", h.DaftarMateri)
		auth.GET("/mata-kuliah/:id/tugas", h.DaftarTugas)
		auth.GET("/materi/:id/unduh", h.UnduhMateri)
		auth.GET("/pengumpulan/:id/unduh", h.UnduhPengumpulan)
	}

	// --- Administrator --------------------------------------------------
	admin := api.Group("")
	admin.Use(middleware.JWTAuth(cfg), middleware.RequirePeran(models.PeranAdministrator))
	{
		admin.GET("/pengguna", h.DaftarPengguna)
		admin.POST("/pengguna", h.BuatPengguna)
		admin.GET("/pengguna/:id", h.DetailPengguna)
		admin.PUT("/pengguna/:id", h.UbahPengguna)
		admin.DELETE("/pengguna/:id", h.HapusPengguna)

		admin.POST("/mata-kuliah", h.BuatMataKuliah)
		admin.PUT("/mata-kuliah/:id", h.UbahMataKuliah)
		admin.DELETE("/mata-kuliah/:id", h.HapusMataKuliah)
	}

	// --- Dosen (dan administrator) --------------------------------------
	// Kepemilikan mata kuliah diperiksa lagi di dalam handler, sehingga dosen
	// hanya dapat mengubah mata kuliah yang benar-benar diampunya.
	dosen := api.Group("")
	dosen.Use(middleware.JWTAuth(cfg), middleware.RequirePeran(models.PeranDosen, models.PeranAdministrator))
	{
		dosen.POST("/mata-kuliah/:id/materi", h.UnggahMateri)
		dosen.PUT("/materi/:id", h.UbahMateri)
		dosen.DELETE("/materi/:id", h.HapusMateri)

		dosen.POST("/mata-kuliah/:id/tugas", h.BuatTugas)
		dosen.PUT("/tugas/:id", h.UbahTugas)
		dosen.DELETE("/tugas/:id", h.HapusTugas)

		dosen.GET("/tugas/:id/pengumpulan", h.DaftarPengumpulan)
		dosen.PUT("/pengumpulan/:id/nilai", h.BeriNilai)
		dosen.GET("/mata-kuliah/:id/rekap-nilai", h.RekapNilaiMataKuliah)
	}

	// --- Mahasiswa ------------------------------------------------------
	mahasiswa := api.Group("")
	mahasiswa.Use(middleware.JWTAuth(cfg), middleware.RequirePeran(models.PeranMahasiswa))
	{
		mahasiswa.POST("/tugas/:id/pengumpulan", h.KumpulkanTugas)
		mahasiswa.GET("/tugas/:id/pengumpulan-saya", h.PengumpulanSaya)
		mahasiswa.GET("/saya/nilai", h.NilaiSaya)
	}
}
