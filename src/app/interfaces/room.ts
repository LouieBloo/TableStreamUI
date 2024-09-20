import { Game } from '../classes/game/game';
import { IMessage } from './message';
import {IPlayer} from './player';

export interface IRoom {
    id?:string;
    name:string;
    players: IPlayer[];
    messages: IMessage[];
    game?: Game;
}
