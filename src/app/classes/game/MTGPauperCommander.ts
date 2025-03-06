import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGPauperCommander extends Game {
    override startingLifeTotal = 30;
    override gameType:GameType = GameType.MTGPauperCommander;
    override searchTag:string = "commander";
    override name:string = "Pauper EDH";
    override classifierActive:boolean = true;
}