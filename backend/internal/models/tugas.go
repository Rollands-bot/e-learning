package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Tugas memetakan tabel transaksi `tugas` (Tabel 4.18).
// `nilai_maksimum` menjadi batas atas nilai yang boleh diberikan dosen
// pada saat penilaian (lihat skenario pengujian Tabel 3.9 nomor 12).
type Tugas struct {
	ID            uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	MataKuliahID  uuid.UUID   `gorm:"column:mata_kuliah_id;type:uuid;not null;index" json:"mata_kuliah_id"`
	MataKuliah    *MataKuliah `gorm:"foreignKey:MataKuliahID;constraint:OnDelete:CASCADE" json:"mata_kuliah,omitempty"`
	Judul         string      `gorm:"column:judul;type:varchar(150);not null" json:"judul"`
	Deskripsi     string      `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	BatasWaktu    time.Time   `gorm:"column:batas_waktu;not null;index" json:"batas_waktu"`
	NilaiMaksimum int         `gorm:"column:nilai_maksimum;type:integer;not null;default:100" json:"nilai_maksimum"`
	DibuatPada    time.Time   `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuat_pada"`
}

func (Tugas) TableName() string { return "tugas" }

func (t *Tugas) BeforeCreate(*gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
