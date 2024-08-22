import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { IMessage } from '../../interfaces/message';
import { environment } from '../../../environments/environment';
import { IPlayer } from '../../interfaces/player';
import { IGameEvent } from '../../interfaces/game';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  socket: Socket | null = null;
  localStream: MediaStream | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {};
  onStreamAdded: ((id: string, stream: MediaStream, player: IPlayer) => void)[] = [];
  onStreamRemoved: ((id: string) => void)[] = [];
  onGameEvent: ((update: IGameEvent) => void)[] = [];
  onMessage: ((message: IMessage) => void)[] = [];

  // roomName: string = "";
  // playerName: string = "";

  constructor() {

  }

  public async initLocalStream(): Promise<MediaStream> {
    if (this.localStream) { return this.localStream }

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    console.log("init local stream: ", this.localStream)
    return this.localStream;
  }

  public subscribeToStreamAdd(callback: (id: string, stream: MediaStream, player: IPlayer) => void) {
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



  public joinRoom(playerName: any, roomName: any, callback: any) {
    this.socket = io(environment.socketUrl);
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
    this.socket.on('gameEvent', this.handleGameEvent);

    if (this.socket) {
      this.socket.emit('joinRoom', { roomName: roomName, playerName: playerName }, (newPlayer: IPlayer) => {
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

  private handleSignal = async (data: { from: string; signal: any, player: IPlayer }) => {

    console.log("Handle signal: ", data.from, data.signal)

    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from, data.player);
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

  private handleNewPeer = (data: { socketId: string, player: IPlayer }) => {
    const { socketId } = data;
    this.createPeerConnection(socketId, data.player);
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

  private async createPeerConnection(socketId: string, player: IPlayer) {
    console.log("Creating peer connection: ", socketId)
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Add Google STUN server
    };
    const peerConnection = new RTCPeerConnection(configuration);
    this.peerConnections[socketId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
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
      this.remoteStreams[socketId] = event.streams[0];
      this.onStreamAdded.forEach(callback => {
        callback(socketId, this.remoteStreams[socketId], player)
      });
    };

    // if (this.localStream) {
    //   this.localStream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, this.localStream!);
    //   });
    // }

    // Listen for negotiation needed event to handle offer/answer exchange
    peerConnection.onnegotiationneeded = async () => {
      try {
        if (peerConnection.signalingState === 'stable') {
          const offer = await peerConnection.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: false
          });

          // let localS = await this.initLocalStream()
          // localS.getTracks().forEach((track) => {
          //   peerConnection.addTrack(track  , this.localStream!);
          // });
          await peerConnection.setLocalDescription(offer);
          this.socket?.emit('signal', { to: socketId, signal: peerConnection.localDescription });
        }
      } catch (error) {
        console.error('Error during negotiation', error);
      }
    };


    let localS = await this.initLocalStream()
    localS.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream!);
    });

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

  public subscribeToGameEvents = (callback: (update: IGameEvent) => void) => {
    this.onGameEvent.push(callback);
  }
}