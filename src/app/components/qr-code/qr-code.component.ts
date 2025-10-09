import { Component, inject, Input } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { PhoneCameraService } from '../../services/phone-camera/phone-camera.service';
import { AsyncPipe } from '@angular/common';
import { map, Observable, of } from 'rxjs';
import { IPlayer } from '../../interfaces/IPlayer';
import { GameService } from '../../services/game/game.service';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [QRCodeModule, AsyncPipe],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent {
  @Input() player?: IPlayer | null;
  readonly phoneCameraService = inject(PhoneCameraService);
  readonly gameService = inject(GameService);

  url$: Observable<string> = of("");

  ngOnInit() {
    this.url$ = this.phoneCameraService
      .getQrCode(this.player?.roomId, this.player?.id ?? null)
      .pipe(
        map((code: string) => {
          const url = `http://192.168.1.77:4200/remote-camera/${code}?roomId=${this.player?.roomId}`
          debugger;
          return url;
        })
      );
  }
}
