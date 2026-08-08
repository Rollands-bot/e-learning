package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// ErrBerkas membedakan kesalahan validasi berkas (400) dari kesalahan sistem (500)
// sehingga handler dapat memberikan pesan yang tepat kepada pengguna.
type ErrBerkas struct {
	Kode  string
	Pesan string
}

func (e *ErrBerkas) Error() string { return e.Pesan }

// ekstensiCocok memeriksa apakah ekstensi berkas termasuk daftar yang diizinkan.
// Perbandingan dilakukan case-insensitive agar "Materi.PDF" tetap diterima.
func ekstensiCocok(namaBerkas string, daftar []string) bool {
	ext := strings.ToLower(filepath.Ext(namaBerkas))
	for _, d := range daftar {
		if ext == strings.ToLower(d) {
			return true
		}
	}
	return false
}

// SimpanBerkas memvalidasi lalu menentukan lokasi penyimpanan berkas unggahan.
//
// Nama berkas di disk diganti UUID acak dengan ekstensi asli dipertahankan. Ini
// mencegah path traversal (nama seperti "../../.env" jadi tidak berarti) sekaligus
// menghindari tabrakan nama antar pengguna.
//
// Mengembalikan path relatif untuk kolom `berkas_url` dan ukuran berkas dalam
// kilobita (KB) sesuai keterangan Tabel 4.17.
func SimpanBerkas(
	berkas *multipart.FileHeader,
	dirDasar, subDir string,
	maksMB int,
	ekstensiDiizinkan []string,
) (pathRelatif string, ukuranKB int, err error) {
	if berkas == nil {
		return "", 0, &ErrBerkas{Kode: "berkas_kosong", Pesan: "Berkas belum dipilih"}
	}

	maksBytes := int64(maksMB) * 1024 * 1024
	if berkas.Size > maksBytes {
		return "", 0, &ErrBerkas{
			Kode:  "berkas_terlalu_besar",
			Pesan: fmt.Sprintf("Ukuran berkas melebihi batas %d MB", maksMB),
		}
	}

	namaAsli := filepath.Base(berkas.Filename)
	if !ekstensiCocok(namaAsli, ekstensiDiizinkan) {
		return "", 0, &ErrBerkas{
			Kode:  "format_tidak_diizinkan",
			Pesan: fmt.Sprintf("Format berkas tidak diizinkan. Format yang diterima: %s", strings.Join(ekstensiDiizinkan, ", ")),
		}
	}

	if err := os.MkdirAll(filepath.Join(dirDasar, subDir), 0o755); err != nil {
		return "", 0, fmt.Errorf("gagal menyiapkan direktori unggahan: %w", err)
	}

	pathRelatif = filepath.Join(subDir, uuid.NewString()+strings.ToLower(filepath.Ext(namaAsli)))

	// Pembulatan ke atas: berkas 1 byte tetap tercatat 1 KB, bukan 0 KB.
	ukuranKB = int((berkas.Size + 1023) / 1024)

	return pathRelatif, ukuranKB, nil
}

// HapusBerkas menghapus berkas fisik. Berkas yang sudah tidak ada dianggap sukses
// agar penghapusan baris basis data tidak ikut gagal karenanya.
func HapusBerkas(dirDasar, pathRelatif string) error {
	if pathRelatif == "" {
		return nil
	}
	err := os.Remove(filepath.Join(dirDasar, pathRelatif))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
