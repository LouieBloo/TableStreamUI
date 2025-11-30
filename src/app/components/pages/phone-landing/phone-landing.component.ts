import { Component, inject } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { ActivatedRoute } from '@angular/router';
import { IPhoneToken } from '../../../interfaces/IPhoneToken';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { from, switchMap } from 'rxjs';
import { LocalDevicesService } from '../../../services/devices/devices.service';

@Component({
  selector: 'app-phone-landing',
  standalone: true,
  imports: [],
  templateUrl: './phone-landing.component.html',
  styleUrl: './phone-landing.component.css',
})
export class PhoneLandingComponent {
  webRtcService = inject(WebRTCService);
  devicesService = inject(LocalDevicesService);
  activatedRoute = inject(ActivatedRoute);
  localStorageService = inject(LocalStorageService);
  videoQuality: string;

  constructor() {
    this.videoQuality = this.localStorageService.videoQuality || '16/9-1080';
  }

  ngOnInit() {
    const phoneToken: IPhoneToken = {
      playerToken: this.activatedRoute.snapshot.paramMap.get('playerToken'),
      roomId: this.activatedRoute.snapshot.queryParamMap.get('roomId'),
    };
    this.webRtcService.joinAsPhone(phoneToken);
  }

  onVideoQualityChange(event: any) {
    this.videoQuality = event.target.value;
    this.localStorageService.setVideoQuality(this.videoQuality);
    this.changeDeviceReactive();
  }

  changeDeviceReactive() {
    from(
      this.webRtcService.changeDevice(
        this.devicesService.selectedVideoDeviceId.value,
        this.devicesService.selectedAudioDeviceId.value
      )
    )
      .pipe(
        switchMap(() =>
          from(
            this.devicesService.buildLocalStream(
              this.devicesService.selectedVideoDeviceId.value,
              this.devicesService.selectedAudioDeviceId.value
            )
          )
        )
      )
      .subscribe({
        next: (stream: MediaStream | null) => {
          // if (!stream) return;
          // if (this.video.nativeElement) {
          //   this.video.nativeElement.srcObject = stream;
          //   this.video.nativeElement.muted = true;
          // }
          // const isMicMuted = this.localStorageService.isMicMuted;
          // this.isMutedSelf = isMicMuted === 'true';
        },
        error: (err) => console.error('Error changing device:', err),
      });
  }
}
