# Backend — E-Learning UNIPEM

REST API berbasis Go + Gin + GORM + PostgreSQL.

## Struktur

```
backend/
├── cmd/server/main.go        # entrypoint
├── internal/
│   ├── config/               # baca env
│   ├── database/             # koneksi DB & auto-migrate
│   ├── models/               # GORM models
│   ├── handlers/             # HTTP handlers (auth, health)
│   ├── middleware/           # JWT auth, role guard
│   ├── routes/               # route registration + CORS
│   └── utils/                # password (bcrypt), JWT, response helper
├── uploads/                  # file materi/tugas/submission
├── .env.example
└── go.mod
```

## Setup

```bash
# 1. Install dependency
go mod tidy

# 2. Konfigurasi env
cp .env.example .env
# edit .env, minimal: DB_USER, DB_PASSWORD, JWT_SECRET

# 3. Buat database (di pgAdmin atau psql):
#    CREATE DATABASE elearning_unipem;

# 4. Jalankan
go run cmd/server/main.go
```

Kalau sukses:
```
✓ koneksi PostgreSQL berhasil
✓ auto-migrate selesai
✓ server jalan di http://localhost:8080
```

## Hot Reload (opsional)

Pakai [air](https://github.com/air-verse/air) supaya server restart otomatis saat file diubah:

```bash
go install github.com/air-verse/air@latest
air
```

## Build production

```bash
go build -o bin/server ./cmd/server
APP_ENV=production ./bin/server
```

## Endpoint MVP

| Method | Path                  | Auth         | Body / Param                                |
| ------ | --------------------- | ------------ | ------------------------------------------- |
| GET    | `/health`             | -            | -                                           |
| POST   | `/api/auth/register`  | -            | `{username, email, password, role}`         |
| POST   | `/api/auth/login`     | -            | `{username, password}` → returns `{token}`  |
| GET    | `/api/auth/me`        | Bearer JWT   | -                                           |
| GET    | `/api/admin/ping`     | Bearer JWT (admin) | sample protected endpoint              |

## Test cepat

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","email":"a@b.com","password":"rahasia123","role":"admin"}'

# Login (catat token dari response)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"rahasia123"}' | jq -r .data.token)

# Akses /me
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"

# Akses /admin/ping (admin only)
curl http://localhost:8080/api/admin/ping -H "Authorization: Bearer $TOKEN"
```
