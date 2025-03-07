import { IGameAnalytic } from "./IGameAnalytic";
import { IMongoAnalyticByDate } from "./IMongoAnalyticByDate";

export interface IMongoAnalytic {
    totalPlayersToday: number;
    totalRoomsToday: number;
    mongoAnalyticsByDate: IMongoAnalyticByDate[];
    gameAnalytics: IGameAnalytic[];
}