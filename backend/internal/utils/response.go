package utils

import "github.com/gin-gonic/gin"

// Format response mengikuti kontrak tunggal agar front-end cukup menangani
// dua bentuk payload: sukses (`data`) dan gagal (`error` + `code`).

func OK(c *gin.Context, data any, message string) {
	if message == "" {
		message = "ok"
	}
	c.JSON(200, gin.H{"data": data, "message": message})
}

func Created(c *gin.Context, data any, message string) {
	if message == "" {
		message = "created"
	}
	c.JSON(201, gin.H{"data": data, "message": message})
}

func Error(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": message, "code": code})
}
