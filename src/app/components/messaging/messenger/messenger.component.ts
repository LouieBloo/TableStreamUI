import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  styleUrl: './messenger.component.css',
})
export class MessengerComponent {
  messages: Array<IMessage> = [];
  newMessage: string = '';
  unreadMessageCount: number = 0;

  @Input() showChatbox: boolean = true;
  @Input() showSidebar: boolean = true;
  @Output() unreadCountChange = new EventEmitter<number>();

  @ViewChild('messageBox') private messageBox!: ElementRef;

  constructor(private webRtc: WebRTCService) {}

  ngOnInit() {
    this.webRtc.onMessage.push(this.messageReceived);
  }

  ngOnChanges(changes: SimpleChanges) {
    const chatboxVisible = changes['showChatbox']?.currentValue;
    const sidebarVisible = changes['showSidebar']?.currentValue;

    if (chatboxVisible || (sidebarVisible && this.showChatbox === true)) {
      this.unreadMessageCount = 0;
      this.unreadCountChange.emit(this.unreadMessageCount);

      setTimeout(() => {
        this.messageBox.nativeElement.scrollTop =
          this.messageBox.nativeElement.scrollHeight;
      }, 100);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.webRtc.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  messageReceived = (newMessage: IMessage) => {
    this.messages.push(newMessage);
    if (!this.showChatbox || !this.showSidebar) {
      this.unreadMessageCount++;
      this.unreadCountChange.emit(this.unreadMessageCount);
    }

    if (this.showChatbox) {
      setTimeout(() => {
        this.messageBox.nativeElement.scrollTop =
          this.messageBox.nativeElement.scrollHeight;
      }, 100);
    }
  };
}
