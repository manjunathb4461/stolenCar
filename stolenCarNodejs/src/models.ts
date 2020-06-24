import mongoose from "mongoose"
import { ICop, ICar, IUser } from "./interfaces"

export const CopSchema = new mongoose.Schema({
    _id: String,
    available: { type: Number, required: true },
    car_id: { type: String, required: true },
})

export const CarSchema = new mongoose.Schema({
    _id: String,
    color: String,
    model_name: String,
    owner_name: String,
    phone_number: Number,
    resolved: { type: Number, required: true },
    assigned: { type: Number, required: true },
    cop_id: { type: String, required: true },
})

export const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true},
    password: { type: String, required: true},
    role: { type: String, enum: ['user', 'cop']},
    iat: Number
})

CopSchema.pre<ICop>("save", function (next: mongoose.HookNextFunction) {
    this.car_id = ""
    this.available = 1
    next()
})

CarSchema.pre<ICar>("save", function (next: mongoose.HookNextFunction) {
    this.cop_id = ""
    this.resolved = 0
    this.assigned = 0
    next()
})

UserSchema.pre<IUser>("save", function (next: mongoose.HookNextFunction) {
    if (!this.role)
        this.role = ""
    next()
})

export const CopModel = mongoose.model<ICop>("Cop", CopSchema)
export const CarModel = mongoose.model<ICar>("Car", CarSchema)
export const UserModel = mongoose.model<IUser>("User", UserSchema)