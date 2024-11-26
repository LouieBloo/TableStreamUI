import { PlayingCard, Token } from "../../interfaces/scryfall";
import {GameType} from "../../interfaces/game";
export class Game {

    startingLifeTotal = 20;
    active:boolean = false;

    sharedCards:PlayingCard[] = [];

    gameType: GameType = GameType.Game;
    searchTag:string = "game";
    coinImagePathPrefix:string = "magic"

    classifierActive:boolean = false;

    tokens:Token[] = [];

    setTokens = (newTokens:Token[])=>{
        this.tokens = newTokens;
    }
}