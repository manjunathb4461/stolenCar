package routes

import (
	"os"
	"fmt"
	"time"
	"net/http"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/dgrijalva/jwt-go"
	"github.com/manjunathb4461/stolenCar/db"
)

var openURLs = []string{
	"/signin", 
	"/signup",
}
var copURLs = []string{
    "/reportedcars",
    "/resolve",
    "/allcops",
    "/addcop",
}
var carURLs = []string{
    "/reportstolen",
}

func corsHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
        resp.Header().Set("Access-Control-Allow-Origin", os.Getenv("frontEndPoint"))
		resp.Header().Set("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE")
		resp.Header().Set("Access-Control-Max-Age", "86400")
		if req.Method != http.MethodOptions {
			next.ServeHTTP(resp, req)
		}
    })
}

func authHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
		for _, url := range openURLs {
			if url == req.URL.Path {
				next.ServeHTTP(resp, req)
				return
			}
		}
		for _, cookie := range req.Cookies() {
			if cookie.Name == "jwt" {
				token, err := jwt.Parse(cookie.Value, func (token *jwt.Token) (interface {}, error) {
					return os.Getenv("accessTokenSecret"), nil
				})
				if err != nil {
					resp.WriteHeader(http.StatusUnauthorized)
					return
				}
				claims, ok := token.Claims.(jwt.MapClaims)
				if ok && token.Valid {
					switch role := claims["Role"]; role {
					case "User":
						for _, url := range copURLs {
							if url == req.URL.Path {
								next.ServeHTTP(resp, req)
								return
							}
						}
					case "Cop":
						for _, url := range copURLs {
							if url == req.URL.Path {
								next.ServeHTTP(resp, req)
								return
							}
						}
					}
				}
			}
		}
		resp.WriteHeader(http.StatusUnauthorized)
    })
}

func signUp(resp http.ResponseWriter, req *http.Request) {
	var user db.User
	if err := json.NewDecoder(req.Body).Decode(&user); err != nil {
		resp.WriteHeader(http.StatusBadRequest)
	}
	if err := db.PutUser(user); err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
	}
}

func signIn(resp http.ResponseWriter, req *http.Request) {
	var reqUser db.User
	if err := json.NewDecoder(req.Body).Decode(&reqUser); err != nil {
		resp.WriteHeader(http.StatusBadRequest)
		return
	}

	users, err := db.GetAllUsers(); if err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}
	for _, user := range users {
		if user.Uname == reqUser.Uname && user.Passwd == reqUser.Passwd {
			atClaims := jwt.MapClaims{
				"Role": reqUser.Role,
				"Uname": reqUser.Uname,
				"exp": time.Now().Add(time.Second * 180).Unix(),
			}
			at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
			token, err := at.SignedString([]byte(os.Getenv("accessTokenSecret")))
			if err != nil {
				resp.WriteHeader(http.StatusInternalServerError)
				return
			}
			http.SetCookie(resp, &http.Cookie{Name: "jwt", Value:token, HttpOnly: true})
			resp.WriteHeader(http.StatusOK)
			return
		}
	}
	resp.WriteHeader(http.StatusUnauthorized)
}

func reportedCars(resp http.ResponseWriter, req *http.Request) {
	cars, err := db.GetAllCars(); if err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
	} else {
		resp.Header().Set("Content-Type", "application/json")
		json.NewEncoder(resp).Encode(cars)
	}
}

func reportStolen(resp http.ResponseWriter, req *http.Request) {
	car := db.Car{}
	json.NewDecoder(req.Body).Decode(&car)
	if err := db.PutCar(car); err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}
	availableCops, err := db.GetAvailableCops(); if err == nil {
		for _, cop := range(availableCops) {
			if err := db.AssignCopCar(cop.Id, car.Id); err == nil {
				fmt.Fprintf(resp, "assgined cop %s to car %s", cop.Id, car.Id)
				break
			}
		}
	}
}

func allCops(resp http.ResponseWriter, req *http.Request) {
	cops, err := db.GetAllCops(); if err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
	} else {
		resp.Header().Set("Content-Type", "application/json")
		json.NewEncoder(resp).Encode(cops)
	}
}

func addCop(resp http.ResponseWriter, req *http.Request) {
	cop := db.Cop{}
	json.NewDecoder(req.Body).Decode(&cop)
	if err := db.PutCop(cop); err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}
	freeCars, err := db.GetFreeCars(); if err == nil {
		for _, car := range(freeCars) {
			if err := db.AssignCopCar(cop.Id, car.Id); err == nil {
				fmt.Fprintf(resp, "assgined cop %s to car %s", cop.Id, car.Id)
				break
			}
		}
	}
}

func resolve(resp http.ResponseWriter, req *http.Request) {
	var body map[string]string
	json.NewDecoder(req.Body).Decode(&body)
	copId, carId := body["copId"], body["carId"]

	if err := db.CompleteAssignment(copId, carId); err != nil {
		resp.WriteHeader(http.StatusInternalServerError)
		return
	}

	freeCars, err := db.GetFreeCars(); if err == nil {
		for _, car := range(freeCars) {
			if err := db.AssignCopCar(copId, car.Id); err == nil {
				fmt.Fprintf(resp, "assgined cop %s to car %s", copId, car.Id)
				break
			}
		}
	}
}

var Router = mux.NewRouter()

func init(){
	Router.Use(corsHandler)
	Router.Use(authHandler)
	Router.HandleFunc("/signup", signUp).Methods("POST")
	Router.HandleFunc("/signin", signIn).Methods("POST")
	Router.HandleFunc("/reportedcars", reportedCars).Methods("GET")
	Router.HandleFunc("/reportstolen", reportStolen).Methods("POST")
	Router.HandleFunc("/allcops", allCops).Methods("GET")
	Router.HandleFunc("/addcop", addCop).Methods("POST")
	Router.HandleFunc("/resolve", resolve).Methods("POST")
}

