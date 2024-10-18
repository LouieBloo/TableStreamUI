import { IPlayer, PlayerProperties } from "./player";

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
    ModifyPlayerCommanderDamage,
    SetCommander
}


export enum GameType{
    Game,
    MTGCommander,
    MTGStandard,
    MTGModern,
    MTGLegacy,
    MTGVintage,
    PokemonStandard,
    YuGiOhStandard
}

export interface IModifyPlayerProperty{
    property:PlayerProperties;
    amountToModify:number;
}



// export interface IGame{
//     startingLifeTotal: string;
//     sharedCards:ScryfallCard[];
// }

export interface ICommanderDamage{
    playerId:string;
    damage:number;
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