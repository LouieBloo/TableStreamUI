import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGModern extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGModern;
    override searchTag:string = "modern";
    override name:string = "Modern";
    override classifierActive:boolean = true;
}