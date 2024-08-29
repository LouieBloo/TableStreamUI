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
    ModifyPlayerProperty,
    StartGame,
    ResetGame,
    EndCurrentTurn,
    ShareCard,
    ToggleMonarch,
    ModifyPlayerCommanderDamage
}

export enum GameType{
    MTGCommander
}

export interface IModifyPlayerProperty{
    property:PlayerProperties;
    amountToModify:number;
}

export enum PlayerProperties{
    lifeTotal,
    poisonTotal
}

export interface IGame{
    startingLifeTotal: string;
    sharedCards:ScryfallCard[];
}

export interface ICommanderDamage{
    playerId:string;
    damage:number;
}

export interface IGameError {
    type: GameErrorType;
    message:string;
}

export enum GameErrorType{
    GameNotStarted
}

export interface IAlert{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    id: number;
}