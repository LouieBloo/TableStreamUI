import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardClassifiedPopupComponent } from './card-classified-popup.component';

describe('CardClassifiedPopupComponent', () => {
  let component: CardClassifiedPopupComponent;
  let fixture: ComponentFixture<CardClassifiedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardClassifiedPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardClassifiedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
