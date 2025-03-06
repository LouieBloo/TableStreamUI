import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGVintage extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGVintage;
    override searchTag:string = "vintage";
    override name:string = "Vintage";
    override classifierActive:boolean = true;
}