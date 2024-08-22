import { IPlayer } from "./player";

export interface IMessage {
    text: string;
    date: Date;
    player:IPlayer;
}
