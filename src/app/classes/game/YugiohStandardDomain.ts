import { GameType } from "../../interfaces/IGame";
import { Game } from "./game";

export class YugiohDomain extends Game {
  override startingLifeTotal = 8000;
  override gameType:GameType = GameType.YugiohDomain;
  override searchTag:string = "Yu-Gi-Oh!";
  override name:string = "Yu-Gi-Oh!";
  override commanderTitle:string = "Deck Master";
  override coinImagePathPrefix: string = "yugioh";
}
