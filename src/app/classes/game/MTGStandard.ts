import { GameType} from "../../interfaces/IGame";
import { Game } from "./game";

export class MTGStandard extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGStandard;
    override searchTag:string = "standard";
    override name:string = "Standard";
    override classifierActive:boolean = true;
}