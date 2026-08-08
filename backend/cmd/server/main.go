package main

import (
	"log"

	"elearning-unipi/internal/config"
	"elearning-unipi/internal/database"
	"elearning-unipi/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db := database.Connect(cfg)
	database.AutoMigrate(db)
	database.SeedAdministrator(db, cfg)

	r := gin.Default()
	routes.Register(r, db, cfg)

	addr := ":" + cfg.AppPort
	log.Printf("✓ server jalan di http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server gagal: %v", err)
	}
}
