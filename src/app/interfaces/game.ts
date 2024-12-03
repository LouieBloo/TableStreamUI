import { IPlayer, PlayerProperties } from "./player";
import { PlayingCard } from "./scryfall";

export interface IGameEvent {
    callingPlayer?:IPlayer;
    event: GameEvent | LocalGameEvent;
    payload?:any;
    response?: any;
}

//needs to be synced with back end
export enum GameEvent{
    RandomizePlayerOrder,
    ModifyPlayerProperty,
    StartGame,
    ResetGame,
    EndCurrentTurn,
    ShareCard,
    ToggleMonarch,
    ModifyPlayerCommanderDamage,
    SetCommander,
    FlipCoins,
    PlayEffect,
    SetPlayerTurnOrders,
    CreateToken,
    ModifyToken,
    DeleteToken,
    RollDice
}

//fine to change on front end only
export enum LocalGameEvent{
    FlipCoins,
    PlayReaction
}


export enum GameType{
    Game,
    MTGCommander,
    MTGStandard,
    MTGModern,
    MTGLegacy,
    MTGVintage,
    PokemonStandard,
    MTGPauperCommander,
    YuGiOhStandard
}

export interface IModifyPlayerProperty{
    property:PlayerProperties;
    amountToModify:number;
}

export interface ICommanderDamage{
    playerId:string;
    damage:number;
    card:PlayingCard;
}

export interface IGameError {
    type: GameErrorType;
    severity: GameErrorSeverity;
    message:string;
}

export enum GameErrorSeverity{
    Warning,
    Error,
}

export enum GameErrorType{
    GameNotStarted,
    InvalidAction,
    NoRoomName,
    InvalidPassword,
    GenericWarning
}

export interface IAlert{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    id: number;
}

export interface ICoinFlipResults{
    results:string[]
}