import { Component, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CardSearchService } from '../../services/search/card-search.service';
import { GameEvent, GameType } from '../../interfaces/IGame';
import { Game } from '../../classes/game/game';
import { CardComponent } from '../card/card.component';
import { NgIf } from '@angular/common';
import { IPlayingCard } from '../../interfaces/IPlayingCard';
import { bootstrapRecord, bootstrapRecordFill, bootstrapClockHistory } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { GameService } from '../../services/game/game.service';
import { CardIdentifierService } from '../../services/card-identifier/card-identifier.service';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { AlertsService } from '../../services/alerts/alerts.service';
import { UserInputAction } from '../../interfaces/inputs';
import { InputService } from '../../services/input/input.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-speech-to-text',
  standalone: true,
  imports: [CardComponent, NgIf, NgIcon, TooltipDirective],
  templateUrl: './speech-to-text.component.html',
  styleUrl: './speech-to-text.component.css',
  viewProviders: [provideIcons({ bootstrapRecordFill, bootstrapRecord, bootstrapClockHistory })]
})
export class SpeechToTextComponent {
  status = 'IDLE';
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private stream?: MediaStream;
  private stopTimer: any;
  private inputSubscription!: Subscription;

  constructor(
    private webRTC: WebRTCService,
    private ngZone: NgZone,
    private searchService: CardSearchService,
    private gameService: GameService,
    private cardIdentifierService: CardIdentifierService,
    private alertsService:AlertsService,
    private inputService: InputService,
  ) { }

  ngOnInit(){
    this.inputSubscription = this.inputService.subscribe((userAction: UserInputAction)=>{
      if(userAction == UserInputAction.Transcribe){
        this.toggleRecording();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  toggleRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      return this.stopRecording();
    }

    navigator.mediaDevices.getUserMedia({ audio: {channelCount: 2} }).then((stream) => {
      this.status = 'RECORDING';
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream,{mimeType: 'audio/webm;codecs=opus'});
      this.stream = stream;

      this.stopTimer = setTimeout(() => { this.stopRecording() }, 4000);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    }).catch((error) => {
      console.error('Error accessing microphone:', error);
      this.alertsService.addAlert("warning","Microphone permission denied")
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.status = 'PROCESSING';

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.sendAudioToBackend(audioBlob);

        // Stop all tracks in the media stream
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = undefined;
        }
      };
    }

    if (this.stopTimer) {
      clearTimeout(this.stopTimer)
    }
  }

  sendAudioToBackend(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    let searchTag: string = this.gameService.room.game?.searchTag || 'commander'

    this.cardIdentifierService.transcribe(audioBlob).subscribe((response: any) => {

      if (response.transcript && this.gameService.room.game) {
        this.alertsService.addAlert("info",`Searching for card name '${response.transcript}'`)
        this.searchService.searchCards(
          response.transcript,
          true,
          this.gameService.room.game,
          null
        )
          .subscribe(
            (response: any) => {
              this.ngZone.run(() => {
                console.log(response)
                if (response && response.data) {
                  this.webRTC.sendGameEvent({ event: GameEvent.ShareCard, payload: response.data[0] });
                }
                this.status = 'IDLE';
              });
            },
            (error: any) => {
              this.ngZone.run(() => {
                this.status = 'IDLE';
              });
            }
          );
      }else{
        this.ngZone.run(() => {
          this.status = 'IDLE';
        });
      }

    },(error:any)=>{
      this.ngZone.run(() => {
        this.status = 'IDLE';
      });
    })
  }

}
