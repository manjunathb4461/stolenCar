"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("./types"));
const dao_1 = __importDefault(require("./dao"));
var container = new inversify_1.Container();
container.bind(types_1.default.stolenCarDb).to(dao_1.default);
exports.default = container;
