import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhoneCameraService } from '../../../services/phone-camera/phone-camera.service';
import { filter, map, switchMap } from 'rxjs';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';

@Component({
  selector: 'app-remote-camera',
  standalone: true,
  imports: [],
  templateUrl: './remote-camera.component.html',
  styleUrl: './remote-camera.component.css',
})
export class RemoteCameraComponent {
  readonly router = inject(ActivatedRoute);
  readonly webRtcService = inject(WebRTCService);

  ngOnInit() {
    this.router.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => this.webRtcService.joinAsPhone(id))
      )
      .subscribe({
        next: (response) => {
          //connect player to socket?
        },
        error: (err) => {
          console.error('Verification failed:', err);
        },
      });
  }
}
