import {IPlayer} from './user';

export interface IRoom {
    name:string;
    players: IPlayer[];
}
