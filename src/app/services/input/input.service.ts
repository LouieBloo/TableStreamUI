import { Injectable } from '@angular/core';
import { filter, fromEvent, Subject, Subscription } from 'rxjs';
import { UserInputAction } from '../../interfaces/inputs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InputService {

  private inputEventSubject = new Subject<{ action: UserInputAction, payload?: any }>();

  constructor() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter(event => !this.isInputFocused() && !event.repeat) // Ignore if input is focused
      )
      .subscribe(event => this.handleKeyboardEvent(event));
  }

  private handleKeyboardEvent(event: KeyboardEvent) {
    // If user is typing letters/numbers/punctuation
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      // Send StartTyping with the pressed key
      this.inputEventSubject.next({
        action: UserInputAction.StartTyping,
        payload: event.key
      });
      return; // Don't process as hotkey
    }

    //console.log(event.key)
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.inputEventSubject.next({action: UserInputAction.PassTurn})
        break;
      case 'ArrowUp':
        this.inputEventSubject.next({action: UserInputAction.ModifyHealth1})
        break;
      case 'ArrowDown':
        this.inputEventSubject.next({action: UserInputAction.ModifyHealthMinus1})
        break;
      case 'r':
        this.inputEventSubject.next({action: UserInputAction.Transcribe})
        break;
      case 'q':
        if (event.ctrlKey || event.altKey) {
          this.inputEventSubject.next({action: UserInputAction.JumpToSearch})
        }
        break;
    }
  }

  public triggerEvent(action:UserInputAction, payload?:any){
    this.inputEventSubject.next({action: action, payload: payload})
  }

  private isInputFocused(): boolean {
    // Check if the modal is open
    const modal = document.getElementById('searchModal') as HTMLDialogElement;

    if (modal && modal.open) {
      // The modal is open, don't process hotkeys
      return true;
    }

    const activeElement = document.activeElement;

    return activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
      !activeElement.classList.contains('drawer-toggle') ? true : false;
  }

  public subscribe(callback: (value: { action: UserInputAction, payload?: any }) => void): Subscription {
    return this.inputEventSubject.subscribe(callback);
  }

  clearServerErrors = (form: FormGroup) => {
    Object.values(form.controls).forEach(control => {
      if (control.hasError('serverError')) {
        const errs = { ...control.errors };
        delete errs['serverError'];
        control.setErrors(Object.keys(errs).length ? errs : null);
      }
    });
  }

  applyServerValidationErrors = (form: FormGroup, errors: Array<{ path: string; msg: string }>) => {
    Object.values(form.controls).forEach(control => {
      // remove any existing serverError first
      if (control.hasError('serverError')) {
        const errs = { ...control.errors };
        delete errs['serverError'];
        control.setErrors(Object.keys(errs).length ? errs : null);
      }
    });

    errors.forEach(err => {
      const control = form.get(err.path);
      if (control) {
        // preserve other errors, just add serverError
        const existing = control.errors || {};
        control.setErrors({ ...existing, serverError: err.msg });
      }
    });
  }
}
