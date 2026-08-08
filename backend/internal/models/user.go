package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Peran pengguna sesuai kolom `peran` pada Tabel 4.15 Struktur Tabel Users.
type Peran string

const (
	PeranAdministrator Peran = "administrator"
	PeranDosen         Peran = "dosen"
	PeranMahasiswa     Peran = "mahasiswa"
)

// StatusPengguna sesuai kolom `status` pada Tabel 4.15.
type StatusPengguna string

const (
	StatusAktif    StatusPengguna = "aktif"
	StatusNonaktif StatusPengguna = "nonaktif"
)

// User memetakan tabel master `users` (Tabel 4.15).
// Data mahasiswa dan dosen disatukan di tabel ini; pembeda keduanya adalah
// kolom `peran`, sedangkan `nomor_induk` menampung NIM (mahasiswa) atau NIDN (dosen).
type User struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Nama           string         `gorm:"column:nama;type:varchar(100);not null" json:"nama"`
	Email          string         `gorm:"column:email;type:varchar(100);uniqueIndex;not null" json:"email"`
	Password       string         `gorm:"column:password;type:varchar(255);not null" json:"-"`
	Peran          Peran          `gorm:"column:peran;type:varchar(15);not null;index" json:"peran"`
	NomorInduk     string         `gorm:"column:nomor_induk;type:varchar(20);index" json:"nomor_induk"`
	Status         StatusPengguna `gorm:"column:status;type:varchar(10);not null;default:aktif" json:"status"`
	DibuatPada     time.Time      `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuat_pada"`
	DiperbaruiPada time.Time      `gorm:"column:diperbarui_pada;autoUpdateTime" json:"diperbarui_pada"`
}

func (User) TableName() string { return "users" }

func (u *User) BeforeCreate(*gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// PeranValid memastikan nilai peran berada dalam enum yang diizinkan.
// Dipakai untuk memvalidasi parameter kueri yang tidak melewati binding Gin.
func PeranValid(p Peran) bool {
	switch p {
	case PeranAdministrator, PeranDosen, PeranMahasiswa:
		return true
	}
	return false
}
