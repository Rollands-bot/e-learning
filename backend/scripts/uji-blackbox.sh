#!/bin/bash
# Pengujian Black Box sesuai Tabel 3.9 Rancangan Pengujian.
API=http://localhost:8080/api
TMP=$(mktemp -d)
LULUS=0; GAGAL=0

cek() { # cek <no> <modul> <skenario> <diharapkan> <aktual>
  if [ "$4" = "$5" ]; then
    printf "  ✓ %-2s %-22s %-46s → %s\n" "$1" "$2" "$3" "$5"; LULUS=$((LULUS+1))
  else
    printf "  ✗ %-2s %-22s %-46s → harap:%s dapat:%s\n" "$1" "$2" "$3" "$4" "$5"; GAGAL=$((GAGAL+1))
  fi
}
kode() { curl -s -o "$TMP/body" -w "%{http_code}" "$@"; }
body() { cat "$TMP/body"; }

echo "════ PENGUJIAN BLACK BOX — Tabel 3.9 ════"

# 1 & 2 — Autentikasi
S=$(kode -X POST $API/auth/login -H 'Content-Type: application/json' \
     -d '{"email":"admin@unipem.ac.id","password":"admin12345"}')
ADMIN=$(body | jq -r '.data.token'); PERAN=$(body | jq -r '.data.user.peran')
cek 1 "Autentikasi" "surel & kata sandi benar → peran=$PERAN" "200" "$S"

S=$(kode -X POST $API/auth/login -H 'Content-Type: application/json' \
     -d '{"email":"admin@unipem.ac.id","password":"salahbanget"}')
cek 2 "Autentikasi" "kata sandi salah ditolak" "401" "$S"
S=$(kode -X POST $API/auth/login -H 'Content-Type: application/json' -d '{"email":"","password":""}')
cek 2 "Autentikasi" "field dikosongkan ditolak" "400" "$S"

# 3 — Pengelolaan Pengguna
S=$(kode -X POST $API/pengguna -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
     -d '{"nama":"Dr. Budi Santoso","email":"budi@unipem.ac.id","password":"dosen12345","peran":"dosen","nomor_induk":"0412088503"}')
DOSEN_ID=$(body | jq -r '.data.id')
cek 3 "Pengelolaan Pengguna" "tambah dosen" "201" "$S"

S=$(kode -X POST $API/pengguna -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
     -d '{"nama":"Siti Rahayu","email":"siti@student.unipem.ac.id","password":"mhs12345678","peran":"mahasiswa","nomor_induk":"2023804163"}')
MHS_ID=$(body | jq -r '.data.id')
cek 3 "Pengelolaan Pengguna" "tambah mahasiswa" "201" "$S"

S=$(kode -X PUT $API/pengguna/$MHS_ID -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
     -d '{"nama":"Siti Rahayu Putri"}')
cek 3 "Pengelolaan Pengguna" "ubah nama → $(body | jq -r '.data.nama')" "200" "$S"

S=$(kode -X POST $API/pengguna -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
     -d '{"nama":"Akun Uji Hapus","email":"hapus@unipem.ac.id","password":"hapus12345","peran":"mahasiswa"}')
HAPUS_ID=$(body | jq -r '.data.id')
S=$(kode -X DELETE $API/pengguna/$HAPUS_ID -H "Authorization: Bearer $ADMIN")
cek 3 "Pengelolaan Pengguna" "hapus pengguna" "200" "$S"

# 4 — Mata Kuliah
S=$(kode -X POST $API/mata-kuliah -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
     -d "{\"kode\":\"SI-401\",\"nama\":\"Rekayasa Perangkat Lunak\",\"sks\":3,\"semester\":6,\"dosen_id\":\"$DOSEN_ID\"}")
MK_ID=$(body | jq -r '.data.id')
cek 4 "Pengelolaan Mata Kuliah" "tambah MK + dosen=$(body | jq -r '.data.dosen.nama')" "201" "$S"

DOSEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
        -d '{"email":"budi@unipem.ac.id","password":"dosen12345"}' | jq -r '.data.token')
MHS=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
      -d '{"email":"siti@student.unipem.ac.id","password":"mhs12345678"}' | jq -r '.data.token')

# 5, 6, 7 — Materi
printf '%%PDF-1.4 materi uji pertemuan 1' > "$TMP/materi.pdf"
printf 'MZ program jahat' > "$TMP/virus.exe"

S=$(kode -X POST $API/mata-kuliah/$MK_ID/materi -H "Authorization: Bearer $DOSEN" \
     -F "judul=Pertemuan 1 - Pengantar RPL" -F "deskripsi=Materi pembuka" -F "berkas=@$TMP/materi.pdf")
MATERI_ID=$(body | jq -r '.data.id'); KB=$(body | jq -r '.data.ukuran_berkas')
cek 5 "Materi" "unggah .pdf tersimpan ($KB KB)" "201" "$S"

S=$(kode -X POST $API/mata-kuliah/$MK_ID/materi -H "Authorization: Bearer $DOSEN" \
     -F "judul=Berkas Terlarang" -F "berkas=@$TMP/virus.exe")
cek 6 "Materi" "unggah .exe ditolak: $(body | jq -r '.code')" "400" "$S"

