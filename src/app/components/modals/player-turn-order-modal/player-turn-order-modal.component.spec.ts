import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTurnOrderModalComponent } from './player-turn-order-modal.component';

describe('PlayerTurnOrderModalComponent', () => {
  let component: PlayerTurnOrderModalComponent;
  let fixture: ComponentFixture<PlayerTurnOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTurnOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerTurnOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
