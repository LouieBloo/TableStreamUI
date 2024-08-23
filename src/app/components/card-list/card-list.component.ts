import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ScryfallService } from '../../services/scryfall/scryfall.service';
import { CardComponent } from '../card/card.component';
import { ScryfallCard } from '../../interfaces/scryfall';
import { NgFor, NgIf } from '@angular/common';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { FormsModule } from '@angular/forms';
import { CardListItemComponent } from './card-list-item/card-list-item.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CardComponent,NgFor,FormsModule,CardListItemComponent, NgIf],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})
export class CardListComponent {

  @ViewChild('cardInput') cardInput!: any;

  cards:ScryfallCard[] = []

  searchString!:string;
  searchResults:ScryfallCard[] = []

  hasSearched:boolean = false;
  searching:boolean = false;

  constructor(private scryfallService: ScryfallService, private elRef: ElementRef, private inputService: InputService){
    inputService.subscribe((userAction: UserInputAction)=>{
      if(userAction == UserInputAction.JumpToSearch){
        this.openSearchModal();
      }
    })
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.adjustHeight();
  }

  ngAfterViewInit(): void {
    //this.adjustHeight();
    // setTimeout(this.adjustHeight);
  }

  private adjustHeight(): void {
    const scrollableDiv = this.elRef.nativeElement.querySelector('#scrollableDiv');
    const topOffset = scrollableDiv.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    scrollableDiv.style.height = `${windowHeight - topOffset}px`;
  }

  search= ()=>{
    if(!this.searchString){return;}
    this.searching = true;
    this.scryfallService.searchCards(this.searchString).subscribe(
      (response: any) => {
        console.log(response)
        this.searchResults = response.data;
        this.hasSearched = true;
        this.searching = false;
        this.adjustHeight();
      },
      (error: any) => {
        console.error('Error fetching cards:', error);
        this.hasSearched = true;
        this.searching = false;
      }
    );
  }

  openSearchModal = ()=>{
    this.searchString = "";
    this.searchResults = [];
    const dialogCheckbox = document.getElementById('toggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }

    setTimeout(this.focusInput,100)
  }

  focusInput(): void {
    if (this.cardInput) {
      this.cardInput.focus();
    }
  }
}
