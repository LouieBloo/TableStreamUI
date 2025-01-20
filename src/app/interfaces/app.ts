export interface INews {
    serverMaintenance?:IMaintenanceAlert;
}

export interface IMaintenanceAlert{
    message:string;
    startTime:Date;
    endTime:Date;
    id:string;
    severity:string;
}