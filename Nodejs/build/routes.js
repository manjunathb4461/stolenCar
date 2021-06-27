"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = __importDefault(require("./types"));
const inversify_config_1 = __importDefault(require("./inversify.config"));
const config_1 = require("./config");
var stolenCarDb = inversify_config_1.default.get(types_1.default.stolenCarDb);
var openURLs = [
    "/",
    "/signin",
    "/signup"
];
var copURLs = [
    "/signup",
    "/reportedcars",
    "/resolve",
    "/allcops",
    "/addcop",
];
var carURLs = [
    "/reportstolen",
];
const router = express_1.Router();
router.use(function (request, response, next) {
    console.log(`URL: ${request.url}, BODY: ${JSON.stringify(request.body, null, 4)}`);
    const origin = request.headers["origin"];
    // cors handling
    if (origin === config_1.frontEndPoint)
        response.header("Access-Control-Allow-Origin", origin);
    // pre-flight requests
    if (request.method === "OPTIONS") {
        response.sendStatus(200);
        return;
    }
    // letting common requests pass through
    if (openURLs.includes(request.url)) {
        next();
        return;
    }
    // checking for forbidden(403)
    if (request.headers.authorization) {
        try {
            const user = jsonwebtoken_1.default.verify(request.headers.authorization, config_1.accessTokenSecret);
            response.locals.user = user;
            switch (user.role) {
                case "user": {
                    if (carURLs.includes(request.url)) {
                        response.locals.role = "user";
                        next();
                    }
                    else
                        response.status(403).send();
                    break;
                }
                case "cop": {
                    if (copURLs.includes(request.url)) {
                        response.locals.role = "cop";
                        next();
                    }
                    else
                        response.status(403).send();
                    break;
                }
                default: response.status(403).send("no user role");
            }
        }
        catch (err) {
            console.log(err.toString());
            response.status(401).send("wrong jwt");
        }
    }
    else {
        response.status(401).send("no jwt");
    }
});
router.get("/", function (request, response, next) {
    response.send("Hello world");
});
router.post("/signin", function (request, response, next) {
    stolenCarDb.get_all_users()
        .then(users => {
        const user = users.find(_user => _user.username === request.body.username && _user.password === request.body.password);
        if (user) {
            const accessToken = jsonwebtoken_1.default.sign({ username: user.username, role: user.role }, config_1.accessTokenSecret, { expiresIn: config_1.jwtExpirationTime });
            response.status(200).json({
                accessToken
            });
        }
        else {
            response.status(401).send("invalid user");
        }
    })
        .catch(() => {
        response.status(500).send("error");
    });
    // next()
});
router.post("/signup", function (request, response, next) {
    stolenCarDb.put_user(request.body)
        .then(() => {
        response.status(201).send("created!!!");
    })
        .catch(() => {
        response.status(500).send("error");
    });
    // next()
});
router.get("/reportedcars", function (request, response, next) {
    stolenCarDb.get_all_cars()
        .then(cars => response.status(200).send(cars))
        .catch(() => response.status(500).send("error"));
    // .finally(next)
});
router.post("/reportstolen", function (request, response, next) {
    stolenCarDb.put_car(request.body)
        .then(() => {
        response.status(201).write("created!!! ");
        stolenCarDb.get_available_cops()
            .then(cops => {
            if (cops.length === 0)
                return;
            stolenCarDb.assign_cop_car(cops[0]._id, request.body._id)
                .then(() => response.write(`assgined cop ${cops[0]._id} to car`));
        })
            .then(() => response.end());
    })
        .catch(() => response.status(500).send("error"));
    // .finally(next)
});
router.get("/allcops", function (request, response, next) {
    stolenCarDb.get_all_cops()
        .then((cops => response.status(200).send(cops)))
        .catch(() => response.status(500).send("error"));
    // .finally(next)
});
router.post("/addcop", function (request, response, next) {
    stolenCarDb.put_cop(request.body)
        .then(() => {
        response.status(201).write("created!!! ");
        stolenCarDb.get_free_cars()
            .then(cars => {
            if (cars.length === 0)
                return;
            stolenCarDb.assign_cop_car(request.body.cop_id, cars[0]._id)
                .then(() => response.write(`assgined cop to another car ${cars[0]._id}`));
        })
            .then(() => response.end());
    })
        .catch(() => response.status(500).send("error"));
    // .finally(next)
});
router.post("/resolve", function (request, response, next) {
    const car_id = request.body._id;
    const cop_id = request.body.cop_id;
    stolenCarDb.complete_assignment(cop_id, car_id)
        .then(() => {
        response.status(200).write("resolved!!! ");
        stolenCarDb.get_free_cars()
            .then(cars => {
            if (cars.length === 0)
                return;
            stolenCarDb.assign_cop_car(cop_id, cars[0]._id)
                .then(() => {
                response.write(`assgined cop to another car ${cars[0]._id}`);
            });
        })
            .then(() => response.end());
    })
        .catch(() => response.status(500).send("error resolving"));
    // .finally(next)
});
exports.default = router;
