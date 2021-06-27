import "reflect-metadata"
import { Container } from "inversify"
import TYPES from "./types"
import { IstolenCarDb } from "./interfaces"
import stolenCarDb from "./dao"

var container = new Container()
container.bind<IstolenCarDb>(TYPES.stolenCarDb).to(stolenCarDb)

export default container