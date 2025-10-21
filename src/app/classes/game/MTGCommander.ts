import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGCommander extends Game {
    override startingLifeTotal = 40;
    override gameType:GameType = GameType.MTGCommander;
    override searchTag:string = "commander";
    override name:string = "Commander";
    override commanderTitle:string = "Commander";
    override classifierActive:boolean = true;
}