"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("./models");
const inversify_1 = require("inversify");
const config_1 = require("./config");
let stolenCarDb = class stolenCarDb {
    constructor() {
        // connecting to db
        mongoose_1.default.connect((config_1.stolenCarDbUri), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
        this._stolenCarDb = mongoose_1.default.connection;
        this._stolenCarDb.on("error", function (ref) {
            console.error.bind(console, "Mongoose connection error!");
        });
        this._stolenCarDb.on("open", function () {
            return true;
        });
    }
    get_all_cars() {
        return new Promise(function (resolve, reject) {
            models_1.CarModel.find({}).exec((err, _cars) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve(_cars);
                }
            });
        });
    }
    get_free_cars() {
        return new Promise(function (resolve, reject) {
            models_1.CarModel.find({ resolved: 0, assigned: 0 }).exec((err, _cars) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve(_cars);
                }
            });
        });
    }
    put_car(car) {
        return new Promise(function (resolve, reject) {
            const newCar = new models_1.CarModel(car);
            newCar.save((err, _car) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    console.log(`${_car} saved in db`);
                    resolve();
                }
            });
        });
    }
    get_all_cops() {
        return new Promise(function (resolve, reject) {
            models_1.CopModel.find({}).exec((err, _cops) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve(_cops);
                }
            });
        });
    }
    get_available_cops() {
        return new Promise(function (resolve, reject) {
            models_1.CopModel.find({ available: 1 }).exec((err, _cops) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve(_cops);
                }
            });
        });
    }
    put_cop(cop) {
        return new Promise(function (resolve, reject) {
            const newCop = new models_1.CopModel(cop);
            newCop.save((err, _cop) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }
    assign_cop_car(cop_id, car_id) {
        return new Promise(function (resolve, reject) {
            models_1.CopModel.findOne({ "_id": cop_id }, (cop) => {
                if (cop === null || cop.available !== 1)
                    reject();
            });
            models_1.CarModel.findOne({ "_id": car_id }, (car) => {
                if (car === null || car.resolved !== 0 || car.assigned !== 0)
                    reject();
            });
            models_1.CopModel.updateOne({ "_id": cop_id }, { "available": 0, "car_id": car_id }, (err, _res) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
            });
            models_1.CarModel.updateOne({ "_id": car_id }, { "assigned": 1, "cop_id": cop_id }, (err, _res) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
            });
            resolve();
        });
    }
    complete_assignment(cop_id, car_id) {
        return models_1.CopModel.findOne({ "_id": cop_id }).then((cop) => {
            return new Promise(function (resolve, reject) {
                models_1.CopModel.findOne({ "_id": cop_id }, (cop) => {
                    if (cop === null || cop.available !== 0)
                        reject();
                });
                models_1.CarModel.findOne({ "_id": car_id }, (car) => {
                    if (car === null || car.resolved !== 0 || car.assigned !== 1)
                        reject();
                });
                models_1.CopModel.updateOne({ "_id": cop_id }, { "available": 1, "car_id": "" }, (err, _res) => {
                    if (err) {
                        console.log(err.toString());
                        reject();
                    }
                });
                models_1.CarModel.updateOne({ "_id": car_id }, { "resolved": 1, "assigned": 0, "cop_id": "" }, (err, _res) => {
                    if (err) {
                        console.log(err.toString());
                        reject();
                    }
                });
                resolve();
            });
        });
    }
    put_user(user) {
        return new Promise(function (resolve, reject) {
            const newUser = new models_1.UserModel(user);
            newUser.save((err, _user) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }
    get_all_users() {
        return new Promise(function (resolve, reject) {
            models_1.UserModel.find({}).exec((err, _users) => {
                if (err) {
                    console.log(err.toString());
                    reject();
                }
                else {
                    resolve(_users);
                }
            });
        });
    }
};
stolenCarDb = __decorate([
    inversify_1.injectable()
], stolenCarDb);
exports.default = stolenCarDb;
