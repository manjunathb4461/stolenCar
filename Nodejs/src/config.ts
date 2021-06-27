import dotenv from "dotenv"
dotenv.config()

export const port: number = process.env.PORT as unknown as number
export const accessTokenSecret: string = process.env.accessTokenSecret as string
export const stolenCarDbUri: string = process.env.stolenCarDbUri as string
export const frontEndPoint: string = process.env.frontEndPoint as string
export const jwtExpirationTime: number = process.env.jwtExpirationTime as unknown as number