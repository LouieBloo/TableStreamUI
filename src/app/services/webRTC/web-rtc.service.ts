import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { GameErrorSeverity, GameErrorType, GameEvent, IGameError, IGameEvent, LocalGameEvent } from '../../interfaces/game';
import { IMessage } from '../../interfaces/message';
import { IUser, UserType } from '../../interfaces/player';
import { IRoom } from '../../interfaces/room';
import { AlertsService } from '../alerts/alerts.service';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  socket: Socket | null = null;
  localStream: MediaStream | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {};

  private userJoinedSubject = new Subject<{ id: string, user: IUser }>();
  public userJoined = this.userJoinedSubject.asObservable();

  private localGameEventSubject = new Subject<IGameEvent>();
  public localGameEvent = this.localGameEventSubject.asObservable();

  onStreamAdded: ((id: string, stream: MediaStream, user: IUser) => void)[] = [];
  onStreamRemoved: ((id: string) => void)[] = [];

  onGameEvent: ((update: IGameEvent) => void)[] = [];
  onMessage: ((message: IMessage) => void)[] = [];
  amISpectator: boolean = false;

  private _roomPasswordValid: BehaviorSubject<boolean|null> = new BehaviorSubject<boolean|null>(null);

  get roomPasswordValid(): Observable<boolean|null>{
    return this._roomPasswordValid.asObservable();
  }
  
  constructor(private alertService: AlertsService, private logger: LoggerService) {}


  
  public async initLocalStream(videoDeviceId?: string, audioDeviceId?: string): Promise<MediaStream|null> {
    if (this.localStream) { return this.localStream; }
  
    const constraints = this.getMediaConstraints(videoDeviceId, audioDeviceId);
  
    try {
      this.localStream = await this.getUserMedia(constraints);
    } catch (err:any) {

      // if(err.name === "NotFoundError"){
      //   this.alertService.addAlert("error", "One or more media devices could not be found");
      //   return null;
      // }
  
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.logger.log("Permission error: Trying again without audio")
        await this.getUserMediaWithoutAudio(constraints)
      }
       else {
        this.logger.error("Error getting media stream:", err)
        throw err;
      }
    }
  
    return this.localStream;
  }
  private async getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream|null> {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  private getMediaConstraints(videoDeviceId?: string, audioDeviceId?: string): MediaStreamConstraints {
    return {
      video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    };
  }

  private async getUserMediaWithoutAudio(constraints: MediaStreamConstraints) {
    try {
      constraints.audio = false;
      this.localStream = await this.getUserMedia(constraints);
    } catch (err) {
      this.logger.error("Error getting media stream without audio:", err);
      throw err;
    }
  }

  public async changeDevice(videoDeviceId?: string, audioDeviceId?: string): Promise<void> {
    // Stop existing tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Reinitialize local stream with new device(s)
    const constraints = this.getMediaConstraints();
    this.localStream = await this.getUserMedia(constraints);

    // Replace tracks in peer connections
    for (const socketId in this.peerConnections) {
      const pc = this.peerConnections[socketId];

      // Remove existing senders
      const senders = pc.getSenders();
      senders.forEach(sender => {
        pc.removeTrack(sender);
      });

      // Add new tracks
      this.localStream!.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });

      // Renegotiate the connection
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket?.emit('signal', { to: socketId, signal: pc.localDescription });
    }
  }

  public subscribeToStreamAdd(callback: (id: string, stream: MediaStream, user: IUser) => void) {
    this.onStreamAdded.push(callback);
  }

  //TODO unused method
  public unSubscribeToStreamAdd(callback: any) {
    this.onStreamAdded = this.onStreamAdded.filter((checkCallback) => { checkCallback !== callback })
  }

  public subscribeToStreamRemove(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  //TODO unused method
  public unSubscribeToStreamRemove(callback: any) {
    this.onStreamRemoved = this.onStreamRemoved.filter((checkCallback) => { checkCallback !== callback })
  }

  public joinRoom(playerName: any, roomId: any, password: any, gameType: any, roomName: any, userType: UserType, maxPlayers:number, callback: any) {

    this.socket = io(environment.socketUrl);
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
    this.socket.on('gameEvent', this.handleGameEvent);
    this.socket.on('errorResponse', this.handleErrorResponse);

    this.remoteStreams = {};
    this.peerConnections = {};

    this.amISpectator = userType == UserType.Spectator;

    if (this.socket) {
      this.socket.emit('joinRoom', {
        playerId: localStorage.getItem("playerId"),
        roomId: roomId,
        gameType: gameType,
        roomName: roomName,
        playerName: playerName,
        password: password && password != "null" ? password : null,
        userType: userType,
        maxPlayers: maxPlayers || 4
      },

        (newPlayer: IUser, room: IRoom, error: IGameError) => {
          if (error && error.type === GameErrorType.InvalidPassword) {
            this._roomPasswordValid.next(false);
            return;
          }
          // Set all our game state
          if (room.messages) {
            room.messages.forEach(m => this.handleMessage(m))
          }
          if (room.game && room.game.sharedCards) {
            room.game.sharedCards.forEach(card => {
              this.handleGameEvent({
                event: GameEvent.ShareCard,
                response: card
              })
            })
          }
          callback(newPlayer, roomName, room)
        });
    }
  }

  public disconnect() {
    // Disconnect the socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
  }

    // Stop and remove all local media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();  // Stop the track
        track.enabled = false;  // Disable it
      });
      this.localStream = null;
  }

    // Close and remove all peer connections
    for (const pc of Object.values(this.peerConnections)) {
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();  // Stop all sending tracks
        }
      });
      pc.close();  // Close the peer connection
    }
    this.peerConnections = {};

    // Clear remote streams and stop all tracks in the remote streams
    for (const stream of Object.values(this.remoteStreams)) {
      stream.getTracks().forEach(track => track.stop());
    }
    this.remoteStreams = {};

    // Optionally, remove any media devices listeners if added
    navigator.mediaDevices.ondevicechange = null;
  }

  public getStream(socketId: string) {
    if (this.remoteStreams[socketId]) {
      return this.remoteStreams[socketId]
    }
    return null;
  }

  private handleSignal = async (data: { from: string; signal: any, user: IUser }) => {

    this.logger.log("Handle signal: ", data.from, data.signal);

    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from, data.user);
    }
    const peerConnection = this.peerConnections[from];

    if (signal.type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.socket?.emit('signal', { to: from, signal: peerConnection.localDescription });
    } else if (signal.type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
    }
  };



  private handleNewPeer = (data: { socketId: string, user: IUser }) => {
    const { socketId } = data;
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
      callback(socketId)
    });
  };

  private async createPeerConnection(socketId: string, user: IUser, newPeer: boolean = false) {
    this.logger.log("Creating peer connection: ", socketId, user);

    try{
      // If we are a spectator and a spectator is coming in, we don't create a connection
      if (this.amISpectator && user.type == UserType.Spectator) {
        this.logger.log("Not adding connection as it's spectator")
        return;
      }

      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Add Google STUN server
      };
      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnections[socketId] = peerConnection;

      peerConnection.onicecandidate = (event) => {
        this.logger.log("on ice candidate", event);
        if (event.candidate) {
          this.socket?.emit('signal', { to: socketId, signal: event.candidate });
        }
      };

      peerConnection.ontrack = (event) => {
        this.logger.log("on track: ", event);

        this.remoteStreams[socketId] = event.streams[0];
        this.onStreamAdded.forEach(callback => {
          callback(socketId, this.remoteStreams[socketId], user)
        });
      };

      // Listen for negotiation needed event to handle offer/answer exchange
      peerConnection.onnegotiationneeded = async () => {
        this.logger.log("on negotiation: ", socketId, peerConnection.signalingState)

        try {

          if (peerConnection.signalingState === 'stable') {

            const offer = await peerConnection.createOffer({
              offerToReceiveVideo: true,
              offerToReceiveAudio: true
            });

            await peerConnection.setLocalDescription(offer);

            this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
          }
        } catch (error) {
          this.logger.error(`Error during negotiation: `, error)
        }
      };

      if (!this.amISpectator) {
        //try to add our tracks to the connection
        try{
          let localS = await this.initLocalStream()
          localS!.getTracks().forEach((track) => {
            this.logger.log("adding tracks for: ", socketId);
            peerConnection.addTrack(track, this.localStream!);
          });
        }catch(error){
          //if we cant, offer to receive (no permission, no camera, etc)
          if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {
            // Create an offer to receive remote tracks
            const offerOptions = {
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            };

            const offer = await peerConnection.createOffer(offerOptions);
            await peerConnection.setLocalDescription(offer);
            this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
          }
        }
      } else if (newPeer) {
        this.logger.log("signal state: ", peerConnection.signalingState);

        const offer = await peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true
        });

        await peerConnection.setLocalDescription(offer);
        this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
      }
    }catch(error){
      this.logger.error("createPeerConnection error", error);
      this.alertService.addAlert("error", "There may be an error connecting to a player. Refreshing can help fix this issue");
    }
  }

  public sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', {
        text: message
      });
    }
  }

  handleMessage = (message: IMessage) => {
    this.onMessage.forEach(callback => {
      if (callback != null) {
        callback(message);
      }
    })
  }

  sendGameEvent = (event: IGameEvent) => {
    if (this.socket) {
      this.socket.emit('gameEvent', event);
    }
  }

  handleGameEvent = (event: IGameEvent) => {
    this.onGameEvent.forEach(callback => {
      if (callback != null) {
        callback(event)
      }
    })
  }

  handleLocalGameEvent = (event: IGameEvent) => {
    this.localGameEventSubject.next(event);
  }

  handleErrorResponse = (error: IGameError) => {
    this.alertService.addAlert(error.severity == GameErrorSeverity.Error ? 'error' : 'warning', error.message);
  }

  public subscribeToGameEvents = (callback: (update: IGameEvent) => void) => {
    this.onGameEvent.push(callback);
  }

  public unsubscribeToGameEvent = (callback: (update: IGameEvent) => void) => {
    this.onGameEvent = this.onGameEvent.filter((checkCallback) => { checkCallback !== callback })
  }

  // Mute/Unmute methods
  public muteSelf(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = false);
    }
  }

  public unmuteSelf(): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = true);
    }
  }

  public turnOffVideo(): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => track.enabled = false);
    }
  }

  public turnOnVideo(): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => track.enabled = true);
    }
  }

  public getRemoteStream(socketId: string): MediaStream | null {
    return this.remoteStreams[socketId] || null;
  }

  public resetRoomPasswordInvalid(){
    this._roomPasswordValid.next(null);
  }


}
