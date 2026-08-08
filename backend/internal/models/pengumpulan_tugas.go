package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StatusPengumpulan sesuai kolom `status` pada Tabel 4.19 dan kebutuhan
// fungsional KF-08. Nilai status ditetapkan oleh sistem, bukan oleh pengguna.
type StatusPengumpulan string

const (
	StatusBelum     StatusPengumpulan = "belum"
	StatusTerkumpul StatusPengumpulan = "terkumpul"
	StatusTerlambat StatusPengumpulan = "terlambat"
	StatusDinilai   StatusPengumpulan = "dinilai"
)

// PengumpulanTugas memetakan tabel transaksi `pengumpulan_tugas` (Tabel 4.19).
// `mahasiswa_id` merujuk ke tabel users dengan peran mahasiswa.
type PengumpulanTugas struct {
	ID          uuid.UUID         `gorm:"type:uuid;primaryKey" json:"id"`
	TugasID     uuid.UUID         `gorm:"column:tugas_id;type:uuid;not null;index:idx_pengumpulan_unik,unique" json:"tugas_id"`
	MahasiswaID uuid.UUID         `gorm:"column:mahasiswa_id;type:uuid;not null;index:idx_pengumpulan_unik,unique" json:"mahasiswa_id"`
	Tugas       *Tugas            `gorm:"foreignKey:TugasID;constraint:OnDelete:CASCADE" json:"tugas,omitempty"`
	Mahasiswa   *User             `gorm:"foreignKey:MahasiswaID;constraint:OnDelete:CASCADE" json:"mahasiswa,omitempty"`
	BerkasURL   string            `gorm:"column:berkas_url;type:varchar(255);not null" json:"berkas_url"`
	WaktuKumpul time.Time         `gorm:"column:waktu_kumpul;not null" json:"waktu_kumpul"`
	Status      StatusPengumpulan `gorm:"column:status;type:varchar(20);not null" json:"status"`
	Nilai       *int              `gorm:"column:nilai;type:integer" json:"nilai"`
	UmpanBalik  string            `gorm:"column:umpan_balik;type:text" json:"umpan_balik"`
	DinilaiPada *time.Time        `gorm:"column:dinilai_pada" json:"dinilai_pada"`
}

func (PengumpulanTugas) TableName() string { return "pengumpulan_tugas" }

func (p *PengumpulanTugas) BeforeCreate(*gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// TentukanStatus mengembalikan status pengumpulan berdasarkan perbandingan
// waktu unggah terhadap batas waktu tugas (KF-08).
//
// Status dihitung di sisi server dan tidak pernah menerima masukan dari
// front-end, sehingga nilainya tidak dapat dimanipulasi melalui request.
func TentukanStatus(waktuKumpul, batasWaktu time.Time) StatusPengumpulan {
	if waktuKumpul.After(batasWaktu) {
		return StatusTerlambat
	}
	return StatusTerkumpul
}
