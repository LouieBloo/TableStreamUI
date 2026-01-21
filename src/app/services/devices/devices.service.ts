import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IVideoQualify } from '../../interfaces/IVideoQualify';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root',
})
export class LocalDevicesService {
  localStorageService = inject(LocalStorageService);
  logger = inject(LoggerService);

  private _audioDevices = new BehaviorSubject<MediaDeviceInfo[]>([]);
  private _videoDevices = new BehaviorSubject<MediaDeviceInfo[]>([]);
  public _localStream = new BehaviorSubject<MediaStream | null>(null);

  audioDevices$ = this._audioDevices.asObservable();
  videoDevices$ = this._videoDevices.asObservable();
  localStream$ = this._localStream.asObservable();

  selectedVideoDeviceId = new BehaviorSubject<string>('');
  selectedAudioDeviceId = new BehaviorSubject<string>('');

  setLocalStream(stream: MediaStream) {
    this._localStream.next(stream);
  }

  public buildLocalStreamFromSelectedDevices() {
    return this.buildLocalStream(
      this.selectedVideoDeviceId.value,
      this.selectedAudioDeviceId.value
    );
  }

  public async buildLocalStream(
    videoDeviceId?: string,
    audioDeviceId?: string,
    aspectRatio: string = '16/9'
  ): Promise<MediaStream | null> {
    if (this._localStream.value) {
      this.logAspectRatio(this._localStream.value);
      return this._localStream.value;
    }

    try {
      const stream = await this.getLocalMediaStream(
        videoDeviceId,
        audioDeviceId,
        aspectRatio
      );
      this.selectedVideoDeviceId.next(videoDeviceId!);
      this.selectedAudioDeviceId.next(audioDeviceId!);
      this.setLocalStream(stream!);
      this.logAspectRatio(stream!);
    } catch (err: any) {
      if (this.isPermissionError(err)) {
        this.logger.log('Permission error: Trying again without audio');

        await this.setUserMediaWithoutAudio(videoDeviceId, audioDeviceId, aspectRatio);
      } else {
        throw err;
      }
    }

    return this._localStream.value;
  }

  private isPermissionError(err: any) {
    return err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
  }

  async setDevices(): Promise<void> {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices = devices.filter((device) => device.kind === 'videoinput');
    const audioDevices = devices.filter((device) => device.kind === 'audioinput');

    this._videoDevices.next(videoDevices);
    this._audioDevices.next(audioDevices);
    const selectedVideoDeviceId = videoDevices[0].deviceId;
    const selectedAudioDeviceId = audioDevices[0].deviceId;
    await this.buildLocalStream(selectedVideoDeviceId, selectedAudioDeviceId);
  }

  async getLocalMediaStreamWithConstraints(
    videoDeviceChanged: boolean,
    audioDeviceChanged: boolean
  ) {
    const constraints = this.getConstraints(videoDeviceChanged, audioDeviceChanged);
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  //confirm with luke that this name makes sense
  async getLocalMediaStream(
    videoDeviceId?: string,
    audioDeviceId?: string,
    videoQuality?: string,
    withAudio: boolean = true
  ): Promise<MediaStream | null> {
    const constraints = this.getMediaConstraints(
      videoDeviceId,
      audioDeviceId,
      videoQuality
    );
    if (!withAudio) constraints.audio = false;
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  public getMediaConstraints(
    videoDeviceId?: string,
    audioDeviceId?: string,
    videoQuality: string = '16/9-1080'
  ): MediaStreamConstraints {
    const targetVideoQuality: IVideoQualify = this.getCameraVideoQuality();

    return {
      video: videoDeviceId
        ? {
            deviceId: { exact: videoDeviceId },
            width: { ideal: targetVideoQuality.idealWidth },
            height: { ideal: targetVideoQuality.idealHeight },
            aspectRatio: { ideal: targetVideoQuality.idealAspectRatio },
          }
        : {
            width: { ideal: targetVideoQuality.idealWidth },
            height: { ideal: targetVideoQuality.idealHeight },
            aspectRatio: { ideal: targetVideoQuality.idealAspectRatio },
          },
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    };
  }

  /**
   * Given a video quality stream return the ideal width, height, and aspect ratio.
   * Ex videoQuality: '16/9-1080', '16/9-2k', '4/3-960', '4/3-25'
   * @param videoQuality
   * @returns
   */
  public getCameraVideoQuality(): IVideoQualify {
    const videoQuality = this.localStorageService.videoQuality || '16/9-1080';
    const [ratio, quality] = videoQuality.split('-');
    let idealWidth: number;
    let idealHeight: number;
    let idealAspectRatio: number;

    if (ratio === '4/3') {
      idealAspectRatio = 4 / 3;
      if (quality === '2k') {
        idealWidth = 1600;
        idealHeight = 1200;
      } else if (quality === '720') {
        idealWidth = 960;
        idealHeight = 720;
      } else {
        // Default for 4:3
        idealWidth = 1280;
        idealHeight = 960;
      }
    } else {
      idealAspectRatio = 16 / 9;
      if (quality === '2k') {
        idealWidth = 2560;
        idealHeight = 1440;
      } else if (quality === '720') {
        idealWidth = 1280;
        idealHeight = 720;
      } else {
        // Default 1080p for 16:9
        idealWidth = 1920;
        idealHeight = 1080;
      }
    }

    return {
      idealAspectRatio,
      idealWidth,
      idealHeight,
    };
  }

  public async attachTrackToPeerConnection(
    peerConnection: RTCPeerConnection,
    socketId: string
  ) {
    const localStream = await this.buildLocalStream();
    localStream!.getTracks().forEach((track) => {
      this.logger.log('adding tracks for: ', socketId);
      if (track.kind === 'audio') {
        const micMuted = this.localStorageService.isMicMuted === 'true';
        track.enabled = !micMuted;
      }
      peerConnection.addTrack(track, localStream!);
    });
  }

  public stopAndRemoveAllLocalMediaTracks() {
    if (this._localStream.value) {
      this._localStream.value.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      this._localStream.next(null);
    }
  }

  public muteSelf(): void {
    if (this._localStream.value) {
      this._localStream.value
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));
    }
  }

