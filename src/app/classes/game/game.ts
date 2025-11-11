import { IPlayingCard, Token } from "../../interfaces/IPlayingCard";
import {GameType} from "../../interfaces/IGame";
export class Game {

    startingLifeTotal = 20;
    active:boolean = false;
    sharedCards:IPlayingCard[] = [];
    gameType: GameType = GameType.Game;
    searchTag:string = "game";
    coinImagePathPrefix:string = "magic"
    name:string = "game";
    commanderTitle:string = "";
    dayNightCycle:string = "";
    classifierActive:boolean = false;
    transcribeActive:boolean = true;
    tokens:Token[] = [];
    startedAt!:Date;

    createToken = (newToken:Token)=>{
        this.tokens.push(newToken);
    }

    // i dont want to clobber the array everytime something changes, id rather find it in our memory and just update the attributes
    // modifyToken = (modifiedToken:Token)=>{
    //     if (!modifiedToken) { return; }
    
    //     const existingToken = this.tokens.find(p => p.id === modifiedToken.id);
    //     if (existingToken) {
    //         console.log("found token to modify")
    //         //Object.assign(existingToken, modifiedToken); 
    //         existingToken.xPosition = modifiedToken.xPosition;
    //         existingToken.yPosition = modifiedToken.yPosition;
    //     }
    // }

    // setTokens = (newTokens:Token[])=>{
    //     this.tokens = newTokens;
    // }

    //not sure if we need to manually do this but keeping for now
    modifyProperty = (game:Game)=>{
        this.dayNightCycle = game.dayNightCycle;
    }

    removeToken = (removedToken:Token)=>{
        this.tokens = this.tokens.filter(token => token.id != removedToken.id);
    }

    removeTokensByPlayerId(playerId: string){
        this.tokens = this.tokens.filter(token => token.ownerId != playerId)
    }

}