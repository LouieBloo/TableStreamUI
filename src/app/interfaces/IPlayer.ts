import { ICommanderDamage } from "./IGame";
import { IPlayingCard } from "./IPlayingCard";

export interface IUser{
    name:string;
    id:string;
    socketId:string;
    type:UserType;
    roomId: string;
}

export interface IPlayer extends IUser{
    turnOrder:number;
    lifeTotal:number;
    isAdmin?:boolean;
    cameraFlipped:boolean;
    isTakingTurn?: boolean;
    totalTurns: number;
    currentTurnStartTime?: Date;
    totalTurnTime: number;
    isMonarch?:boolean;
    isSharingImages?:boolean;
    hasCitiesBlessing?:boolean;
    hasInitiative?:boolean;
    poisonTotal:number;
    energyTotal:number;
    radiationTotal:number;
    commanderDamages: { [playerId: string]: { [cardId: string]: ICommanderDamage } };
    commanders: IPlayingCard[];
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
    commanderCastAmount,
    initiative,
    radiationTotal,
    isAdmin
}