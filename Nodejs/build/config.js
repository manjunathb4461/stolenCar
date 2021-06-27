"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpirationTime = exports.frontEndPoint = exports.stolenCarDbUri = exports.accessTokenSecret = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.port = process.env.PORT;
exports.accessTokenSecret = process.env.accessTokenSecret;
exports.stolenCarDbUri = process.env.stolenCarDbUri;
exports.frontEndPoint = process.env.frontEndPoint;
exports.jwtExpirationTime = process.env.jwtExpirationTime;
