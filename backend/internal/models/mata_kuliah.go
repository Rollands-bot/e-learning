package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MataKuliah memetakan tabel master `mata_kuliah` (Tabel 4.16).
// `dosen_id` merujuk ke tabel users dengan peran dosen (dosen pengampu).
type MataKuliah struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Kode       string     `gorm:"column:kode;type:varchar(10);uniqueIndex;not null" json:"kode"`
	Nama       string     `gorm:"column:nama;type:varchar(100);not null" json:"nama"`
	SKS        int        `gorm:"column:sks;type:integer;not null;default:2" json:"sks"`
	Semester   int        `gorm:"column:semester;type:integer;index" json:"semester"`
	DosenID    *uuid.UUID `gorm:"column:dosen_id;type:uuid;index" json:"dosen_id"`
	Dosen      *User      `gorm:"foreignKey:DosenID;constraint:OnDelete:SET NULL" json:"dosen,omitempty"`
	DibuatPada time.Time  `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuat_pada"`
}

func (MataKuliah) TableName() string { return "mata_kuliah" }

func (m *MataKuliah) BeforeCreate(*gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
