import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomListItemComponent } from './room-list-item.component';

describe('RoomListItemComponent', () => {
  let component: RoomListItemComponent;
  let fixture: ComponentFixture<RoomListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
