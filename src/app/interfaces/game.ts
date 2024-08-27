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

export interface Game{
    startingLifeTotal: string;
    sharedCards:ScryfallCard[];
}

export interface CommanderDamage{
    playerId:string;
    damage:number;
}
