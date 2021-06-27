import express from "express"
import router from "./routes"
import { port } from "./config"

require("dotenv").config()

const app: express.Application = express()

/*
import cors from "cors"
app.use(cors())
*/

app.use(express.json())
app.use(router)

app.listen(port, function () {
    console.log(`listening on port ${port}`)
})