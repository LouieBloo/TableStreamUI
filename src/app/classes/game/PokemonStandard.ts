import { GameType} from "../../interfaces/game";
import { Game } from "./game";

export class PokemonStandard extends Game {
    override startingLifeTotal = 0;
    override gameType:GameType = GameType.PokemonStandard;
    override searchTag:string = "standard";
    override coinImagePathPrefix:string = "mew"

    //this cant be a getter as it is set when instantiating rooms
    prizeCardsToWin:number = 6;
}