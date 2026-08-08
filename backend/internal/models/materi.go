package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Materi memetakan tabel master `materi` (Tabel 4.17).
// `ukuran_berkas` disimpan dalam satuan kilobita (KB) sesuai keterangan tabel.
type Materi struct {
	ID           uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	MataKuliahID uuid.UUID   `gorm:"column:mata_kuliah_id;type:uuid;not null;index" json:"mata_kuliah_id"`
	MataKuliah   *MataKuliah `gorm:"foreignKey:MataKuliahID;constraint:OnDelete:CASCADE" json:"mata_kuliah,omitempty"`
	Judul        string      `gorm:"column:judul;type:varchar(150);not null" json:"judul"`
	Deskripsi    string      `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	BerkasURL    string      `gorm:"column:berkas_url;type:varchar(255);not null" json:"berkas_url"`
	UkuranBerkas int         `gorm:"column:ukuran_berkas;type:integer" json:"ukuran_berkas"`
	DiunggahPada time.Time   `gorm:"column:diunggah_pada;autoCreateTime" json:"diunggah_pada"`
}

func (Materi) TableName() string { return "materi" }

func (m *Materi) BeforeCreate(*gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
