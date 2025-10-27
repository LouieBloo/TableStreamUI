import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IVideoQualify } from '../../interfaces/IVideoQualify';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocalDevicesService {
  localStorageService = inject(LocalStorageService);

  private _audioDevices = new BehaviorSubject<MediaDeviceInfo[]>([]);
  private _videoDevices = new BehaviorSubject<MediaDeviceInfo[]>([]);

  audioDevices$ = this._audioDevices.asObservable();
  videoDevices$ = this._videoDevices.asObservable();
  constructor() {}

  async setDevices(): Promise<void> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === 'audioinput'
    );
    const videoDevices = devices.filter(
      (device) => device.kind === 'videoinput'
    );
    this._audioDevices.next(audioDevices);
    this._videoDevices.next(videoDevices);
  }

  async getLocalMediaStreamWithConstraints(constraints: MediaStreamConstraints){
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
    if(!withAudio) constraints.audio = false;
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
}
