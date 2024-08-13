import { Injectable } from '@angular/core';
import io, { Socket } from 'socket.io-client';
import { Message } from '../../interfaces/message';


@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  socket: Socket | null = null;
  localStream: MediaStream | null = null;
  peerConnections: { [key: string]: RTCPeerConnection } = {};
  remoteStreams: { [key: string]: MediaStream } = {};
  onStreamAdded: ((id: string, stream: MediaStream) => void)[] = [];
  onStreamRemoved: ((id: string) => void)[] = [];

  onMessage: ((message: Message) => void)[] = [];

  roomName: string = "";
  playerName: string = "";

  constructor() {
    this.socket = io('https://api.table-stream.com');
    this.socket.on('signal', this.handleSignal);
    this.socket.on('newPeer', this.handleNewPeer);
    this.socket.on('peerDisconnected', this.handlePeerDisconnected);
    this.socket.on('message', this.handleMessage);
  }

  public async initLocalStream(): Promise<MediaStream> {
    if (this.localStream) { return this.localStream }

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    console.log("init local stream: ", this.localStream)
    return this.localStream;
  }

  public subscribeToStreamAdd(callback: (id: string, stream: MediaStream) => void) {
    this.onStreamAdded.push(callback);
  }

  public unSubscribeToStreamAdd(callback: any){
    this.onStreamAdded = this.onStreamAdded.filter((checkCallback)=>{checkCallback !== callback})
  }

  public subscribeToStreamRemove(callback: (id: string) => void) {
    this.onStreamRemoved.push(callback);
  }

  public unSubscribeToStreamRemove(callback: any){
    console.log("before: ", this.onStreamRemoved.length)
    this.onStreamRemoved = this.onStreamRemoved.filter((checkCallback)=>{checkCallback !== callback})
    console.log(this.onStreamRemoved.length)
  }

  public setInfo(roomName:string, playerName:string){
    this.roomName = roomName;
    this.playerName = playerName;
  }

  public joinRoom() {
    if (this.socket) {
      this.socket.emit('joinRoom', {roomName: this.roomName,playerName: this.playerName });
    }
  }

  public getStream(socketId: string) {
    if (this.remoteStreams[socketId]) {
      return this.remoteStreams[socketId]
    }
    return null;
  }

  private handleSignal = async (data: { from: string; signal: any }) => {

    console.log("Handle signal: ", data.from, data.signal)

    const { from, signal } = data;
    if (!this.peerConnections[from]) {
      this.createPeerConnection(from);
    }
    const peerConnection = this.peerConnections[from];

    console.log("signal type: ", signal.type)
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

  private handleNewPeer = (data: { socketId: string }) => {
    const { socketId } = data;
    this.createPeerConnection(socketId);
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

  private async createPeerConnection(socketId: string) {
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
      console.log("On track: ", event)
      // if (!this.remoteStreams[socketId]) {
      //   this.remoteStreams[socketId] = new MediaStream();
      // }
      // event.streams[0].getTracks().forEach(track => {
      //   this.remoteStreams[socketId].addTrack(track);
      // });
      console.log("on track length ", this.onStreamAdded.length)
      this.remoteStreams[socketId] = event.streams[0];
      this.onStreamAdded.forEach(callback => {
        callback(socketId, this.remoteStreams[socketId])
      });
    };

    // if (this.localStream) {
    //   this.localStream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, this.localStream!);
    //   });
    // }

    // Listen for negotiation needed event to handle offer/answer exchange
    peerConnection.onnegotiationneeded = async () => {
      console.log("onnegationation")
      try {
        if (peerConnection.signalingState === 'stable') {
          console.log("onnegationation stable")
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
      console.log("adding local tracks");
      peerConnection.addTrack(track, this.localStream!);
    });

  }

  public sendMessage(message: string) {
    if (this.socket) {
      this.socket.emit('message', {
        roomName: this.roomName,
        playerName: this.playerName,
        message: message
      });
    }
  }

  private handleMessage = (message: Message) => {
    this.onMessage.forEach(callback => callback(message));
  };

  public subscribeToMessage = (callback: (message: Message) => void) => {
    this.onMessage.push(callback);
  }

  public unSubscribeToMessage = (callback: (message: Message) => void) => {
    this.onMessage = this.onMessage.filter((checkCallback) => { checkCallback != callback })
  }
}