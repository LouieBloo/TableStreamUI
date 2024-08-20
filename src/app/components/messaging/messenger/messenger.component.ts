import { Component, ElementRef, ViewChild } from '@angular/core';
import { IMessage } from '../../../interfaces/message';
import { FormsModule } from '@angular/forms';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgFor } from '@angular/common';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [FormsModule, NgFor, MessageComponent],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent {
  messages: Array<IMessage> = [];
  newMessage: string = '';

  @ViewChild('messageBox') private messageBox!: ElementRef;

  constructor(private webRtc: WebRTCService){}

  ngAfterViewChecked() {
    this.messageBox.nativeElement.scrollTop = this.messageBox.nativeElement.scrollHeight;
  }

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
