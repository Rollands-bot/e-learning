package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string
	AppEnv  string

	CORSAllowedOrigins []string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret      string
	JWTExpireHours int

	UploadDir string

	// Batas ukuran dan format berkas, dipisah antara materi (diunggah dosen)
	// dan pengumpulan tugas (diunggah mahasiswa).
	MaksMateriMB        int
	MaksPengumpulanMB   int
	EkstensiMateri      []string
	EkstensiPengumpulan []string

	// Akun administrator awal. Sistem tidak menyediakan registrasi mandiri,
	// sehingga akun pertama disiapkan melalui seeder saat server dijalankan.
	AdminNama     string
	AdminEmail    string
	AdminPassword string
}

// Nilai bawaan yang hanya boleh dipakai saat pengembangan. Bila masih terpasang
// ketika APP_ENV=production, server menolak berjalan (lihat validasi di bawah).
const (
	jwtSecretBawaan     = "dev-secret-ganti-di-production"
	adminPasswordBawaan = "admin12345"
)

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("info: file .env tidak ditemukan, menggunakan environment variables sistem")
	}

	cfg := &Config{
		AppPort: getEnv("APP_PORT", "8080"),
		AppEnv:  getEnv("APP_ENV", "development"),

		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "elearning_unipi"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret:      getEnv("JWT_SECRET", jwtSecretBawaan),
		JWTExpireHours: getEnvInt("JWT_EXPIRE_HOURS", 24),

		UploadDir: getEnv("UPLOAD_DIR", "./uploads"),

		MaksMateriMB:        getEnvInt("MAKS_MATERI_MB", 25),
		MaksPengumpulanMB:   getEnvInt("MAKS_PENGUMPULAN_MB", 10),
		EkstensiMateri:      splitCSV(getEnv("EKSTENSI_MATERI", ".pdf,.ppt,.pptx,.doc,.docx")),
		EkstensiPengumpulan: splitCSV(getEnv("EKSTENSI_PENGUMPULAN", ".pdf,.doc,.docx,.zip,.rar")),

		AdminNama:     getEnv("ADMIN_NAMA", "Administrator"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@unipem.ac.id"),
		AdminPassword: getEnv("ADMIN_PASSWORD", adminPasswordBawaan),
	}

	cfg.validasi()
	return cfg
}

// validasi menghentikan server bila konfigurasi rahasia masih memakai nilai
// bawaan di lingkungan produksi.
//
// Kegagalan sengaja dibuat keras (log.Fatalf) alih-alih peringatan: JWT secret
// yang dapat ditebak membuat siapa pun mampu memalsukan token untuk peran mana
// pun, dan kegagalan senyap justru akan terbawa sampai sistem dipakai.
func (c *Config) validasi() {
	if c.AppEnv != "production" {
		if c.JWTSecret == jwtSecretBawaan {
			log.Println("PERINGATAN: JWT_SECRET masih bawaan. Ganti sebelum penerapan (openssl rand -base64 48).")
		}
		return
	}

	if c.JWTSecret == jwtSecretBawaan {
		log.Fatal("JWT_SECRET wajib diganti pada APP_ENV=production. Buat dengan: openssl rand -base64 48")
	}
	if len(c.JWTSecret) < 32 {
		log.Fatal("JWT_SECRET terlalu pendek untuk produksi (minimal 32 karakter)")
	}
	if c.AdminPassword == adminPasswordBawaan {
		log.Fatal("ADMIN_PASSWORD wajib diganti pada APP_ENV=production")
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
