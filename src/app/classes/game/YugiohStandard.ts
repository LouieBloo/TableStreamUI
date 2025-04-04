import { GameType } from "../../interfaces/IGame";
import { Game } from "./game";

export class YugiohStandard extends Game {
  override startingLifeTotal = 8000;
  override gameType:GameType = GameType.YugiohStandard;
  override searchTag:string = "Yu-Gi-Oh!";
  override name:string = "Yu-Gi-Oh!";
  override coinImagePathPrefix: string = "yugioh";
}
