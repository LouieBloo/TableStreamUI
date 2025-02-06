import { UserType } from "../interfaces/player";

export interface JoinRoomDto {
    playerId: string|null;
    roomId: string;
    playerName: string | null;
    password: string | null;
    gameType: string | null;
    roomName: string | null;
    userType: UserType;
    maxPlayers: number;
    reactionsEnabled: boolean;
    arePlayersKickable: boolean;
  }
  