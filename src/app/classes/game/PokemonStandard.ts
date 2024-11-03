import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class PokemonStandard extends Game {
    override startingLifeTotal = 0;
    override gameType:GameType = GameType.PokemonStandard;
    override searchTag:string = "standard";
    override coinImagePathPrefix:string = "mew"

    _prizeCardsToWin:number = 6;

    get prizeCardsToWin():number{
        return this._prizeCardsToWin;
    }
}