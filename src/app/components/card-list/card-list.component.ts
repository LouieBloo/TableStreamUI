import { NgClass, NgFor, NgIf, NgStyle, SlicePipe } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, debounceTime, EMPTY, filter, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { GameEvent, IGameEvent, LocalGameEvent } from '../../interfaces/IGame';
import { UserInputAction } from '../../interfaces/inputs';
import { IPlayingCard } from '../../interfaces/IPlayingCard';
import { GameService } from '../../services/game/game.service';
import { InputService } from '../../services/input/input.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ModalServiceService, ModalType } from '../../services/modal/modal-service.service';
import { CardSearchService } from '../../services/search/card-search.service';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { CardComponent } from '../card/card.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CardListItemComponent } from './card-list-item/card-list-item.component';
import { SpeechToTextComponent } from '../speech-to-text/speech-to-text.component';
import { bootstrapTrash3 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CardComponent, NgFor, FormsModule, CardListItemComponent, NgIf, LoadingSpinnerComponent, ReactiveFormsModule, NgClass, NgStyle, SlicePipe, SpeechToTextComponent, NgIcon, TooltipDirective],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css',
  viewProviders: [provideIcons({ bootstrapTrash3 })]
})
export class CardListComponent {

  @ViewChild('cardInput', { static: false }) cardInput!: ElementRef<HTMLInputElement>;

  private subscriptions: Subscription = new Subscription();
  cards: IPlayingCard[] = []
  searchString!: string;
  searchSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  sendSearchEvent: Subject<boolean> = new Subject<boolean>();
  searchResults: IPlayingCard[] = []
  sharedCards: IPlayingCard[] = [];
  cardBeingHovered!: IPlayingCard | null;
  hasSearched: boolean = false;
  searching: boolean = false;
  includeOption: string = '';
  currentCallback: any;//boo

  constructor(
    private cardSearchService: CardSearchService,
    private elRef: ElementRef,
    private inputService: InputService,
    private webRtc: WebRTCService,
    private modalService: ModalServiceService,
    public gameService: GameService,
    private logger: LoggerService) {
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    const modal = document.getElementById('searchModal') as HTMLDialogElement;
    if (modal && modal.open) {
      // Blur the search input so typing will be detected again
      if (this.cardInput?.nativeElement) {
        this.cardInput.nativeElement.blur();
      }
    }
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      this.gameService.gameEvent.subscribe((event: IGameEvent) => {
        if (event.event == GameEvent.ShareCard && event.response) {
          this.sharedCards.unshift(event.response);
        }
      }));
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.inputService.subscribe(({ action, payload }: { action: UserInputAction; payload?: any }) => {
        if (action === UserInputAction.JumpToSearch) {
          this.openSearchModal(undefined, payload);
        }
        if (action === UserInputAction.StartTyping) {
          const modal = document.getElementById('searchModal') as HTMLDialogElement;
          // if (!modal || !modal.open) {
          // Modal closed — open and start with first char
          this.openSearchModal(payload);
          // }
        }
      })
    );

    //subscribes to share card
    this.subscriptions.add(
      this.webRtc.localGameEvent.subscribe((localGameEvent: IGameEvent) => {
        if (localGameEvent.event === LocalGameEvent.ShareCard) {
          if (localGameEvent.payload.card) {
            if (localGameEvent.payload.sharePublic) {
              this.shareCardPublic(localGameEvent.payload.card);
            } else {
              this.shareCardPrivate(localGameEvent.payload.card);
            }
          }
        }
      })
    );

    this.subscribeToSearch();
  }

  subscribeToSearch() {
    this.subscriptions.add(
      this.searchSubject.pipe(
        filter((searchString: string | null) => !!searchString),
        debounceTime(420),
        switchMap(() => {
          this.searching = true;
          return this.cardSearchService.searchCards(
            this.searchString,
            true,
            this.gameService.game!,
            this.searchOptions
          ).pipe(
            catchError((error: any) => {
              this.logger.error('Error fetching cards: ', error);
              this.searchResults = [];
              this.hasSearched = true;
              this.searching = false;
              return EMPTY;
            })
          );
        }),
        tap((response: any) => {
          this.searchResults = response.data;
          this.hasSearched = true;
          this.searching = false;

          if (this.searchResults.length > 0) {
            this.onCardHover(this.searchResults[0]);
          }
        })
      ).subscribe()
    );
  }

  get searchOptions(): any {
    if (this.gameService.isOnePieceGame()) {
      return {
        card_name: this.searchString,
        card_type: this.includeOption
      }
    } else {
      return {
        includeOption: this.includeOption
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  sendSearch = () => {
    this.sendSearchEvent.next(true);
  }

  searchStringChanged(value: string): void {
    if (value.length < 3) {
      return;
    }
    this.searchSubject.next(value);
  }

  selectCard(card: IPlayingCard) {
    //this.selectedCard = this.selectedCard === card ? null : card;
    card.selected = !card.selected;

    if (this.currentCallback != null) {
      this.shareCard(false, true)
    }
  }

  openSearchModal = (initialText: string = '', options:any=null) => {
    this.searchString = initialText;
    //this.includeOption = options ? op'';
    this.searchResults = [];

    if(options && options.source == 'SetCommander' && this.gameService.isOnePieceGame()){
      this.includeOption = 'Leader';
    }else{
      this.includeOption = '';
    }

    //do this on startup so we always wipe it from the service
    this.currentCallback = this.modalService.consumeCallback(ModalType.SearchCards);

    const dialogCheckbox = document.getElementById('toggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }

    setTimeout(() => {
      this.focusInput();
      if (initialText) {
        // Put cursor at end
        const inputEl = document.getElementById('cardInput') as HTMLInputElement;
        if (inputEl) {
          inputEl.value = initialText;
          this.searchStringChanged(initialText);
        }
      }
    }, 0);
  }

  focusInput = () => {
    if (this.cardInput?.nativeElement) {
      this.cardInput.nativeElement.focus();
    }
  }


  onCardHover = (card: IPlayingCard | null) => {
    if (!card) { return }
    this.cardBeingHovered = card;
  }

  shareCard = (imageClicked: boolean, share: boolean = true) => {
    //valid card
    if (!this.cardBeingHovered) { return; }
    //since cards can have multipe faces if the user clicks on a double sided one we dont trigger the share
    if (imageClicked && (this.cardBeingHovered.card_faces && this.cardBeingHovered.card_faces.length > 1)) { return; }

    if (share) {
      this.shareCardPublic(this.cardBeingHovered);
    } else {
      this.shareCardPrivate(this.cardBeingHovered);
    }

    if (this.currentCallback != null) {
      this.currentCallback(this.cardBeingHovered);
    }

    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  shareCardPublic = (card: IPlayingCard) => {
    this.webRtc.sendGameEvent({ event: GameEvent.ShareCard, payload: card });
  }

  shareCardPrivate = (card: IPlayingCard) => {
    this.sharedCards.unshift(card);
  }

  clearSearchHistory = () => {
    this.sharedCards = []
  }

  deleteCardFromSearchHistory = (cardToDelete: IPlayingCard) => {
    this.sharedCards = this.sharedCards.filter((card: IPlayingCard) => card != cardToDelete)
  }
}
