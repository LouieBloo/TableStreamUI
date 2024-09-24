import { Injectable } from '@angular/core';
import { InputService } from '../input/input.service';

export enum ModalType{
  SearchCards,
  EnterPassword
}

@Injectable({
  providedIn: 'root'
})
export class ModalServiceService {

  callbacks:any = {}

  constructor(private inputService: InputService) { }

  public openModal(modalToOpen:ModalType, callback:any){
    this.callbacks[modalToOpen] = callback;
    switch(modalToOpen){
      case ModalType.SearchCards:
        this.inputService.triggerInput("ctrl-i");
        break;
    }
  }

  consumeCallback(modal:ModalType){
    let callback = null;
    if(this.callbacks[modal]){
      callback = this.callbacks[modal];
    }
    this.callbacks[modal] = null;
    return callback;
  }
}
