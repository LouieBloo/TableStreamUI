import { IPlayer } from "./player";
import { ScryfallCard } from "./scryfall";

export interface IGameEvent {
    callingPlayer?:IPlayer;
    event: GameEvent;
    payload?:any;
    response?: any;
}

export enum GameEvent{
    RandomizePlayerOrder,
    ModifyLifeTotal,
    StartGame,
    EndCurrentTurn,
    ShareCard,
    TakeMonarch
}

export enum GameType{
    MTGCommander
}

export interface IModifyPlayerLifeTotal{
    amountToModify:number;
}

export interface Game{
    startingLifeTotal: string;
    sharedCards:ScryfallCard[];
}

