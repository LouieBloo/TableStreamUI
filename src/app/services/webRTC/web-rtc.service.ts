import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
  socket: Socket | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {};//will contain a users phone stream
  private iceServerList: any = null;
  private userJoinedSubject = new Subject<{ id: string; user: IUser }>();
  public userJoined = this.userJoinedSubject.asObservable();
  private localGameEventSubject = new Subject<IGameEvent>();
  public localGameEvent = this.localGameEventSubject.asObservable();
  onStreamAdded: ((id: string, stream: MediaStream, user: IUser) => void)[] =
    [];
  onStreamRemoved: ((id: string) => void)[] = [];


  onMessage: ((message: IMessage) => void)[] = [];
  amISpectator: boolean = false;
  private _roomPasswordValid: BehaviorSubject<boolean | null> =
    new BehaviorSubject<boolean | null>(null);

  get roomPasswordValid(): Observable<boolean | null> {
    return this._roomPasswordValid.asObservable();
  }

  constructor(
    private alertService: AlertsService,
    private logger: LoggerService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private userService: UserService,
    private gameService: GameService,
    private devicesService: LocalDevicesService
  ) {}

  public joinRoom = async (
    roomId: string,
    password: string | null,
    callback: (user: IUser, room: IRoom) => void
  ) => {
    const joinRoomPayload = this.getJoinRoomPayload(roomId, password);
    this.socket = io(environment.socketUrl);
    if (!this.socket) return;

    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);//how do i know that myself is coming in as a new peer
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
    this.socket.on('gameEvent', this.handleGameEvent);
    this.socket.on('errorResponse', this.handleErrorResponse);
    this.socket.on('historyEvent', this.handleHistory);
    this.remoteStreams = {};
    this.peerConnections = {};

    this.amISpectator = joinRoomPayload.userType == UserType.Spectator;

    if (this.socket) {
      this.socket.emit(
        'joinRoom',
        joinRoomPayload,
        (me: IUser, room: IRoom, error: IGameError) => {
          if (error) {
            this.handleJoinRoomError(error);
            return;
          }
          this.iceServerList = room.iceServerList;
          room.messages?.forEach((m) => this.handleMessage(m));
          room.game?.sharedCards?.forEach((card) =>
            this.handleGameEvent({ event: GameEvent.ShareCard, response: card })
          );

          this.registerSocketDisconnect(joinRoomPayload, room, password);
          callback(me, room);
        }
      );
    }
  };

  private async renegotiateConnection(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    this.socket?.emit('signal', {
      to: socketId,
      signal: peerConnection.localDescription,
    });
  }

  private async updatePeerConnections(mediaStream: MediaStream): Promise<void> {
    for (const socketId in this.peerConnections) {
      const peerConnection = this.peerConnections[socketId];
      this.replaceOrAddTracks(peerConnection, mediaStream);
      await this.renegotiateConnection(peerConnection, socketId);
    }
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
  
  public subscribeToStreamAdd(
    callback: (id: string, stream: MediaStream, user: IUser) => void
  ) {
    this.onStreamAdded.push(callback);
  }

  public subscribeToStreamRemove(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  private getJoinRoomPayload(
    roomId: string,
    password: string | null
  ): JoinRoomPayload {
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
      joinerJwtToken: this.userService.isLoggedIn
        ? this.userService.jwtToken
        : null,
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

  public onServerResponseFromPhone = (room: IRoom) => {
    this.iceServerList = room.iceServerList;
  };

  public joinAsPhone = async (token: IPhoneToken) => {

    this.socket = io(environment.socketUrl);
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.remoteStreams = {};
    this.peerConnections = {};
    this.socket.emit('joinRoomAsPhone', token, this.onServerResponseFromPhone);
  };

  private registerSocketDisconnect(
    joinRoomPayload: JoinRoomPayload,
    room: IRoom,
    password: string | null
  ) {
    this.socket?.on('disconnect', (reason: string) => {
      console.log('Reason, ', reason);
      // this is when the user disconnects on purpose
      if (reason && reason == 'io client disconnect') {
        return;
      }

      this.alertService.addAlert(
        'error',
        'Lost connection to server. Retrying connection...',
        5
      );
      console.warn('Socket disconnected. Attempting to reconnect...');

      this.socket?.once('connect', () => {
        console.log('Reconnected to server. Rejoining room...');
        this.alertService.addAlert(
          'warning',
          'Reconnected to server. Rejoining room...',
          5
        );
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
            //TODO
            this.alertService.addAlert(
              'success',
              'Successfully rejoined room',
              5
            );
          }
        );
      });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.devicesService.stopAndRemoveAllLocalMediaTracks();

    // Close and remove all peer connections
    for (const pc of Object.values(this.peerConnections)) {
      pc.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      pc.close();
    }
    this.peerConnections = {};

    // Clear remote streams and stop all tracks in the remote streams
    for (const stream of Object.values(this.remoteStreams)) {
      stream.getTracks().forEach((track) => track.stop());
    }
    this.remoteStreams = {};

    // Optionally, remove any media devices listeners if added
    navigator.mediaDevices.ondevicechange = null;
  }

  public getStream(socketId: string) {
    return this.remoteStreams[socketId] || null;
  }

  private handleSignal = async (data: {
    from: string;
    signal: any;
    user: IUser;
  }) => {
    this.logger.log('Handle signal: ', data.from, data.signal);
    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from, data.user);
    }
    const peerConnection = this.peerConnections[from];
    if (signal.type === 'offer') {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.socket?.emit('signal', {
        to: from,
        signal: peerConnection.localDescription,
      });
    } else if (signal.type === 'answer') {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal)
      );
    } else if (signal.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
    }
  };

  private handleNewPeer = (data: { socketId: string; user: IUser }) => {
    const { socketId } = data;//GETTING SOCKET ID
    if(socketId == this.socket?.id){//NEW
      return;
    }

    //not sure the correct order of this, trying in front of createPeerConnection
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
    }); //might not need this on peerDisconnectedFromPhone
  };

  private async createPeerConnection(
    socketId: string,
    newUser: IUser,
    isNewPeer: boolean = false
  ) {
    this.logger.log('Creating peer connection: ', socketId, newUser);
    try {
      if (this.amISpectator && newUser.type == UserType.Spectator) {
        this.logger.log("Not adding connection as it's spectator");
        return;
      }
      const peerConnection = this.initializePeerConnection(socketId, newUser);

      if (!this.amISpectator) {
        try {
          await this.devicesService.attachTrackToPeerConnection(peerConnection, socketId);
        } catch (error) {
          if (this.isSafeToOffer(peerConnection))
            await this.createReceiveOnlyOffer(peerConnection, socketId);
        }
      } else if (isNewPeer) {
        this.logger.log('signal state: ', peerConnection.signalingState);
        await this.createReceiveOnlyOffer(peerConnection, socketId);
      }
    } catch (error) {
      this.logger.error(
        'createPeerConnection error',
        { error: error, socketId, user: newUser },
        'WEB RTC createPeerConnection'
      );
      this.alertService.addAlert(
        'error',
        'There may be an error connecting to a player. Refreshing can help fix this issue'
      );
    }
  }

  private initializePeerConnection(
    socketId: string,
    user: IUser
  ): RTCPeerConnection {
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

  private async createReceiveOnlyOffer(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };
    const offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);
    this.socket?.emit('signal', {
      to: socketId,
      signal: peerConnection.localDescription,
    });
  }

  private async handleNegotiationNeeded(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    this.logger.log(
      'on negotiation: ',
      socketId,
      peerConnection.signalingState
    );

    try {
      if (peerConnection.signalingState === 'stable') {
        const offer = await peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        });

        await peerConnection.setLocalDescription(offer);

        this.socket?.emit('signal', {
          to: socketId,
          signal: peerConnection.localDescription,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error during negotiation: `,
        { error, socketId, peerConnection },
        'WEB RTC onnegotiationneeded'
      );
    }
  }

  private addRemoteStream(socketId: string, user: IUser) {
    return (event: RTCTrackEvent) => {
      this.logger.log('on track: ', event);
      const remoteStream = event.streams[0];

      this.remoteStreams[socketId] = remoteStream;
      if(this.gameService.isLocalPlayer(user.id)){
        this.devicesService.setLocalStream(remoteStream)
      }
      this.onStreamAdded.forEach((callback) => {
        callback(socketId, this.remoteStreams[socketId], user);
      });
    };
  }

  private handleIceCandidateEvent(
    socketId: string,
    event: RTCPeerConnectionIceEvent
  ) {
    this.logger.log('on ice candidate', event);
    if (event.candidate) {
      this.socket?.emit('signal', { to: socketId, signal: event.candidate });
    }
  }

  public sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', {
        text: message,
      });
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

  public getRemoteStream(socketId: string): MediaStream | null {
    return this.remoteStreams[socketId] || null;
  }

  public resetRoomPasswordInvalid() {
    this._roomPasswordValid.next(null);
  }

  public async changeDevice(
    videoDeviceId?: string,
    audioDeviceId?: string
  ): Promise<void> {
    if (!this.devicesService._localStream) {
      const localStream = await this.devicesService.initializeLocalStream(
        videoDeviceId!,
        audioDeviceId!
      );
      await this.updatePeerConnections(localStream!);
      return;
    }

    this.devicesService.changeDevice(videoDeviceId!, audioDeviceId!, this.peerConnections);
    
  }


}
