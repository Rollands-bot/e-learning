package utils

import (
	"errors"
	"time"

	"elearning-unipi/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTClaims memuat identitas pengguna yang dipakai untuk Role-Based Access
// Control (RBAC) sebagaimana ditetapkan pada batasan masalah Bab I.
type JWTClaims struct {
	UserID uuid.UUID    `json:"uid"`
	Email  string       `json:"email"`
	Peran  models.Peran `json:"peran"`
	jwt.RegisteredClaims
}

func GenerateToken(secret string, expireHours int, userID uuid.UUID, email string, peran models.Peran) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Peran:  peran,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "elearning-unipi",
			Subject:   userID.String(),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func ParseToken(secret, tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("metode signing tidak valid")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token tidak valid")
	}
	return claims, nil
}