  public unmuteSelf(): void {
    if (this._localStream.value) {
      this._localStream.value.getAudioTracks().forEach((track) => (track.enabled = true));
    }
  }

  public turnOffVideo(): void {
    if (this._localStream.value) {
      this._localStream.value
        .getVideoTracks()
        .forEach((track) => (track.enabled = false));
    }
  }

  public turnOnVideo(): void {
    if (this._localStream.value) {
      this._localStream.value.getVideoTracks().forEach((track) => (track.enabled = true));
    }
  }

  public stopAndRemoveTrack(mediaStreamTrack: MediaStreamTrack) {
    mediaStreamTrack?.stop();
    this._localStream.value?.removeTrack(mediaStreamTrack);
  }

  public addTrack(mediaStreamTrack: MediaStreamTrack) {
    this._localStream.value?.addTrack(mediaStreamTrack);
  }

  public getFirstVideoTrack() {
    return this._localStream.value?.getVideoTracks()[0];
  }

  public getFirstAudioTrack() {
    return this._localStream.value?.getAudioTracks()[0];
  }

  private hasVideoDeviceChanged(currentVideoTrack?: MediaStreamTrack) {
    const videoDeviceId = this.selectedVideoDeviceId.value;
    const currentDeviceId = currentVideoTrack?.getSettings().deviceId;
    return videoDeviceId !== undefined && videoDeviceId !== currentDeviceId;
  }

  private hasAudioDeviceChanged(currentAudioTrack?: MediaStreamTrack) {
    const audioDeviceId = this.selectedAudioDeviceId.value;
    const currentDeviceId = currentAudioTrack?.getSettings().deviceId;
    return audioDeviceId !== undefined && audioDeviceId !== currentDeviceId;
  }

  private getConstraints(videoDeviceChanged: boolean, audioDeviceChanged: boolean) {
    const videoQuality = this.getCameraVideoQuality();
    const videoDeviceId = this.selectedVideoDeviceId.value;
    const audioDeviceId = this.selectedAudioDeviceId.value;

    const constraints: MediaStreamConstraints = {
      video: videoDeviceChanged
        ? {
            deviceId: { exact: videoDeviceId },
            width: { ideal: videoQuality.idealWidth },
            height: { ideal: videoQuality.idealHeight },
            aspectRatio: { ideal: videoQuality.idealAspectRatio },
          }
        : false,
      audio: audioDeviceChanged
        ? {
            deviceId: { exact: audioDeviceId },
          }
        : false,
    };

    return constraints;
  }

  private async tryApplyingVideoConstraints(currentVideoTrack: MediaStreamTrack) {
    const videoQuality = this.getCameraVideoQuality();
    try {
      await currentVideoTrack.applyConstraints({
        width: { ideal: videoQuality.idealWidth },
        height: { ideal: videoQuality.idealHeight },
        aspectRatio: { ideal: videoQuality.idealAspectRatio },
      });
    } catch (err) {
      console.error('Error applying constraints to video track:', err);
    }
  }

