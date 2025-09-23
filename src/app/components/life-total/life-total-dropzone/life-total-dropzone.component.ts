import { CdkDrag, CdkDropList, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { PropertyCounterComponent } from '../../property-counter/property-counter.component';
import { bootstrapChevronDoubleRight, bootstrapChevronDoubleLeft } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-life-total-dropzone',
  standalone: true,
  imports: [NgClass, NgIf, PropertyCounterComponent, NgIcon, FormsModule, CdkDrag, CdkDropList],
  templateUrl: './life-total-dropzone.component.html',
  styleUrl: './life-total-dropzone.component.css',
  viewProviders: [provideIcons({
    bootstrapChevronDoubleRight,
    bootstrapChevronDoubleLeft
  })]
})
export class LifeTotalDropzoneComponent {

  @Input() dropList!: any[];
  @Input() editable!: boolean;
  @Input() totalFunction!: any;
  @Input() modifyCallbackFunction!: any;
  @Input() isDragging!: boolean;
  @Input() isHiddenFunction!: any;
  @Input() id!: string;
  @Input() cdkDropListConnectedTo!: any;
  @Input() isHorizontal!: boolean;
  @Input() justifyEnd!: boolean;
  @Input() hideButtonLocation:string|null = null;

  @Output() draggingChanged = new EventEmitter<boolean>();

  showDropZone: boolean = true;
  dropZoneHidden: boolean = false;

  onDragStart() {
    this.draggingChanged.emit(true);
  }

  onDragEnd() {
    this.draggingChanged.emit(false);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  toggleTopBar() {
    this.showDropZone = !this.showDropZone;

    // if showing, immediately unhide the wrapper
    if (this.showDropZone) {
      this.dropZoneHidden = false;
    }
  }

  onTransitionEnd() {
    // hide wrapper only if we're hiding the sidebar
    if (!this.showDropZone) {
      this.dropZoneHidden = true;
    }
  }

  trackByTitle(index: number, item: any): string {
    return item.title;
  }

  get showCollapseButton(): boolean {
    // 1. Check if hideButtonLocation is true
    // 2. Check if dropList exists and has items
    // 3. Check if ANY item in dropList has a title that makes isHiddenFunction return true
    return (this.hideButtonLocation &&
           this.dropList &&
           this.dropList.length > 0 &&
           this.dropList.some(item => !this.isHiddenFunction(item.title))) == true;
  }
}
