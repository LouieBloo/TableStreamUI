import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class MTGVintage extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGVintage;
    override searchTag:string = "vintage";
}