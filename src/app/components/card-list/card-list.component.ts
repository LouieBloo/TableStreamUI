import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ScryfallService } from '../../services/scryfall/scryfall.service';
import { CardComponent } from '../card/card.component';
import { ScryfallCard } from '../../interfaces/scryfall';
import { NgClass, NgFor, NgIf, NgStyle, SlicePipe } from '@angular/common';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardListItemComponent } from './card-list-item/card-list-item.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { GameEvent, IGameEvent } from '../../interfaces/game';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CardComponent,NgFor,FormsModule,CardListItemComponent, NgIf, LoadingSpinnerComponent , ReactiveFormsModule, NgClass, NgStyle , SlicePipe],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})
export class CardListComponent {

  @ViewChild('cardInput') cardInput!: any;

  cards:ScryfallCard[] = []

  searchString!:string;
  searchSubject: Subject<string> = new Subject<string>();
  sendSearchEvent: Subject<boolean> = new Subject<boolean>();
  searchResults:ScryfallCard[] = []

  sharedCards:ScryfallCard[] = [];

  cardBeingHovered!:ScryfallCard | null;

  hasSearched:boolean = false;
  searching:boolean = false;

  private inputSubscription!: Subscription;

  constructor(private scryfallService: ScryfallService, private elRef: ElementRef, private inputService: InputService, private webRtc:WebRTCService){
    
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.adjustHeight();
  }

  ngAfterViewInit(): void {
    //this.adjustHeight();
    // setTimeout(this.adjustHeight);
    this.webRtc.subscribeToGameEvents((event:IGameEvent)=>{
      if(event.event == GameEvent.ShareCard && event.response){
        this.sharedCards.unshift(event.response);
        this.adjustHeight();
      }
    })
  }

  ngOnInit(): void {
    this.inputSubscription = this.inputService.subscribe((userAction: UserInputAction)=>{
      if(userAction == UserInputAction.JumpToSearch){
        this.openSearchModal();
      }
    })

    this.searchSubject.pipe(debounceTime(420)).subscribe(value => {
      // this.searchString = value;
      this.sendSearch()
    });

    this.sendSearchEvent.pipe(debounceTime(350)).subscribe(value => {
      this.search();
    });
  }

  ngOnDestroy(): void {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  sendSearch=()=>{
    this.sendSearchEvent.next(true);
  }

  searchStringChanged(value: string): void {
    this.searchSubject.next(value);
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
        

        if(this.searchResults && this.searchResults.length > 0){
          this.onCardHover(this.searchResults[0]);
        }
      },
      (error: any) => {
        console.error('Error fetching cards:', error);
        this.hasSearched = true;
        this.searching = false;
        this.searchResults = []
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


  onCardHover = (card: ScryfallCard | null)=>{
    if(!card){return}
    this.cardBeingHovered = card;
  }

  shareCard = (imageClicked:boolean)=>{
    //valid card
    if(!this.cardBeingHovered){return;}
    //since cards can have multipe faces if the user clicks on a double sided one we dont trigger the share
    if(imageClicked &&  (this.cardBeingHovered.card_faces && this.cardBeingHovered.card_faces.length > 1)){return;}

    this.webRtc.sendGameEvent({event:GameEvent.ShareCard, payload: this.cardBeingHovered});

    //close modal
    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }
}
