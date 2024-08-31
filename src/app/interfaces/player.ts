import { ICommanderDamage } from "./game";

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

    poisonTotal:number;
    energyTotal:number;

    commanderDamages: { [playerId: string]: ICommanderDamage };
}

export interface ISpectator extends IUser{

}

export enum UserType{
    Player,
    Spectator
}