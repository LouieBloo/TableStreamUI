import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTestComponent } from './card-test.component';

describe('CardTestComponent', () => {
  let component: CardTestComponent;
  let fixture: ComponentFixture<CardTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
