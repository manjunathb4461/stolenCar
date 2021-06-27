import mongoose, { Document } from "mongoose"

export interface ICop extends Document {
    _id: string,
    available: number,
    car_id: string
}

export interface ICar extends Document {
    _id: string,
    color?: string,
    model_name?: string,
    owner_name?: string,
    phone_number?: number,
    resolved: number,
    assigned: number,
    cop_id: string
}

export interface IUser extends Document{
    username: string,
    password?: string,
    role: string,
    iat?: number
}

export interface IstolenCarDb {
    _stolenCarDb: mongoose.Connection,
    get_all_cars(): Promise<ICar[]>,
    get_free_cars(): Promise<ICar[]>,
    put_car(car: ICar): Promise<void>,
    get_all_cops(): Promise<ICop[]>,
    get_available_cops(): Promise<ICop[]>,
    put_cop(cop: ICop): Promise<void>,
    assign_cop_car(cop_id: string, car_id: string): Promise<void>,
    complete_assignment(cop_id: string, car_id: string): Promise<void>,
    put_user(user: IUser): Promise<void>,
    get_all_users(): Promise<IUser[]>
}