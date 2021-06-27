package db

import (
    "os"
	"log"
    "time"
    "errors"
	"context"
	"sync"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var clientInstance *mongo.Client
var database *mongo.Database
var carsCollection *mongo.Collection
var copsCollection *mongo.Collection
var usersCollection *mongo.Collection

var mongoOnce sync.Once

func SetupMongoClient() (error) {
    var err error
	mongoOnce.Do(func() {
        clientOptions := options.Client().ApplyURI(os.Getenv("stolenCarDbUri"))
        context, _ := context.WithTimeout(context.Background(), 10*time.Second)
        clientInstance, err = mongo.Connect(context, clientOptions)
        database = clientInstance.Database("stolenCarDb")
        carsCollection = database.Collection("cars")
        copsCollection = database.Collection("cops")
        usersCollection = database.Collection("users")
	})
	return err
}

func GetAllCars() ([]Car, error) {
    var cars []Car
    cursor, err := carsCollection.Find(context.TODO(), bson.M{})
    if err != nil {
        panic(err)
    }
    err = cursor.All(context.TODO(), &cars)
    return cars, err
}

func GetFreeCars() ([]Car, error) {
    var cars []Car
    cursor, err := carsCollection.Find(context.TODO(), bson.M{"resolved": 0, "assigned": 0})
    if err != nil {
        panic(err)
    }
    err = cursor.All(context.TODO(), &cars)
    return cars, err
}

func PutCar(car Car) (error) {
    result, err := carsCollection.InsertOne(context.TODO(), car)
    if err == nil {
        log.Println("Inserted successfully: ", result.InsertedID)
    }
    return err
}

func GetAllCops() ([]Car, error) {
    var cops []Car
    cursor, err := copsCollection.Find(context.TODO(), bson.M{})
    if err != nil {
        panic(err)
    }
    err = cursor.All(context.TODO(), &cops)
    return cops, err
}

func GetAvailableCops() ([]Cop, error) {
    var cops []Cop
    cursor, err := copsCollection.Find(context.TODO(), bson.M{"available": 0})
    if err != nil {
        panic(err)
    }
    err = cursor.All(context.TODO(), &cops)
    return cops, err
}

func PutCop(cop Cop) (error) {
    result, err := copsCollection.InsertOne(context.TODO(), cop)
    if err == nil {
        log.Println("Inserted successfully: ", result.InsertedID)
    }
    return err
}

func AssignCopCar(copId string, carId string) (error) {
    var cop Cop
    err := copsCollection.FindOne(context.TODO(), bson.M{"copId": copId}).Decode(&cop)
    if err != nil || cop.Available != 1 {
        return errors.New("Cop already assigned")
    }

    var car Car
    err = carsCollection.FindOne(context.TODO(), bson.M{"carId": carId}).Decode(&car)
    if err != nil || car.Resolved != 0 || car.Assigned != 0 {
        return errors.New("Car already assigned")
    }

    _, err = copsCollection.UpdateByID(context.TODO(), copId, bson.M{ "available": 0, "carId": carId }); if err != nil {
        return err
    }
    _, err = carsCollection.UpdateByID(context.TODO(), carId, bson.M{ "assigned": 1, "copId": copId })
    
    return err
}

func CompleteAssignment(copId string, carId string) (error) {
    var cop Cop
    err := copsCollection.FindOne(context.TODO(), bson.M{"copId": copId}).Decode(&cop)
    if err != nil || cop.Available != 0 {
        return errors.New("Cop already assigned")
    }

    var car Car
    err = carsCollection.FindOne(context.TODO(), bson.M{"carId": carId}).Decode(&car)
    if err != nil || car.Resolved != 0 || car.Assigned != 1 {
        return errors.New("Car already assigned")
    }

    _, err = copsCollection.UpdateByID(context.TODO(), copId, bson.M{ "available": 1, "carId": "" }); if err != nil {
        return err
    }
    _, err = carsCollection.UpdateByID(context.TODO(), carId, bson.M{ "resolved": 1, "assigned": 0, "copId": "" })
    
    return err
}

func GetAllUsers() ([]User, error) {
    var users []User
    cursor, err := usersCollection.Find(context.TODO(), bson.M{})
    if err != nil {
        panic(err)
    }
    err = cursor.All(context.TODO(), &users)
    return users, err
}

func PutUser(user User) (error) {
    result, err := usersCollection.InsertOne(context.TODO(), user)
    if err == nil {
        log.Println("Inserted successfully: ", result.InsertedID)
    }
    return err
}
