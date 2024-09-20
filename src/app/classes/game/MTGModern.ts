import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class MTGModern extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGModern;
    override searchTag:string = "modern";
}