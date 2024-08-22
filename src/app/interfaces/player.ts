
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
}
