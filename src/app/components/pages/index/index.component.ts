import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
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
