import express, { Router } from "express"
import { IstolenCarDb, IUser } from "./interfaces"
import jwt from "jsonwebtoken"
import TYPES from "./types"
import container from "./inversify.config"
import { accessTokenSecret, frontEndPoint, jwtExpirationTime } from "./config"

var stolenCarDb: IstolenCarDb = container.get<IstolenCarDb>(TYPES.stolenCarDb)
var openURLs: string[] = [
    "/",
    "/signin",
    "/signup"
]
var copURLs: string[] = [
    "/signup",
    "/reportedcars",
    "/resolve",
    "/allcops",
    "/addcop",
]
var carURLs: string[] = [
    "/reportstolen",
]

const router: express.Router = Router()

router.use(function (request: express.Request, response: express.Response, next: express.NextFunction) {
    console.log(`URL: ${request.url}, BODY: ${JSON.stringify(request.body, null, 4)}`)

    const origin: string = request.headers["origin"] as string
    // cors handling
    if (origin === frontEndPoint)
        response.header("Access-Control-Allow-Origin", origin)

    // pre-flight requests
    if (request.method === "OPTIONS") {
        response.sendStatus(200)
        return
    }

    // letting common requests pass through
    if (openURLs.includes(request.url)) {
        next()
        return
    }

    // checking for forbidden(403)
    if (request.headers.authorization) {
        try {
            const user: IUser = <IUser>jwt.verify(request.headers.authorization, accessTokenSecret)
            response.locals.user = user
            switch (user.role) {
                case "user": {
                    if (carURLs.includes(request.url)) {
                        response.locals.role = "user"
                        next()
                    }
                    else response.status(403).send()
                    break
                }
                case "cop": {
                    if (copURLs.includes(request.url)) {
                        response.locals.role = "cop"
                        next()
                    }
                    else response.status(403).send()
                    break
                }
                default: response.status(403).send("no user role")
            }
        }
        catch (err) {
            console.log(err.toString())
            response.status(401).send("wrong jwt")
        }
    }
    else {
        response.status(401).send("no jwt")
    }
})

router.get("/", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    response.send("Hello world")
})

router.post("/signin", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.get_all_users()
        .then(users => {
            const user = users.find(_user => _user.username === request.body.username && _user.password === request.body.password)
            if (user) {
                const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: jwtExpirationTime })
                response.status(200).json({
                    accessToken
                })
            }
            else {
                response.status(401).send("invalid user")
            }
        })
        .catch(() => {
            response.status(500).send("error")
        })
    // next()
})

router.post("/signup", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.put_user(request.body)
        .then(() => {
            response.status(201).send("created!!!")
        })
        .catch(() => {
            response.status(500).send("error")
        })
    // next()
})


router.get("/reportedcars", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.get_all_cars()
        .then(cars => response.status(200).send(cars))
        .catch(() => response.status(500).send("error"))
    // .finally(next)
})

router.post("/reportstolen", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.put_car(request.body)
        .then(() => {
            response.status(201).write("created!!! ")
            stolenCarDb.get_available_cops()
                .then(cops => {
                    if (cops.length === 0) return
                    stolenCarDb.assign_cop_car(cops[0]._id, request.body._id)
                        .then(() => response.write(`assgined cop ${cops[0]._id} to car`))
                })
                .then(() => response.end())
        })
        .catch(() => response.status(500).send("error"))
    // .finally(next)
})

router.get("/allcops", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.get_all_cops()
        .then((cops => response.status(200).send(cops)))
        .catch(() => response.status(500).send("error"))
    // .finally(next)
})

router.post("/addcop", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    stolenCarDb.put_cop(request.body)
        .then(() => {
            response.status(201).write("created!!! ")
            stolenCarDb.get_free_cars()
                .then(cars => {
                    if (cars.length === 0) return
                    stolenCarDb.assign_cop_car(request.body.cop_id, cars[0]._id)
                        .then(() => response.write(`assgined cop to another car ${cars[0]._id}`))
                })
                .then(() => response.end())
        })
        .catch(() => response.status(500).send("error"))
    // .finally(next)
})

router.post("/resolve", function (request: express.Request, response: express.Response, next: express.NextFunction) {
    const car_id: string = request.body._id
    const cop_id: string = request.body.cop_id

    stolenCarDb.complete_assignment(cop_id, car_id)
        .then(() => {
            response.status(200).write("resolved!!! ")
            stolenCarDb.get_free_cars()
                .then(cars => {
                    if (cars.length === 0) return
                    stolenCarDb.assign_cop_car(cop_id, cars[0]._id)
                        .then(() => {
                            response.write(`assgined cop to another car ${cars[0]._id}`)
                        })
                })
                .then(() => response.end())
        })
        .catch(() => response.status(500).send("error resolving"))
    // .finally(next)
})

export default router