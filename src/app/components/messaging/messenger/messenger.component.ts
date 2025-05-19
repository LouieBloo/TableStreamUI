import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMessage } from '../../../interfaces/IMessage';
import { FormsModule } from '@angular/forms';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgFor, NgIf } from '@angular/common';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [FormsModule, NgFor, MessageComponent, NgIf],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent {
  messages: Array<IMessage> = [];
  newMessage: string = '';
  @Input() showChatbox: boolean = true;

  @ViewChild('messageBox') private messageBox!: ElementRef;

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
    this.messages.push(newMessage);

    setTimeout(()=>{this.messageBox.nativeElement.scrollTop = this.messageBox.nativeElement.scrollHeight;},100)
    
  }
}
