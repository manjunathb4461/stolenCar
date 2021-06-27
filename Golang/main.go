package main

import (
	"os"
	"log"
	"net/http"
	"github.com/joho/godotenv"
	"github.com/manjunathb4461/stolenCar/routes"
	"github.com/manjunathb4461/stolenCar/db"
)

func main() {
	err := godotenv.Load(); if err != nil {
		log.Fatal("Error loading .env file")
	}
	
	err = db.SetupMongoClient(); if err != nil {
		panic(err)
	}

	log.Println("starting server on port:", os.Getenv("port"))

	if (http.ListenAndServe(":"+os.Getenv("port"), routes.Router)) != nil {
		log.Fatalln("couldn't start server!!!")
	}
}
