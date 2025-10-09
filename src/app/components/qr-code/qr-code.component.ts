import { Component, inject } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { PhoneCameraService } from '../../services/phone-camera/phone-camera.service';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [QRCodeModule, AsyncPipe],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent {
  readonly qrcodeService = inject(PhoneCameraService);

  readonly url$ = this.qrcodeService.qrCode$.pipe(
    map((code: string) => {
      return `http://localhost:4200/join/remote-camera/${code}`;
    })
  );
}
