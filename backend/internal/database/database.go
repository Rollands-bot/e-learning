package database

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"elearning-unipi/internal/config"
	"elearning-unipi/internal/models"
	"elearning-unipi/internal/utils"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
	)

	gormCfg := &gorm.Config{}
	if cfg.AppEnv == "development" {
		gormCfg.Logger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(dsn), gormCfg)
	if err != nil {
		log.Fatalf("gagal koneksi ke PostgreSQL: %v", err)
	}

	log.Println("✓ koneksi PostgreSQL berhasil")
	return db
}

// AutoMigrate membangun lima tabel sesuai rancangan basis data Sub-bab 4.2.4:
// tiga tabel master (users, mata_kuliah, materi) dan dua tabel transaksi
// (tugas, pengumpulan_tugas).
func AutoMigrate(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.User{},
		&models.MataKuliah{},
		&models.Materi{},
		&models.Tugas{},
		&models.PengumpulanTugas{},
	)
	if err != nil {
		log.Fatalf("gagal auto-migrate: %v", err)
	}
	log.Println("✓ auto-migrate selesai (5 tabel)")
}

// SeedAdministrator menyiapkan akun administrator pertama.
//
// Sistem tidak menyediakan registrasi mandiri — seluruh akun dibuat oleh
// administrator (Tabel 4.4 nomor 2), sehingga akun pertama harus disiapkan
// di luar alur aplikasi. Fungsi ini tidak melakukan apa pun bila sudah ada
// administrator, sehingga aman dipanggil setiap kali server dijalankan.
func SeedAdministrator(db *gorm.DB, cfg *config.Config) {
	var jumlah int64
	if err := db.Model(&models.User{}).Where("peran = ?", models.PeranAdministrator).Count(&jumlah).Error; err != nil {
		log.Fatalf("gagal memeriksa akun administrator: %v", err)
	}
	if jumlah > 0 {
		return
	}

	hash, err := utils.HashPassword(cfg.AdminPassword)
	if err != nil {
		log.Fatalf("gagal membuat hash kata sandi administrator: %v", err)
	}

	admin := models.User{
		Nama:     cfg.AdminNama,
		Email:    strings.ToLower(strings.TrimSpace(cfg.AdminEmail)),
		Password: hash,
		Peran:    models.PeranAdministrator,
		Status:   models.StatusAktif,
	}
	if err := db.Create(&admin).Error; err != nil {
		log.Fatalf("gagal membuat akun administrator awal: %v", err)
	}

	log.Printf("✓ akun administrator awal dibuat: %s (kata sandi dari ADMIN_PASSWORD)", admin.Email)
}

// PelanggaranUnik mendeteksi error unique constraint PostgreSQL (SQLSTATE 23505).
func PelanggaranUnik(err error) bool {
	if err == nil {
		return false
	}
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) {
		return pgErr.SQLState() == "23505"
	}
	return false
}
