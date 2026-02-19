import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import {
  GameErrorSeverity,
  GameErrorType,
  GameEvent,
  IGameError,
  IGameEvent,
} from '../../interfaces/IGame';
import { IMessage } from '../../interfaces/IMessage';
import { IUser, UserType } from '../../interfaces/IPlayer';
import { IRoom, IRoomHistoryEvent } from '../../interfaces/IRoom';
import { AlertsService } from '../alerts/alerts.service';
import { LoggerService } from '../logger/logger.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { IPhoneToken } from '../../interfaces/IPhoneToken';
import { LocalDevicesService } from '../devices/devices.service';
import { JoinRoomPayload } from './joinRoomPayload';

@Injectable({
  providedIn: 'root',
})
export class WebRTCService {
  private alertService = inject(AlertsService);
  private logger = inject(LoggerService);
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private userService = inject(UserService);
  private gameService = inject(GameService);
  private devicesService = inject(LocalDevicesService);

  socket: Socket | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {}; //will contain a users phone stream
  private iceServerList: any = null;
  private userJoinedSubject = new Subject<{ id: string; user: IUser }>();
  public userJoined = this.userJoinedSubject.asObservable();
  private localGameEventSubject = new Subject<IGameEvent>();
  public localGameEvent = this.localGameEventSubject.asObservable();
  onStreamAdded: ((id: string, stream: MediaStream, user: IUser) => void)[] = [];
  onStreamRemoved: ((id: string) => void)[] = [];

