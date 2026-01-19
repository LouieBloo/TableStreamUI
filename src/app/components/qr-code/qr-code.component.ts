import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { of, Subscription } from 'rxjs';
import { IPlayer } from '../../interfaces/IPlayer';
import { GameService } from '../../services/game/game.service';
import { PhoneCameraService } from '../../services/phone-camera/phone-camera.service';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [QRCodeModule, AsyncPipe],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent {
  @Input() player!: IPlayer;
  readonly phoneCameraService = inject(PhoneCameraService);
  readonly gameService = inject(GameService);
  subscriptions = new Subscription();
  url$ = of('');

  ngOnInit() {
    this.subscriptions.add(
      this.phoneCameraService
        .getQrCode(this.player?.roomId, this.player?.id ?? null)
        .subscribe()
    );
    this.url$ = this.phoneCameraService.urlForJoinByPhone$;
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }
}
