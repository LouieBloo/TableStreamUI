import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsComponent } from './components/alerts/alerts.component';
import { NewsComponent } from './components/news/news.component';
import { UserLoginModalComponent } from "./components/modals/user-login-modal/user-login-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertsComponent, NewsComponent, UserLoginModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TableStreamUI';

  ngOnInit(): void {
  }
}
