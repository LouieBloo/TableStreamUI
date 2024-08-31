import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { IMessage } from '../../interfaces/message';
import { environment } from '../../../environments/environment';
import { IPlayer, IUser, UserType } from '../../interfaces/player';
import { IGameError, IGameEvent } from '../../interfaces/game';
import { AlertsService } from '../alerts/alerts.service';

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

  amISpectator:boolean = false;
  // roomName: string = "";
  // playerName: string = "";

  constructor(private alertService:AlertsService) {

  }

  public async initLocalStream(): Promise<MediaStream> {
    if (this.localStream) { return this.localStream }

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    console.log("init local stream: ", this.localStream)
    return this.localStream;
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



  public joinRoom(playerName: any, roomName: any, userType: UserType, callback: any) {
    this.socket = io(environment.socketUrl);
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
    this.socket.on('gameEvent', this.handleGameEvent);
    this.socket.on('errorResponse',this.handleErrorResponse);

    this.amISpectator = userType == UserType.Spectator;

    if (this.socket) {
      this.socket.emit('joinRoom', { roomName: roomName, playerName: playerName, userType: userType }, (newPlayer: IUser) => {
        console.log('Server responded with unique ID:', newPlayer.id);
        callback(newPlayer, roomName)
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
    this.createPeerConnection(socketId, data.user);
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

  private async createPeerConnection(socketId: string, user: IUser) {
    console.log("Creating peer connection: ", socketId, user)
    //if we are a spectator and a spectator is coming in we dont create a connection
    if(this.amISpectator && user.type == UserType.Spectator){
      console.log("not adding connection as its spectator");
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
      // if (!this.remoteStreams[socketId]) {
      //   this.remoteStreams[socketId] = new MediaStream();
      // }
      // event.streams[0].getTracks().forEach(track => {
      //   this.remoteStreams[socketId].addTrack(track);
      // });
      console.log("on track: ", event)
      this.remoteStreams[socketId] = event.streams[0];
      this.onStreamAdded.forEach(callback => {
        callback(socketId, this.remoteStreams[socketId], user)
      });
    };

    // if (this.localStream) {
    //   this.localStream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, this.localStream!);
    //   });
    // }

    // Listen for negotiation needed event to handle offer/answer exchange
    peerConnection.onnegotiationneeded = async () => {
      console.log("on negation: ", socketId, peerConnection.signalingState)
      try {
        
        if (peerConnection.signalingState === 'stable') {

          
          const offer = await peerConnection.createOffer({
            offerToReceiveVideo: user.type == UserType.Player,
            offerToReceiveAudio: false
          });

          // let localS = await this.initLocalStream()
          // localS.getTracks().forEach((track) => {
          //   peerConnection.addTrack(track  , this.localStream!);
          // });

          // if(!this.amISpectator){
          //   await peerConnection.setLocalDescription(offer);
          // }

          await peerConnection.setLocalDescription(offer);
          
          this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
        }
      } catch (error) {
        console.error('Error during negotiation', error);
      }
    };


    if(!this.amISpectator){
      console.log("setting local stream:   ")
      let localS = await this.initLocalStream()
      localS.getTracks().forEach((track) => {
        console.log("adding tracks for: ", socketId)
        peerConnection.addTrack(track, this.localStream!);
      });
    }else{
      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: false
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

  handleErrorResponse = (error: IGameError)=>{
    console.log(error);
    this.alertService.addAlert("error",error.message);
  }

  public subscribeToGameEvents = (callback: (update: IGameEvent) => void) => {
    this.onGameEvent.push(callback);
  }
}