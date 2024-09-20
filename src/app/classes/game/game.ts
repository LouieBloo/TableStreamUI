import { ScryfallCard } from "../../interfaces/scryfall";
import {GameType} from "../../interfaces/game";
export class Game {

    startingLifeTotal = 20;
    active:boolean = false;

    sharedCards:ScryfallCard[] = [];

    gameType: GameType = GameType.Game;
    searchTag:string = "game";
}