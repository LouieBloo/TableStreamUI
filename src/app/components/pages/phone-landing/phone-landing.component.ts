import { Component, inject } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { ActivatedRoute } from '@angular/router';
import { IPhoneToken } from '../../../interfaces/IPhoneToken';

@Component({
  selector: 'app-phone-landing',
  standalone: true,
  imports: [],
  templateUrl: './phone-landing.component.html',
  styleUrl: './phone-landing.component.css'
})
export class PhoneLandingComponent {

  webRtcService = inject(WebRTCService);
 route = inject(ActivatedRoute);
  ngOnInit(){
    const phoneToken: IPhoneToken = {
      playerToken: this.route.snapshot.paramMap.get('playerToken'),
      roomId: this.route.snapshot.queryParamMap.get('roomId')
    }
    this.webRtcService.joinAsPhone(phoneToken);
  }
}
