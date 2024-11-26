import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { Token } from '../../../interfaces/scryfall';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent } from '../../../interfaces/game';

@Component({
  selector: 'app-card-token',
  standalone: true,
  imports: [],
  templateUrl: './card-token.component.html',
  styleUrl: './card-token.component.css'
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

  constructor(private elRef: ElementRef, private renderer: Renderer2, private webRTC: WebRTCService) {}

  ngOnInit(): void {
    // Set the initial position of the card based on the token
    const container = document.querySelector('#userStreams');
    if (container) {
      this.containerBounds = container.getBoundingClientRect();
    }

    this.updateCardPositionFromNormalized();
  }

  ngOnDestroy(){
    this.clearMouseListeners();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   // Update card position if token input changes
  //   console.log("NG ON CHANGES")
  //   // if (changes['token'] && !this.isDragging) {
  //   //   this.updateCardPosition();
  //   // }
  // }

  // ngAfterViewInit(): void {
    
  // }

  clearMouseListeners = ()=>{
    if (this.unlistenMouseMove) this.unlistenMouseMove();
    if (this.unlistenMouseUp) this.unlistenMouseUp();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if(!this.editable){return;}
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

    // Notify the server of the change
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyToken,
      payload: this.token
    });
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

      
      // console.log("screen y: " + screenY)

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
