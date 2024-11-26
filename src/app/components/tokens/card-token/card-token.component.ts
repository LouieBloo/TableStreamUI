import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { PlayingCard, Token } from '../../../interfaces/scryfall';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent, IGameEvent } from '../../../interfaces/game';
import { CardComponent } from '../../card/card.component';
import { ModalServiceService, ModalType } from '../../../services/modal/modal-service.service';
import { bootstrapSearch, bootstrapArrowsMove, bootstrapTrash3Fill, bootstrapEyeSlashFill, bootstrapEyeFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-token',
  standalone: true,
  imports: [CardComponent,NgIf,NgClass,NgIcon],
  templateUrl: './card-token.component.html',
  styleUrl: './card-token.component.css',
  viewProviders: [provideIcons({ bootstrapSearch, bootstrapArrowsMove, bootstrapTrash3Fill,bootstrapEyeSlashFill, bootstrapEyeFill })]
})
export class CardTokenComponent implements OnInit {
  @Input() token!: Token;
  @Input() editable: boolean = false;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private containerBounds: DOMRect | undefined;
  private unlistenMouseMove!: () => void;
  private unlistenMouseUp!: () => void;
  hidden:boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private webRTC: WebRTCService,
    private modalService:ModalServiceService
  ) {}

  ngOnInit(): void {
    
    // Set the initial position of the card based on the token
    const container = document.querySelector('#userStreams');
    if (container) {
      this.containerBounds = container.getBoundingClientRect();
    }

    this.updateCardPositionFromNormalized();

    this.subscriptions.add(
      this.webRTC.gameEvent.subscribe(event => this.handleGameEvent(event))
    );
  }

  ngOnDestroy(){
    this.clearMouseListeners();
    this.subscriptions.unsubscribe();
  }

  handleGameEvent = (event: IGameEvent) => {
    if (event.event === GameEvent.ModifyToken && event.response.id == this.token.id) {
      Object.assign(this.token, event.response);
      this.updateCardPositionFromNormalized();
    }
  }

  openSearch = ()=>{
    if(!this.editable){return;}
    this.modalService.openModal(ModalType.SearchCards,this.cardSelected);
  }

  cardSelected = (card:PlayingCard)=>{
    if(card != null){
      this.token.card = card;
      this.modifyToken();
    }
  }

  modifyToken = ()=>{
    // Notify the server of the change
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyToken,
      payload: this.token
    });
  }

  delete = ()=>{
    this.webRTC.sendGameEvent({
      event: GameEvent.DeleteToken,
      payload: this.token
    })
  }

  clearMouseListeners = ()=>{
    if (this.unlistenMouseMove) this.unlistenMouseMove();
    if (this.unlistenMouseUp) this.unlistenMouseUp();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.clearMouseListeners();
    if(!this.editable){return;}
     // Check if the target element is the arrowsMove icon
    const targetElement = event.target as HTMLElement;
    if (!targetElement || !targetElement.closest('.arrowsMove')) return;

    this.isDragging = true;

    const card = this.elRef.nativeElement.querySelector('.token');
    const rect = card.getBoundingClientRect();

    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;

    this.unlistenMouseMove = this.renderer.listen('window', 'mousemove', this.onMouseMove.bind(this));
    this.unlistenMouseUp = this.renderer.listen('window', 'mouseup', this.onMouseUp.bind(this));
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.containerBounds) return;

    const newLeft = event.clientX - this.offsetX;
    const newTop = event.clientY - this.offsetY;

    const card = this.elRef.nativeElement.querySelector('.token');
    const cardRect = card.getBoundingClientRect();

    const constrainedLeft = Math.max(
      this.containerBounds.left,
      Math.min(this.containerBounds.right - cardRect.width, newLeft)
    );

    const constrainedTop = Math.max(
      this.containerBounds.top,
      Math.min(this.containerBounds.bottom - cardRect.height, newTop)
    );

    this.renderer.setStyle(card, 'left', `${constrainedLeft}px`);
    this.renderer.setStyle(card, 'top', `${constrainedTop}px`);

    // Normalize and update token position
    this.token.xPosition = this.normalizeX(constrainedLeft);
    this.token.yPosition = this.normalizeY(constrainedTop);
  }

  onMouseUp(): void {
    this.isDragging = false;

    this.clearMouseListeners();

    this.modifyToken();
  }

  private updateCardPositionFromNormalized(): void {
    if (!this.containerBounds) return;

    const card = this.elRef.nativeElement.querySelector('.token');
    if (card) {
      const screenX = this.denormalizeX(this.token.xPosition);
      const screenY = this.denormalizeY(this.token.yPosition);

      console.log("container: ", this.containerBounds)
      console.log("token x: " + this.token.xPosition)
      console.log("screen x: " + screenX)
      console.log("token y: " + this.token.yPosition)
      console.log("screen y: " + screenY)

      this.renderer.setStyle(card, 'left', `${screenX}px`);
      this.renderer.setStyle(card, 'top', `${screenY}px`);
    }
  }

  private normalizeX(screenX: number): number {
    if (!this.containerBounds) return 0;
    return (screenX - this.containerBounds.left) / this.containerBounds.width;
  }

  private normalizeY(screenY: number): number {
    if (!this.containerBounds) return 0;
    return (screenY - this.containerBounds.top) / this.containerBounds.height;
  }

  private denormalizeX(normalizedX: number): number {
    if (!this.containerBounds) return 0;
    return this.containerBounds.left + normalizedX * this.containerBounds.width;
  }

  private denormalizeY(normalizedY: number): number {
    if (!this.containerBounds) return 0;
    return this.containerBounds.top + normalizedY * this.containerBounds.height;
  }
}
