import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGLegacy extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGLegacy;
    override searchTag:string = "legacy";
    override name:string = "Legacy";
    override classifierActive:boolean = true;
}