import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  player = {
    name: '',
    roomName: ''
  };

  constructor(private router: Router, private webRTC: WebRTCService){}

  ngOnInit() {
    this.webRTC.disconnect();
    localStorage.removeItem("roomName");
  }

  onSubmit() {
    localStorage.setItem("playerName", this.player.name);
    localStorage.setItem("roomName", this.player.roomName);

    this.router.navigate(['/game']);
  }
}
