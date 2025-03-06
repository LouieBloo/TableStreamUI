import { IPlayer } from "./IPlayer";

export interface IMessage {
    text: string;
    date: Date;
    player:IPlayer;
}
