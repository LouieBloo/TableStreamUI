import { IGame } from './game';
import { IMessage } from './message';
import {IPlayer} from './player';

export interface IRoom {
    name:string;
    players: IPlayer[];
    messages: IMessage[];
    game?: IGame;
}
