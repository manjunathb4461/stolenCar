import mongoose from "mongoose"
import { ICop, ICar, IstolenCarDb, IUser } from "./interfaces"
import { CarModel, CopModel, UserModel } from "./models"
import { injectable } from "inversify"
import { stolenCarDbUri } from "./config"

@injectable()
export default class stolenCarDb implements IstolenCarDb {
    public _stolenCarDb: mongoose.Connection

    constructor() {
        // connecting to db
        mongoose.connect((stolenCarDbUri), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        this._stolenCarDb = mongoose.connection
        this._stolenCarDb.on("error", function (ref) {
            console.error.bind(console, "Mongoose connection error!")
        })
        this._stolenCarDb.on("open", function () {
            return true
        })
    }

    public get_all_cars(): Promise<ICar[]> {
        return new Promise<ICar[]>(function (resolve, reject) {
            CarModel.find({}).exec((err: any, _cars: ICar[]) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve(_cars)
                }
            })
        })
    }

    public get_free_cars(): Promise<ICar[]> {
        return new Promise<ICar[]>(function (resolve, reject) {
            CarModel.find({ resolved: 0, assigned: 0 }).exec((err, _cars: ICar[]) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve(_cars)
                }
            })
        })
    }

    public put_car(car: ICar): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            const newCar = new CarModel(car)
            newCar.save((err: any, _car: ICar) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    console.log(`${_car} saved in db`)
                    resolve()
                }
            })
        })
    }

    public get_all_cops(): Promise<ICop[]> {
        return new Promise<ICop[]>(function (resolve, reject) {
            CopModel.find({}).exec((err, _cops: ICop[]) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve(_cops)
                }
            })
        })
    }

    public get_available_cops(): Promise<ICop[]> {
        return new Promise<ICop[]>(function (resolve, reject) {
            CopModel.find({ available: 1 }).exec((err, _cops: ICop[]) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve(_cops)
                }
            })
        })
    }

    public put_cop(cop: ICop): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            const newCop = new CopModel(cop)
            newCop.save((err, _cop: ICop) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve()
                }
            })
        })
    }

    public assign_cop_car(cop_id: string, car_id: string): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            CopModel.findOne({ "_id": cop_id }, (cop: ICop | null) => {
                if (cop === null || cop.available !== 1) reject()
            })
            CarModel.findOne({ "_id": car_id }, (car: ICar | null) => {
                if (car === null || car.resolved !== 0 || car.assigned !== 0) reject()
            })

            CopModel.updateOne({ "_id": cop_id }, { "available": 0, "car_id": car_id }, (err, _res) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
            })
            CarModel.updateOne({ "_id": car_id }, { "assigned": 1, "cop_id": cop_id }, (err, _res) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
            })

            resolve()
        })
    }

    public complete_assignment(cop_id: string, car_id: string): Promise<void> {
        return CopModel.findOne({ "_id": cop_id }).then((cop: ICop | null) => {
            return new Promise<void>(function (resolve, reject) {
                CopModel.findOne({ "_id": cop_id }, (cop: ICop | null) => {
                    if (cop === null || cop.available !== 0) reject()
                })
                CarModel.findOne({ "_id": car_id }, (car: ICar | null) => {
                    if (car === null || car.resolved !== 0 || car.assigned !== 1) reject()
                })

                CopModel.updateOne({ "_id": cop_id }, { "available": 1, "car_id": "" }, (err, _res) => {
                    if (err) {
                        console.log(err.toString())
                        reject()
                    }
                })
                CarModel.updateOne({ "_id": car_id }, { "resolved": 1, "assigned": 0, "cop_id": "" }, (err, _res) => {
                    if (err) {
                        console.log(err.toString())
                        reject()
                    }
                })

                resolve()
            })
        })
    }

    public put_user(user: IUser): Promise<void> {
        return new Promise<void>(function (resolve, reject) {
            const newUser = new UserModel(user)
            newUser.save((err, _user: IUser) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve()
                }
            })
        })
    }

    public get_all_users(): Promise<IUser[]> {
        return new Promise<IUser[]>(function (resolve, reject) {
            UserModel.find({}).exec((err: any, _users: IUser[]) => {
                if (err) {
                    console.log(err.toString())
                    reject()
                }
                else {
                    resolve(_users)
                }
            })
        })
    }
}
