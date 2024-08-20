import { IPlayer } from "./user";

export interface IMessage {
    text: string;
    date: Date;
    player:IPlayer;
}
