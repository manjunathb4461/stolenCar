"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config");
require("dotenv").config();
const app = express_1.default();
/*
import cors from "cors"
app.use(cors())
*/
app.use(express_1.default.json());
app.use(routes_1.default);
app.listen(config_1.port, function () {
    console.log(`listening on port ${config_1.port}`);
});
