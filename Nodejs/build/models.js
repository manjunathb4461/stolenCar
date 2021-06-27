"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.CarModel = exports.CopModel = exports.UserSchema = exports.CarSchema = exports.CopSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.CopSchema = new mongoose_1.default.Schema({
    _id: String,
    available: { type: Number, required: true },
    car_id: { type: String, required: true },
});
exports.CarSchema = new mongoose_1.default.Schema({
    _id: String,
    color: String,
    model_name: String,
    owner_name: String,
    phone_number: Number,
    resolved: { type: Number, required: true },
    assigned: { type: Number, required: true },
    cop_id: { type: String, required: true },
});
exports.UserSchema = new mongoose_1.default.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'cop'] },
    iat: Number
});
exports.CopSchema.pre("save", function (next) {
    this.car_id = "";
    this.available = 1;
    next();
});
exports.CarSchema.pre("save", function (next) {
    this.cop_id = "";
    this.resolved = 0;
    this.assigned = 0;
    next();
});
exports.UserSchema.pre("save", function (next) {
    if (!this.role)
        this.role = "";
    next();
});
exports.CopModel = mongoose_1.default.model("Cop", exports.CopSchema);
exports.CarModel = mongoose_1.default.model("Car", exports.CarSchema);
exports.UserModel = mongoose_1.default.model("User", exports.UserSchema);
