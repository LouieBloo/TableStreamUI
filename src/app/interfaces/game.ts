import { IPlayer } from "./user";

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
    EndCurrentTurn
}

export enum GameType{
    MTGCommander
}

export interface IModifyPlayerLifeTotal{
    amountToModify:number;
}

