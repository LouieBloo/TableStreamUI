import { Game } from '../classes/game/game';
import { IMessage } from './IMessage';
import {IPlayer} from './IPlayer';
import { Token } from './IScryfall';

export interface IRoom {
    id?:string;
    name:string;
    players: IPlayer[];
    messages: IMessage[];
    game?: Game;
    maxPlayers?:number;
    reactionsEnabled?:boolean;
    allowPlayerKicking?:boolean;
}

export interface PasswordCheckResponse {
    result: boolean;
}

export interface IKickPlayerResponse {
    kickedPlayer:IPlayer;
    players: IPlayer[];
    removedTokens: Token[];
}
