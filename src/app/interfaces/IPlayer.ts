import { ICommanderDamage } from "./IGame";
import { PlayingCard } from "./IScryfall";

export interface IUser{
    name:string;
    id:string;
    socketId:string;
    type:UserType;
}

export interface IPlayer extends IUser{
    turnOrder:number;
    lifeTotal:number;
    admin?:boolean;
    cameraFlipped:boolean;

    isTakingTurn?: boolean;
    totalTurns: number;
    currentTurnStartTime?: Date;
    totalTurnTime: number;

    isMonarch?:boolean;
    isSharingImages?:boolean;
    hasCitiesBlessing?:boolean;

    poisonTotal:number;
    energyTotal:number;

    commanderDamages: { [playerId: string]: { [cardId: string]: ICommanderDamage } };

    commanders: PlayingCard[];

    prizeCards:number;

    reactionsMuted:boolean;
}

export interface ISpectator extends IUser{

}

export enum UserType{
    Player,
    Spectator
}

export enum PlayerProperties{
    lifeTotal,
    poisonTotal,
    energyTotal,
    monarch,
    citiesBlessing,
    prizeCards,
    sharingImages,
    commanderCastAmount
}