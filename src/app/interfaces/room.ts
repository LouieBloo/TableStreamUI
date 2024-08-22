import {IPlayer} from './player';

export interface IRoom {
    name:string;
    players: IPlayer[];
}
