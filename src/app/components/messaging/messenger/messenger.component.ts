import { Component } from '@angular/core';
import { IMessage } from '../../../interfaces/message';
import { FormsModule } from '@angular/forms';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent {
  messages: Array<IMessage> = [];
  newMessage: string = '';

  constructor(private webRtc: WebRTCService){}

  ngOnInit(){
    this.webRtc.onMessage.push(this.messageReceived)
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.webRtc.sendMessage(this.newMessage);
      this.newMessage = ''; // Clear input field after sending
    }
  }

  messageReceived = (newMessage: IMessage)=>{
    console.log("new message, ", newMessage);
    this.messages.push(newMessage);
  }
}