  onMessage: ((message: IMessage) => void)[] = [];
  amISpectator: boolean = false;
  private _roomPasswordValid: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);

  get roomPasswordValid(): Observable<boolean | null> {
    return this._roomPasswordValid.asObservable();
  }

  constructor() {
    this.devicesService.localStream$
      .pipe(
        tap((stream: MediaStream | null) => {
          this.replaceTrackInPeerConnections(stream); //todo await
        })
      )
      .subscribe();
  }

  //TODO - FIX DOUBLE FOR LOOP
  private async replaceTrackInPeerConnections(mediaStream: MediaStream | null) {
    if (mediaStream == null) return;

    const newAudioTrack = mediaStream.getAudioTracks()[0];
    const newVideoTrack = mediaStream.getVideoTracks()[0];

    for (const socketId in this.peerConnections) {
      const peerConnection = this.peerConnections[socketId];
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
      if (sender) {
        await sender.replaceTrack(newAudioTrack);
      } else {
        peerConnection.addTrack(newAudioTrack, mediaStream);
      }
      await this.renegotiateConnection(peerConnection, socketId);

    }

    for (const socketId in this.peerConnections) {
      const peerConnection = this.peerConnections[socketId];
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      } else {
        peerConnection.addTrack(newVideoTrack, mediaStream);
      }
      await this.renegotiateConnection(peerConnection, socketId);

    }
  }

  public joinRoom = async (
    roomId: string,
    password: string | null,
    callback: (user: IUser, room: IRoom) => void
  ) => {
    const joinRoomPayload = this.getJoinRoomPayload(roomId, password);
    this.createSocket();
    if (!this.socket) return;

    this.registerSocketHandlers();
    this.setInitialStreamState(joinRoomPayload.userType);
    this.emitJoinRoom(joinRoomPayload, password, callback);
  };

  public joinAsPhone = async (token: IPhoneToken) => {
    this.createSocket();
    this.registerPhoneSocketHandlers();
    this.setInitialPhoneStreamState();

    if (this.socket)
      this.socket.emit('joinRoomAsPhone', token, this.onServerResponseFromPhone);
  };

  // public async changeDevice(videoDeviceId: string, audioDeviceId: string): Promise<void> {
  //   if (!this.devicesService._localStream) {
  //     const localStream = await this.devicesService.buildStreamOnDeviceChange(
  //       videoDeviceId,
  //       audioDeviceId
  //     );
  //     await this.updatePeerConnections(localStream!);
  //     return;
  //   }

  //   await this.devicesService.changeDevice(
  //     this.peerConnections,
  //     videoDeviceId,
  //     audioDeviceId
  //   );
  // }

  public disconnect() {
    this.disconnectSocket();
    this.devicesService.stopAndRemoveAllLocalMediaTracks();
    this.closePeerConnections();
    this.stopRemoteStreams();
    this.clearDeviceListeners();
  }

  public subscribeToStreamAdd(
    callback: (id: string, stream: MediaStream, user: IUser) => void
  ) {
    this.onStreamAdded.push(callback);
  }

  public subscribeToStreamRemove(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  public getRemoteStreamBySocketId(socketId: string): MediaStream | null {
    return this.remoteStreams[socketId] || null;
  }

  public sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', {
        text: message,
      });
    }
  }

  public resetRoomPasswordInvalid() {
    this._roomPasswordValid.next(null);
  }

  private createSocket() {
    this.socket = io(environment.socketUrl);
  }

  private disconnectSocket(): void {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
  }

  private closePeerConnections() {
    for (const pc of Object.values(this.peerConnections)) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      pc.close();
    }
    this.peerConnections = {};
  }

  private stopRemoteStreams() {
    for (const stream of Object.values(this.remoteStreams)) {
      stream.getTracks().forEach((track) => track.stop());
    }
    this.remoteStreams = {};
  }

  private clearDeviceListeners(): void {
    navigator.mediaDevices.ondevicechange = null;
  }

  private emitJoinRoom(
    joinRoomPayload: JoinRoomPayload,
    password: string | null,
    callback: (user: IUser, room: IRoom) => void
  ) {
    if (this.socket) {
      this.socket.emit(
        'joinRoom',
        joinRoomPayload,
        (me: IUser, room: IRoom, error: IGameError) => {
          if (error) {
            this.handleJoinRoomError(error);
            return;
          }
          this.handleSuccessfulJoin(joinRoomPayload, room, password, me, callback);
        }
      );
    }
  }

  private handleSuccessfulJoin(
    joinRoomPayload: JoinRoomPayload,
    room: IRoom,
    password: string | null,
    me: IUser,
    callback: (user: IUser, room: IRoom) => void
  ) {
    this.iceServerList = room.iceServerList;
    room.messages?.forEach((m) => this.handleMessage(m));
    room.game?.sharedCards?.forEach((card) =>
      this.handleGameEvent({ event: GameEvent.ShareCard, response: card })
    );

    this.registerSocketDisconnect(joinRoomPayload, room, password);
    callback(me, room);
  }

  private registerSocketHandlers() {
    if (!this.socket) return;

    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
    this.socket.on('gameEvent', this.handleGameEvent);
    this.socket.on('errorResponse', this.handleErrorResponse);
    this.socket.on('historyEvent', this.handleHistory);
  }

  private setInitialStreamState(userType: UserType) {
    this.remoteStreams = {};
    this.peerConnections = {};
    this.amISpectator = userType == UserType.Spectator;
  }

  private async renegotiateConnection(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    this.emitLocalDescription(socketId, peerConnection.localDescription!);
  }



  private replaceOrAddTracks(
    peerConnection: RTCPeerConnection,
    mediaStream: MediaStream
  ) {
    const senders = peerConnection.getSenders();
    mediaStream.getTracks().forEach((track) => {
      const sender = senders.find((s) => s.track?.kind === track.kind);
      if (sender) {
        sender.replaceTrack(track);
      } else {
        peerConnection.addTrack(track, mediaStream);
      }
    });
  }

  private getJoinRoomPayload(roomId: string, password: string | null): JoinRoomPayload {
    return {
      playerId: this.localStorageService.playerId,
      roomId: roomId,
      gameType: this.localStorageService.gameType,
      roomName: this.localStorageService.roomName,
      playerName: this.localStorageService.playerName,
      password: password && password != 'null' ? password : null,
      userType: this.localStorageService.amISpectator
        ? UserType.Spectator
        : UserType.Player,
      maxPlayers: parseInt(this.localStorageService.maxPlayers || '4') || 4,
      reactionsEnabled:
        this.localStorageService.reactionsEnabled &&
        this.localStorageService.reactionsEnabled == 'false'
          ? false
          : true,
      isPublic: this.localStorageService.publicGame,
      joinerJwtToken: this.userService.isLoggedIn ? this.userService.jwtToken : null,
      allowSpectators: this.localStorageService.allowSpectators,
      isSharingImages:
        this.localStorageService.isSharingImages &&
        this.localStorageService.isSharingImages == 'false'
          ? false
          : true,
    } as JoinRoomPayload;
  }

  private handleJoinRoomError(error: IGameError): void {
    switch (error.type) {
      case GameErrorType.InvalidPassword:
        this._roomPasswordValid.next(false);
        break;

      case GameErrorType.RoomFull:
        this.alertService.addAlert('error', error.message, 5);
        break;

      case GameErrorType.EnteringBannedRoom:
        this.router.navigate(['/join']);
        this.alertService.addAlert('error', error.message, 5);
        break;

      case GameErrorType.InvalidAction:
        this.router.navigate(['/join']);
        this.alertService.addAlert('error', error.message);
        break;

      default:
        console.warn('Unhandled join room error:', error);
        this.alertService.addAlert('error', 'An unknown error occurred.', 5);
        break;
    }
  }

  private onServerResponseFromPhone = (room: IRoom) => {
    this.iceServerList = room.iceServerList;
  };

  private setInitialPhoneStreamState() {
    this.remoteStreams = {};
    this.peerConnections = {};
  }

  private registerPhoneSocketHandlers() {
    if (!this.socket) return;
    this.socket = io(environment.socketUrl);
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
  }

  private registerSocketDisconnect(
    joinRoomPayload: JoinRoomPayload,
    room: IRoom,
    password: string | null
  ) {
    this.socket?.on('disconnect', (reason: string) => {
      console.log('Reason, ', reason);

      if (this.isIntentionalDisconnect(reason)) {
        return;
      }

      this.alertConnectionLost();

      this.socket?.once('connect', () => {
        this.rejoinRoom(joinRoomPayload, room, password);
      });
    });
  }

  private rejoinRoom(
    joinRoomPayload: JoinRoomPayload,
    room: IRoom,
    password: string | null
  ) {
    this.notifyReconnecting();
    this.socket?.emit(
      'joinRoom',
      {
        playerId: joinRoomPayload.playerId,
        roomId: room.id,
        gameType: joinRoomPayload.gameType,
        roomName: joinRoomPayload.roomName,
        playerName: joinRoomPayload.playerName,
        password: password && password != 'null' ? password : null,
        userType: joinRoomPayload.userType,
        maxPlayers: joinRoomPayload.maxPlayers || 4, //TODO
        reactionsEnabled: joinRoomPayload.reactionsEnabled,
        joinerJwtToken: joinRoomPayload.joinerJwtToken,
      },
      (newPlayer: IUser, room: IRoom, error: IGameError) => {
        this.notifySuccessfulReconnect();
      }
    );
  }

  private isIntentionalDisconnect(reason: string): boolean {
    return reason === 'io client disconnect';
  }

  private handleSignal = async (data: { from: string; signal: any; user: IUser }) => {
    this.logger.log('Handle signal: ', data.from, data.signal);
    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from, data.user);
    }
    const peerConnection = this.peerConnections[from];
    if (signal.type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.emitLocalDescription(from, peerConnection.localDescription!);
    } else if (signal.type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
    }
  };

  private handleNewPeer = (data: { socketId: string; user: IUser }) => {
    const { socketId } = data;
    if (socketId == this.socket?.id) {
      return;
    }

    this.userJoinedSubject.next({ id: socketId, user: data.user });
    this.createPeerConnection(socketId, data.user, true);
  };

  private handlePeerDisconnected = (data: { socketId: string }) => {
    const { socketId } = data;
    if (this.peerConnections[socketId]) {
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }
    if (this.remoteStreams[socketId]) {
      delete this.remoteStreams[socketId];
    }

    this.onStreamRemoved.forEach((callback) => {
      callback(socketId);
    });
  };

  private shouldSkipPeerConnection(user: IUser): boolean {
    const bothAreSpectators = this.amISpectator && user.type === UserType.Spectator;

    if (bothAreSpectators) {
      this.logger.log('Not adding connection: both users are spectators');
    }
    return bothAreSpectators;
  }

  private async createPeerConnection(
    socketId: string,
    newUser: IUser,
    isNewPeer: boolean = false
  ) {
    if (this.shouldSkipPeerConnection(newUser)) {
      return;
    }

    try {
      this.logger.log('Creating peer connection: ', socketId, newUser);
      const peerConnection = this.initializePeerConnection(socketId, newUser);

      if (!this.amISpectator) {
        await this.attachTracksOrFallbackToReceiveOnlyOffer(socketId, peerConnection);
      } else if (isNewPeer) {
        await this.createAndSignalReceiveOnlyOffer(socketId, peerConnection);
      }
    } catch (error) {
      this.logPeerConnectionError(error, socketId, newUser);
    }
  }

  private async attachTracksOrFallbackToReceiveOnlyOffer(
    socketId: string,
    peerConnection: RTCPeerConnection
  ) {
    try {
      await this.devicesService.attachTrackToPeerConnection(peerConnection, socketId);
    } catch (error) {
      if (this.isSafeToOffer(peerConnection)) {
        await this.createAndSignalReceiveOnlyOffer(socketId, peerConnection);
      }
    }
  }

  private async createAndSignalReceiveOnlyOffer(
    socketId: string,
    peerConnection: RTCPeerConnection
  ) {
    this.logger.log('signal state: ', peerConnection.signalingState);
    const offer = await this.createReceiveOnlyOffer(peerConnection);
    await peerConnection.setLocalDescription(offer);
    this.emitLocalDescription(socketId, peerConnection.localDescription!);
  }

  private initializePeerConnection(socketId: string, user: IUser): RTCPeerConnection {
    const configuration = { iceServers: this.iceServerList };
    const peerConnection = new RTCPeerConnection(configuration);

    this.peerConnections[socketId] = peerConnection;

    peerConnection.onicecandidate = (event) =>
      this.handleIceCandidateEvent(socketId, event);
    peerConnection.ontrack = this.addRemoteStream(socketId, user);
    peerConnection.onnegotiationneeded = async () =>
      this.handleNegotiationNeeded(peerConnection, socketId);

    return peerConnection;
  }

  private isSafeToOffer(peerConnection: RTCPeerConnection) {
    return (
      peerConnection.signalingState === 'stable' ||
      peerConnection.signalingState === 'have-local-offer'
    );
  }

  private async handleNegotiationNeeded(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    this.logOnNegotation(socketId, peerConnection.signalingState);

    try {
      if (peerConnection.signalingState === 'stable') {
        const offer = await this.createReceiveOnlyOffer(peerConnection);
        await peerConnection.setLocalDescription(offer);
        this.emitLocalDescription(socketId, peerConnection.localDescription!);
      }
    } catch (error) {
      this.logNegotiationError(error, socketId, peerConnection);
    }
  }

  private emitLocalDescription(
    socketId: string,
    localDescription: RTCSessionDescription
  ): void {
    this.socket?.emit('signal', {
      to: socketId,
      signal: localDescription,
    });
  }

  private async createReceiveOnlyOffer(
    peerConnection: RTCPeerConnection
  ): Promise<RTCSessionDescriptionInit> {
    return await peerConnection.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });
  }

  private addRemoteStream(socketId: string, user: IUser) {
    return (event: RTCTrackEvent) => {
      this.logger.log('on track: ', event);
      const remoteStream = event.streams[0];

      this.remoteStreams[socketId] = remoteStream;
      if (this.gameService.isLocalPlayer(user.id)) {
        this.devicesService.setLocalStreamTest(remoteStream); //this is where the phone stream gets set as local stream
      }
      this.onStreamAdded.forEach((callback) => {
        callback(socketId, this.remoteStreams[socketId], user);
      });
    };
  }

  private handleIceCandidateEvent(socketId: string, event: RTCPeerConnectionIceEvent) {
    this.logger.log('on ice candidate', event);
    if (event.candidate) {
      this.socket?.emit('signal', { to: socketId, signal: event.candidate });
    }
  }

  handleMessage = (message: IMessage) => {
    this.onMessage.forEach((callback) => {
      if (callback != null) {
        callback(message);
      }
    });
  };

  sendGameEvent = (event: IGameEvent) => {
    if (this.socket) {
      this.socket.emit('gameEvent', event);
    }
  };

  //we dont listen for these events as they are private, we wait for the callback and resolve
  sendPrivateGameEvent = (event: IGameEvent): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit('privateGameEvent', event, (response: any) => {
          //safe to now call our normal handleGameEvent as we are the only person receiving the updates
          this.handleGameEvent(response);
          resolve(true);
        });
      } else {
        reject(new Error('Socket is not connected'));
      }
    });
  };

  handleGameEvent = (event: IGameEvent) => {
    this.gameService.handleGameEvent(event);
  };

  sendLocalGameEvent = (event: IGameEvent) => {
    this.localGameEventSubject.next(event);
  };

  handleHistory = (historyEvent: IRoomHistoryEvent) => {
    this.gameService.handleHistory(historyEvent);
  };

  handleErrorResponse = (error: IGameError) => {
    this.alertService.addAlert(
      error.severity == GameErrorSeverity.Error ? 'error' : 'warning',
      error.message
    );
  };

  private logPeerConnectionError(error: unknown, socketId: string, user: IUser) {
    this.logger.error(
      'createPeerConnection error',
      { error: error, socketId, user: user },
      'WEB RTC createPeerConnection'
    );
    this.alertService.addAlert(
      'error',
      'There may be an error connecting to a player. Refreshing can help fix this issue'
    );
  }

  private logOnNegotation(socketId: string, rtcSignalState: RTCSignalingState) {
    this.logger.log('on negotiation: ', socketId, rtcSignalState);
  }

  private logNegotiationError(
    error: unknown,
    socketId: string,
    peerConnection: RTCPeerConnection
  ) {
    this.logger.error(
      `Error during negotiation: `,
      { error, socketId, peerConnection },
      'WEB RTC onnegotiationneeded'
    );
  }

  private alertConnectionLost() {
    this.alertService.addAlert(
      'error',
      'Lost connection to server. Retrying connection...',
      5
    );
    console.warn('Socket disconnected. Attempting to reconnect...');
  }

  private notifyReconnecting() {
    console.log('Reconnected to server. Rejoining room...');
    this.alertService.addAlert('warning', 'Reconnected to server. Rejoining room...', 5);
  }

  private notifySuccessfulReconnect() {
    this.alertService.addAlert('success', 'Successfully rejoined room', 5);
  }
}
