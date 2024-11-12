import { PlayingCard } from "../scryfall";

export interface ICommanderSelected {
    newCommander: PlayingCard,
    oldCommander: PlayingCard|null;
}