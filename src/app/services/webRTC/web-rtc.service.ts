import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { IMessage } from '../../interfaces/message';
import { environment } from '../../../environments/environment';
import { IPlayer, IUser, UserType } from '../../interfaces/player';
import { GameErrorType, GameEvent, GameType, IGameError, IGameEvent } from '../../interfaces/game';
import { AlertsService } from '../alerts/alerts.service';
import { IRoom } from '../../interfaces/room';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  socket: Socket | null = null;
  localStream: MediaStream | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {};
  onStreamAdded: ((id: string, stream: MediaStream, user: IUser) => void)[] = [];
  onStreamRemoved: ((id: string) => void)[] = [];
  onGameEvent: ((update: IGameEvent) => void)[] = [];
  onMessage: ((message: IMessage) => void)[] = [];

  amISpectator: boolean = false;

  constructor(private alertService: AlertsService) {}

  public async initLocalStream(videoDeviceId?: string, audioDeviceId?: string): Promise<MediaStream> {
    if (this.localStream) { return this.localStream }

    const constraints: MediaStreamConstraints = {
      video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
    };

    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("init local stream: ", this.localStream)
    return this.localStream;
  }

  public async changeDevice(videoDeviceId?: string, audioDeviceId?: string): Promise<void> {
    // Stop existing tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Reinitialize local stream with new device(s)
    const constraints: MediaStreamConstraints = {
      video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
    };

    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Replace tracks in peer connections
    for (const socketId in this.peerConnections) {
      const pc = this.peerConnections[socketId];

      // Remove existing senders
      const senders = pc.getSenders();
      senders.forEach(sender => {
        pc.removeTrack(sender);
      });

      // Add new tracks
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });

      // Renegotiate the connection
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket?.emit('signal', { to: socketId, signal: pc.localDescription });
    }
  }

  public async getMediaDevices(): Promise<MediaDeviceInfo[]> {
    return await navigator.mediaDevices.enumerateDevices();
  }

  public subscribeToStreamAdd(callback: (id: string, stream: MediaStream, user: IUser) => void) {
    this.onStreamAdded.push(callback);
  }

  public unSubscribeToStreamAdd(callback: any) {
    this.onStreamAdded = this.onStreamAdded.filter((checkCallback) => { checkCallback !== callback })
  }

  public subscribeToStreamRemove(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  public unSubscribeToStreamRemove(callback: any) {
    this.onStreamRemoved = this.onStreamRemoved.filter((checkCallback) => { checkCallback !== callback })
    console.log(this.onStreamRemoved.length)
  }

  public joinRoom(playerName: any, roomId: any, password: any, gameType: any, roomName: any, userType: UserType, callback: any) {
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
        password: password,
        userType: userType
      },

        (newPlayer: IUser, room: IRoom, error: any) => {
          if (error) {
            console.log(error)
            this.alertService.addAlert("error", error.message);
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getStream(socketId: string) {
    if (this.remoteStreams[socketId]) {
      return this.remoteStreams[socketId]
    }
    return null;
  }

  private handleSignal = async (data: { from: string; signal: any, user: IUser }) => {

    console.log("Handle signal: ", data.from, data.signal)

    const { from, signal } = data;
    console.log(this.peerConnections, " ", from)
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
    this.createPeerConnection(socketId, data.user, true);
  };

  private handlePeerDisconnected = (data: { socketId: string }) => {
    const { socketId } = data;
    if (this.peerConnections[socketId]) {
      console.log("handle delete peer: ", socketId)
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }
    if (this.remoteStreams[socketId]) {
      console.log("handle delete stream: ", socketId)
      delete this.remoteStreams[socketId];
    }

    console.log("handling peer callbacks: ", this.onStreamRemoved.length)
    this.onStreamRemoved.forEach((callback) => {
      callback(socketId)
    });
  };

  private async createPeerConnection(socketId: string, user: IUser, newPeer: boolean = false) {
    console.log("Creating peer connection: ", socketId, user)
    // If we are a spectator and a spectator is coming in, we don't create a connection
    if (this.amISpectator && user.type == UserType.Spectator) {
      console.log("Not adding connection as it's spectator");
      return;
    }

    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Add Google STUN server
    };
    const peerConnection = new RTCPeerConnection(configuration);
    this.peerConnections[socketId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      console.log("on ice candidate: ", event)
      if (event.candidate) {
        this.socket?.emit('signal', { to: socketId, signal: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("on track: ", event)
      this.remoteStreams[socketId] = event.streams[0];
      this.onStreamAdded.forEach(callback => {
        callback(socketId, this.remoteStreams[socketId], user)
      });
    };

    // Listen for negotiation needed event to handle offer/answer exchange
    peerConnection.onnegotiationneeded = async () => {
      console.log("on negotiation: ", socketId, peerConnection.signalingState)
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
        console.error('Error during negotiation', error);
      }
    };

    if (!this.amISpectator) {
      console.log("setting local stream:   ")
      let localS = await this.initLocalStream()
      localS.getTracks().forEach((track) => {
        console.log("adding tracks for: ", socketId)
        peerConnection.addTrack(track, this.localStream!);
      });
    } else if (newPeer) {

      console.log("signal state: ", peerConnection.signalingState)
      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });

      await peerConnection.setLocalDescription(offer);
      this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
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

  handleErrorResponse = (error: IGameError) => {
    console.log(error);
    this.alertService.addAlert("error", error.message);
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

}
