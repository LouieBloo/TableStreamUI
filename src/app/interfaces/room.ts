import { Game } from '../classes/game/game';
import { IMessage } from './message';
import {IPlayer} from './player';
import { Token } from './scryfall';

export interface IRoom {
    id?:string;
    name:string;
    players: IPlayer[];
    messages: IMessage[];
    game?: Game;
    maxPlayers?:number;
    reactionsEnabled?:boolean;
}

export interface PasswordCheckResponse {
    result: boolean;
}

export interface IKickPlayerResponse {
    kickedPlayer:IPlayer;
    players: IPlayer[];
    removedTokens: Token[];
}