  public async changeDevice(peerConnections: { [key: string]: RTCPeerConnection }) {
    const currentVideoTrack = this.getFirstVideoTrack();
    const currentAudioTrack = this.getFirstAudioTrack();

    const videoDeviceChanged = this.hasVideoDeviceChanged(currentVideoTrack);
    const audioDeviceChanged = this.hasAudioDeviceChanged(currentAudioTrack);

    if (!videoDeviceChanged && currentVideoTrack) {
      await this.tryApplyingVideoConstraints(currentVideoTrack);
    }

    let newVideoTrack: MediaStreamTrack | null = null;
    let newAudioTrack: MediaStreamTrack | null = null;

    if (videoDeviceChanged || audioDeviceChanged) {
      const tracks = await this.acquireNewMediaTracks(
        videoDeviceChanged,
        audioDeviceChanged
      );

      newVideoTrack = tracks.videoTrack;
      newAudioTrack = tracks.audioTrack;
    }

    if (videoDeviceChanged && newVideoTrack) {
      this.replaceDeviceTrack(
        'video',
        currentVideoTrack!,
        newVideoTrack,
        peerConnections
      );
    }

    if (audioDeviceChanged && newAudioTrack) {
      this.replaceDeviceTrack(
        'audio',
        currentAudioTrack!,
        newAudioTrack,
        peerConnections
      );
    }

    this.logAspectRatio(this._localStream.value!);
  }

  private async acquireNewMediaTracks(
    videoDeviceChanged: boolean,
    audioDeviceChanged: boolean
  ): Promise<{
    videoTrack: MediaStreamTrack | null;
    audioTrack: MediaStreamTrack | null;
  }> {
    let videoTrack: MediaStreamTrack | null = null;
    let audioTrack: MediaStreamTrack | null = null;

    try {
      const newStream = await this.getLocalMediaStreamWithConstraints(
        videoDeviceChanged,
        audioDeviceChanged
      );
      if (newStream) {
        if (videoDeviceChanged) {
          videoTrack = newStream.getVideoTracks()[0] || null;
        }
        if (audioDeviceChanged) {
          audioTrack = newStream.getAudioTracks()[0] || null;
        }
      }
    } catch (err) {
      console.error('Error getting new media stream:', err);
    }

    return { videoTrack, audioTrack };
  }

  public async initializeLocalStream() {
    const videoDeviceId = this.selectedVideoDeviceId.value;
    const audioDeviceId = this.selectedAudioDeviceId.value;

    if (!this._localStream.value) {
      const stream = await this.getLocalMediaStream(videoDeviceId, audioDeviceId);
      this._localStream.next(stream);
    }
    return this._localStream.value;
  }

  private async replaceDeviceTrack(
    kind: 'video' | 'audio',
    currentTrack: MediaStreamTrack,
    newTrack: MediaStreamTrack,
    peerConnections: { [key: string]: RTCPeerConnection }
  ) {
    this.stopAndRemoveTrack(currentTrack);
    this.addTrack(newTrack);
    await this.replaceTrackInPeerConnections(kind, newTrack, peerConnections);
  }

  private async setUserMediaWithoutAudio(
    videoDeviceId?: string,
    audioDeviceId?: string,
    aspectRatio: string = '16/9'
  ) {
    try {
      const stream = await this.getLocalMediaStream(
        videoDeviceId,
        audioDeviceId,
        aspectRatio,
        false
      );
      this._localStream.next(stream);
      this.logAspectRatio(this._localStream.value!);
    } catch (err) {
      this.logger.error('Error getting media stream without audio:', err);
    }
  }

  private async replaceTrackInPeerConnections(
    kind: 'video' | 'audio',
    newTrack: MediaStreamTrack,
    peerConnections: { [key: string]: RTCPeerConnection }
  ) {
    for (const socketId in peerConnections) {
      const peerConnection = peerConnections[socketId];
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === kind);
      if (sender) {
        await sender.replaceTrack(newTrack);
      } else {
        peerConnection.addTrack(newTrack, this._localStream.value!);
      }
    }
  }

  private logAspectRatio(stream: MediaStream): void {
    if (!stream) {
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      if (settings.width && settings.height) {
        const aspectRatio = settings.width / settings.height;
        this.logger.log(
          `Camera aspect ratio: ${aspectRatio.toFixed(2)} (width: ${
            settings.width
          }, height: ${settings.height})`
        );
      } else {
        this.logger.log(
          'Could not determine camera aspect ratio (width/height not available in settings).'
        );
      }
    } else {
      this.logger.log('No video track available to determine aspect ratio.');
    }
  }
}
