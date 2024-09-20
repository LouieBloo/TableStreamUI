import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class MTGCommander extends Game {
    override startingLifeTotal = 40;
    override gameType:GameType = GameType.MTGCommander;
    override searchTag:string = "commander";
}