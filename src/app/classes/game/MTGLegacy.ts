import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class MTGLegacy extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGLegacy;
    override searchTag:string = "legacy";
}