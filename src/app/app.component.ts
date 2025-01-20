import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsComponent } from './components/alerts/alerts.component';
import { NewsComponent } from './components/news/news.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,AlertsComponent,NewsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TableStreamUI';

  ngOnInit(): void {
  }
}