S=$(kode -X GET $API/materi/$MATERI_ID/unduh -H "Authorization: Bearer $MHS")
cek 7 "Materi" "mahasiswa unduh berkas" "200" "$S"

# 8 — Tugas
BESOK=$(date -u -v+7d '+%Y-%m-%dT%H:%M:%SZ')
S=$(kode -X POST $API/mata-kuliah/$MK_ID/tugas -H "Authorization: Bearer $DOSEN" -H 'Content-Type: application/json' \
     -d "{\"judul\":\"Tugas 1 - Studi Kasus UML\",\"deskripsi\":\"Buat use case diagram\",\"batas_waktu\":\"$BESOK\",\"nilai_maksimum\":100}")
TUGAS_ID=$(body | jq -r '.data.id')
cek 8 "Tugas" "buat tugas (nilai maks $(body | jq -r '.data.nilai_maksimum'))" "201" "$S"

KEMARIN=$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ')
S=$(kode -X POST $API/mata-kuliah/$MK_ID/tugas -H "Authorization: Bearer $DOSEN" -H 'Content-Type: application/json' \
     -d "{\"judul\":\"Tugas 2 - Sudah Lewat\",\"deskripsi\":\"Deadline kemarin\",\"batas_waktu\":\"$KEMARIN\",\"nilai_maksimum\":50}")
TUGAS_LEWAT=$(body | jq -r '.data.id')

# 9 & 10 — Pengumpulan
printf '%%PDF-1.4 jawaban tugas 1' > "$TMP/jawaban.pdf"
S=$(kode -X POST $API/tugas/$TUGAS_ID/pengumpulan -H "Authorization: Bearer $MHS" -F "berkas=@$TMP/jawaban.pdf")
KUMPUL_ID=$(body | jq -r '.data.id'); ST=$(body | jq -r '.data.status')
cek 9 "Pengumpulan Tugas" "sebelum batas waktu → status=$ST" "terkumpul" "$ST"

S=$(kode -X POST $API/tugas/$TUGAS_LEWAT/pengumpulan -H "Authorization: Bearer $MHS" -F "berkas=@$TMP/jawaban.pdf")
ST=$(body | jq -r '.data.status')
cek 10 "Pengumpulan Tugas" "setelah batas waktu → status=$ST" "terlambat" "$ST"

# 12 — Nilai melebihi maksimum (diuji sebelum 11 karena 11 mengunci status)
S=$(kode -X PUT $API/pengumpulan/$KUMPUL_ID/nilai -H "Authorization: Bearer $DOSEN" -H 'Content-Type: application/json' \
     -d '{"nilai":150,"umpan_balik":"melebihi batas"}')
cek 12 "Penilaian" "nilai 150 > maks 100 ditolak: $(body | jq -r '.code')" "400" "$S"

# 11 — Penilaian sah
S=$(kode -X PUT $API/pengumpulan/$KUMPUL_ID/nilai -H "Authorization: Bearer $DOSEN" -H 'Content-Type: application/json' \
     -d '{"nilai":88,"umpan_balik":"Diagram sudah tepat, perbaiki relasi include."}')
ST=$(body | jq -r '.data.status')
cek 11 "Penilaian" "nilai 88 tersimpan → status=$ST" "dinilai" "$ST"

# 13 — Halaman nilai mahasiswa
S=$(kode -X GET $API/saya/nilai -H "Authorization: Bearer $MHS")
RATA=$(body | jq -r '.data[0].rata_rata')
# Ambil baris yang sudah dinilai, bukan baris pertama: daftar diurutkan
# batas_waktu ASC sehingga tugas yang lewat deadline justru berada di depan.
UB=$(body | jq -r '[.data[].daftar[] | select(.status=="dinilai")][0].umpan_balik')
cek 13 "Nilai Mahasiswa" "rekap nilai tampil (rata-rata=$RATA)" "200" "$S"
ADA_UB=tidak; [ -n "$UB" ] && [ "$UB" != "null" ] && ADA_UB=ada
cek 13 "Nilai Mahasiswa" "umpan balik dosen terbaca mahasiswa" "ada" "$ADA_UB"

# 14 — Hak akses
S=$(kode -X GET $API/pengguna -H "Authorization: Bearer $MHS")
cek 14 "Hak Akses" "mahasiswa akses menu admin: $(body | jq -r '.code')" "403" "$S"
S=$(kode -X POST $API/mata-kuliah -H "Authorization: Bearer $DOSEN" -H 'Content-Type: application/json' \
     -d '{"kode":"XX-1","nama":"Ilegal","sks":2}')
cek 14 "Hak Akses" "dosen buat mata kuliah ditolak" "403" "$S"
S=$(kode -X GET $API/auth/me)
cek 14 "Hak Akses" "tanpa token ditolak" "401" "$S"

# Tambahan: daftar pengumpulan sisi dosen
S=$(kode -X GET $API/tugas/$TUGAS_ID/pengumpulan -H "Authorization: Bearer $DOSEN")
JML=$(body | jq -r '.data.daftar | length')
cek "9b" "Pengumpulan Tugas" "dosen lihat daftar ($JML mahasiswa)" "200" "$S"

echo
echo "════ HASIL: $LULUS valid, $GAGAL tidak valid ════"
rm -rf "$TMP"
[ $GAGAL -eq 0 ]
