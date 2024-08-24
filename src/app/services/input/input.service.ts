import { Injectable } from '@angular/core';
import { filter, fromEvent, Subject } from 'rxjs';
import { UserInputAction } from '../../interfaces/inputs';

@Injectable({
  providedIn: 'root'
})
export class InputService {

  private inputEventSubject = new Subject<UserInputAction>();

  constructor() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter(event => !this.isInputFocused() && !event.repeat) // Ignore if input is focused
      )
      .subscribe(event => this.handleKeyboardEvent(event));
  }

  private handleKeyboardEvent(event: KeyboardEvent) {
    console.log(event.key)
    switch (event.key) {
      case ' ':
        this.inputEventSubject.next(UserInputAction.PassTurn)
        break;
      case 'ArrowUp':
        this.inputEventSubject.next(UserInputAction.ModifyHealth1)
        break;
      case 'ArrowDown':
        this.inputEventSubject.next(UserInputAction.ModifyHealthMinus1)
        break;
      case 'i':
        if (event.ctrlKey) {
          this.inputEventSubject.next(UserInputAction.JumpToSearch)
        }
        break;
    }
  }

  private isInputFocused(): boolean {
    // Check if the modal is open
    const modal = document.getElementById('searchModal') as HTMLDialogElement;

    if (modal && modal.open) {
      // The modal is open, don't process hotkeys
      return true;
    }

    const activeElement = document.activeElement;
    console.log(activeElement?.tagName)
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') ? true : false;
  }

  subscribe(callback: (userInputAction: UserInputAction) => void) {
    return this.inputEventSubject.asObservable().subscribe(event => {
      callback(event);
    });
  }
}
