import { Injectable } from '@angular/core';
import { filter, fromEvent, Subject } from 'rxjs';
import { UserInputAction } from '../../interfaces/inputs';
import { FormGroup } from '@angular/forms';

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
    //console.log(event.key)
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.inputEventSubject.next(UserInputAction.PassTurn)
        break;
      case 'ArrowUp':
        this.inputEventSubject.next(UserInputAction.ModifyHealth1)
        break;
      case 'ArrowDown':
        this.inputEventSubject.next(UserInputAction.ModifyHealthMinus1)
        break;
      case 'r':
        this.inputEventSubject.next(UserInputAction.Transcribe)
        break;
      case 'q':
        if (event.ctrlKey || event.altKey) {
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

    return activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
      !activeElement.classList.contains('drawer-toggle') ? true : false;
  }

  public triggerInput(input: string) {
    switch (input) {
      case ' ':
        this.inputEventSubject.next(UserInputAction.PassTurn)
        break;
      case 'ArrowUp':
        this.inputEventSubject.next(UserInputAction.ModifyHealth1)
        break;
      case 'ArrowDown':
        this.inputEventSubject.next(UserInputAction.ModifyHealthMinus1)
        break;
      case 'ctrl-i':
        this.inputEventSubject.next(UserInputAction.JumpToSearch)
        break;
    }
  }

  subscribe(callback: (userInputAction: UserInputAction) => void) {
    return this.inputEventSubject.asObservable().subscribe(event => {
      callback(event);
    });
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
