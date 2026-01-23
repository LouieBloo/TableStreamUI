import { UserType } from "../../interfaces/IPlayer";

export interface JoinRoomPayload {
  playerId: string;
  roomId: string;
  gameType: string;
  roomName: string;
  playerName: string;
  password: string | null;
  userType: UserType;
  maxPlayers: number;
  reactionsEnabled: boolean;
  isPublic: boolean;
  joinerJwtToken: string | null;
  allowSpectators: boolean;
  isSharingImages: boolean;
}