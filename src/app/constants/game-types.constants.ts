import { GameType } from "../interfaces/IGame";

export const GAME_TYPES = [
  { value: GameType.MTGCommander, label: "MTG Commander", defaultMaxPlayers: 4 },
  { value: GameType.MTGLegacy, label: "MTG Legacy", defaultMaxPlayers: 2 },
  { value: GameType.MTGModern, label: "MTG Modern", defaultMaxPlayers: 2 },
  { value: GameType.MTGStandard, label: "MTG Standard", defaultMaxPlayers: 2 },
  { value: GameType.MTGPauperCommander, label: "MTG Pauper Commander", defaultMaxPlayers: 4 },
  { value: GameType.MTGVintage, label: "MTG Vintage", defaultMaxPlayers: 2 },
  { value: GameType.OnePiece, label: "One Piece", defaultMaxPlayers: 2 },
  { value: GameType.PokemonStandard, label: "Pokémon Standard", defaultMaxPlayers: 2 },
  { value: GameType.YugiohStandard, label: "Yu-Gi-Oh!", defaultMaxPlayers: 2 },
  { value: GameType.YugiohDomain, label: "Yu-Gi-Oh! Domain", defaultMaxPlayers: 4 }
];