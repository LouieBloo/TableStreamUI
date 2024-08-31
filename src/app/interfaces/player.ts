import { ICommanderDamage } from "./game";

export interface IPlayer{
    name:string;
    id:string;
    socketId:string;
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
