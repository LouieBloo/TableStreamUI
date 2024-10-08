import { ICommanderDamage } from "./game";
import { ScryfallCard } from "./scryfall";

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
    hasCitiesBlessing?:boolean;

    poisonTotal:number;
    energyTotal:number;

    commanderDamages: { [playerId: string]: ICommanderDamage };

    commander: ScryfallCard;
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
    citiesBlessing
}