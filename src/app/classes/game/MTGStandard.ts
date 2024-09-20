import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class MTGStandard extends Game {
    override startingLifeTotal = 20;
    override gameType:GameType = GameType.MTGStandard;
    override searchTag:string = "standard";
}