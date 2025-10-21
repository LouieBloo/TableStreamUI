import { GameType } from "../../interfaces/IGame";
import { Game } from "./game";

export class OncePiece extends Game {
  override startingLifeTotal = 5;
  override gameType:GameType = GameType.OnePiece;
  override searchTag:string = "One Piece";
  override name:string = "One Piece";
  override coinImagePathPrefix: string = "one-piece";
  override commanderTitle:string = "Leader";
}
