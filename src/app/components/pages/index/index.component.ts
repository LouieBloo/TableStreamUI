import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameAxeSword} from '@ng-icons/game-icons';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink,NgIcon],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  viewProviders: [provideIcons({ bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill, gameAxeSword })]
})
export class IndexComponent {
  constructor(private titleService: Title) {}

  ngOnInit() {
    //this.titleService.setTitle('My Page Title');
  }


  scrollToSection() {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  }
}
