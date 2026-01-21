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
    this.changeDevice();
  }

  changeDevice() {
    from(this.webRtcService.changeDevice())
      .pipe(
        switchMap(() => from(this.devicesService.buildLocalStreamFromSelectedDevices()))
      )
      .subscribe({
        next: (stream: MediaStream | null) => {},
        error: (err) => console.error('Error changing device:', err),
      });
  }
}
