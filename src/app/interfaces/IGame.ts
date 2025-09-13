import { IPlayer, PlayerProperties } from "./IPlayer";
import { IPlayingCard } from "./IPlayingCard";
import { IRoomHistoryEvent } from "./IRoom";

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
    RollDice,
    KickPlayer,
    ModifyGameProperty,
    ToggleInitiative
}

//fine to change on front end only
export enum LocalGameEvent{
    FlipCoins,
    PlayReaction,
    RejoinGame,
    ShareCard
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
    YugiohStandard,
    YugiohDomain
}

export enum GameProperties{
    DayNightCycle
}

export interface IModifyGameProperty{
    property:GameProperties;
    value?:any;
}

export interface IModifyPlayerProperty{
    property:PlayerProperties;
    amountToModify?:number;
    value?:any;
}

export interface ICommanderDamage{
    playerId:string;
    damage:number;
    card:IPlayingCard;
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
    GenericWarning,
    RoomFull,
    EnteringBannedRoom
}

export interface IAlert{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    id: number;
}

export interface ILog{
    message:string;
    data?:any;
    source:string;
    application:string;
    severity:string;
}

export interface ICoinFlipResults{
    results:string[]
}