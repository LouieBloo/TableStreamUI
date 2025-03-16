import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly PASSWORD = 'pw';
  private readonly DEV_PASSWORD = 'dev-pw';
  private readonly AGREED_TO_DISCLAIMER = 'agreedToDisclaimer';
  private readonly SEEN_IMAGES = 'seenImages';
  private readonly PLAYER_NAME = 'playerName';
  private readonly PLAYER_ID = 'playerId';
  private readonly HAS_PLAYED_BEFORE = 'hasPlayedBefore';
  private readonly ROOM_ID = 'roomId';
  private readonly IS_SPECTATOR = 'isSpectator';
  private readonly GAME_TYPE = 'gameType';
  private readonly ROOM_NAME = 'roomName';
  private readonly MAX_PLAYERS = 'maxPlayers';
  private readonly REACTIONS_ENABLED = 'reactionsEnabled';
  private readonly VIDEO_QUALITY = 'videoQuality';
  private readonly MIC_MUTED = 'micMuted';
  private readonly IS_SHARING_IMAGES = 'isSharingImages';

  private userInteractedWithSite:boolean = false;

  get playerName() {
    return this.getItem(this.PLAYER_NAME);
  }

  get seenImages(){
    return this.getItem(this.SEEN_IMAGES)
  }

  get playerId() {
    return this.getItem(this.PLAYER_ID);
  }

  get agreedToDisclaimer() {
    return this.getItem(this.AGREED_TO_DISCLAIMER);
  }

  get isSharingImages() {
    return this.getItem(this.IS_SHARING_IMAGES);
  }

  get videoQuality() {
    return this.getItem(this.VIDEO_QUALITY);
  }

  get password() {
    return this.getItem(this.PASSWORD);
  }

  get devPassword(){
    return this.getItem(this.DEV_PASSWORD);
  }

  get hasPlayedBefore() {
    return this.getItem(this.HAS_PLAYED_BEFORE);
  }

  get roomId() {
    return this.getItem(this.ROOM_ID);
  }

  get isSpectator() {
    return this.getItem(this.IS_SPECTATOR);
  }

  get hasSetSpectator() {
    return this.isSpectator == 'false' || this.isSpectator == 'true';
  }

  get amISpectator() {
    return this.isSpectator && this.isSpectator == 'true';
  }

  get gameType() {
    return this.getItem(this.GAME_TYPE);
  }
  
  get roomName() {
    return this.getItem(this.ROOM_NAME);
  }

  get maxPlayers() {
    return this.getItem(this.MAX_PLAYERS);
  }

  get reactionsEnabled() {
    return this.getItem(this.REACTIONS_ENABLED);
  }

  get isMicMuted() {
    return this.getItem(this.MIC_MUTED);
  }

  get hasUserInteractedWithSite(){
    return this.userInteractedWithSite;
  }

  setVideoQuality(videoQuality: string) {
    this.setItem(this.VIDEO_QUALITY, videoQuality);
  }

  setIsSharingImages(isSharingImages: string) {
    this.setItem(this.IS_SHARING_IMAGES, isSharingImages);
  }

  setMicMuted(isMicMuted: string) {
    this.setItem(this.MIC_MUTED, isMicMuted);
  }

  setDisclaimer(agreedToDisclaimer: string): void {
    this.setItem(this.AGREED_TO_DISCLAIMER, agreedToDisclaimer);
  }

  setPassword(password: string): void {
    return this.setItem(this.PASSWORD, password);
  }

  setDevPassword(password: string): void {
    return this.setItem(this.DEV_PASSWORD, password);
  }

  removeSeenImages() {
    localStorage.removeItem(this.SEEN_IMAGES);
    console.log('Seen images cache cleared.');
  }

  setSeenImages(seenImages: string) {
    this.setItem(this.SEEN_IMAGES, seenImages);
  }

  setRoomId(roomId: string) {
    this.setItem(this.ROOM_ID, roomId);
  }

  setPlayerName(playerName: string) {
    this.setItem(this.PLAYER_NAME, playerName);
  }

  setIsSpectator(isSpectator: string) {
    this.setItem(this.IS_SPECTATOR, isSpectator);
  }

  setHasPlayedBefore(hasPlayedBefore: string) {
    this.setItem(this.HAS_PLAYED_BEFORE, hasPlayedBefore);
  }

  setPlayerId(playerId: string) {
    this.setItem(this.PLAYER_ID, playerId);
  }

  setRoomName(roomName: string) {
    this.setItem(this.ROOM_NAME, roomName);
  }

  setGameType(gameType: string) {
    this.setItem(this.GAME_TYPE, gameType);
  }

  setMaxPlayers(maxPlayers: string) {
    this.setItem(this.MAX_PLAYERS, maxPlayers);
  }

  setReactionsEnabled(reactionsEnabled: string) {
    this.setItem(this.REACTIONS_ENABLED, reactionsEnabled);
  }

  setUserInteractedWithSite = (userInteractedWithSite:boolean)=>{
    this.userInteractedWithSite = userInteractedWithSite
  }

  setLocalStorageForCreateGame(player: any) {
    this.setPlayerName(player.name);
    this.setRoomName(player.roomName);
    this.setGameType(player.gameType.toString());
    this.setMaxPlayers(player.maxPlayers.toString());
    this.setIsSpectator('false');
    this.setReactionsEnabled(player.reactionsEnabled + '');

    if (player.password)
      this.setPassword(player.password);
  }

  removeStorageOnHomeLoad() {
    this.removeItem(this.ROOM_NAME);
    this.removeItem(this.GAME_TYPE);
    this.removeItem(this.MAX_PLAYERS);
    this.removeItem(this.IS_SPECTATOR);
    this.removeItem(this.PASSWORD);
    this.removeItem(this.ROOM_ID);
    this.removeItem(this.REACTIONS_ENABLED);
  }

  private setItem(item: string, text: string) {
    localStorage.setItem(item, text);
  }

  private getItem(item: string) {
    return localStorage.getItem(item);
  }

  private removeItem(itemToRemove: string): void {
    localStorage.removeItem(itemToRemove);
  }
}
