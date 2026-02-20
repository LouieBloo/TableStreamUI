import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { of, Subscription, tap } from 'rxjs';
import { IPlayer } from '../../interfaces/IPlayer';
import { GameService } from '../../services/game/game.service';
import { PhoneCameraService } from '../../services/phone-camera/phone-camera.service';
import { CheckPasswordComponent } from '../pages/check-password/check-password.component';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [QRCodeModule, AsyncPipe, CheckPasswordComponent, NgIf],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent {
  @Input() player!: IPlayer;
  readonly phoneCameraService = inject(PhoneCameraService);
  readonly gameService = inject(GameService);
  subscriptions = new Subscription();
  url$ = of('');
  validated: boolean = false;
  showPassword = false;

  ngOnInit() {
    this.url$ = this.phoneCameraService.urlForJoinByPhone$;
  }

  getQrCode(password: string) {
    this.subscriptions.add(
      this.phoneCameraService
        .getQrCode(this.player?.roomId, this.player?.id ?? null, password)
        .pipe(
          tap((response) => {
            if (response) {
              this.validated = true;
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
