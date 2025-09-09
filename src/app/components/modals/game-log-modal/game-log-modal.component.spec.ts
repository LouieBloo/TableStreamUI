import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLogModalComponent } from './game-log-modal.component';

describe('GameLogModalComponent', () => {
  let component: GameLogModalComponent;
  let fixture: ComponentFixture<GameLogModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLogModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
