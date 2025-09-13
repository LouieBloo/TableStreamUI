import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameService } from '../../../services/game/game.service';

@Component({
  selector: 'app-game-log-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-log-modal.component.html',
  styleUrl: './game-log-modal.component.css'
})
export class GameLogModalComponent {

  @ViewChild('historyContainer') private historyContainer!: ElementRef;

  constructor(public gameService: GameService) {
  }

  ngOnDestroy(): void {
  }

  open() {
    const dialogCheckbox = document.getElementById('gameLogToggle');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }

    this.historyContainer.nativeElement.scrollTop = this.historyContainer.nativeElement.scrollHeight;
  }

  close() {
    const closeModalButton = document.getElementById('closeGameLog');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  formatPropertyName(propertyName: string | undefined): string {
    if (!propertyName) {
      return '';
    }
    // Add a space before capital letters and convert to lowercase
    return propertyName
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim();
  }

  formatTime(dateString: Date): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatHistoryForCopy(item: any): string {
    const time = this.formatTime(item.createdAt);
    switch (item.type) {
      case 'FlipCoins':
        return `[${time}] ${item.player.name} flipped ${item.value.length} coin(s): ${item.value.join(', ')}.`;
      case 'KickPlayer':
        return `[${time}] ${item.value.name} was kicked from the game.`;
      case 'ModifyPlayerProperty':
        const sign = item.value > 0 ? '+' : '';
        return `[${time}] ${item.player.name} changed ${item.property} by ${sign}${item.value}.`;
      case 'PlayerAdded':
        return `[${time}] ${item.value.name} joined the game.`;
      case 'PlayerRemoved':
        return `[${time}] ${item.value.name} left the game.`;
      case 'RandomizePlayerOrder':
        return `[${time}] ${item.player.name} randomized the player order. New order: ${item.value}`;
      case 'ResetGame':
        return `[${time}] ${item.player.name} reset the game`;
      case 'RollDice':
        return `[${time}] ${item.player.name} rolled ${item.value.length} dice: ${item.value.join(', ')}.`;
      case 'SetPlayerTurnOrders':
        return `[${time}] ${item.player.name} set the player order. New order: ${item.value}`;
      case 'StartGame':
        return `[${time}] ${item.player.name} started the game`;
      default:
        return `[${time}] Unhandled event: ${item.type}`;
    }
  }

  copyHistory(): void {
    if (!this.gameService.room.history || this.gameService.room.history.length < 1) { return; }

    const historyText = this.gameService.room.history
      .map(item => this.formatHistoryForCopy(item))
      .join('\n');

    if (!historyText) return;

    navigator.clipboard.writeText(historyText)
      .then(() => {
        console.log('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }
}
