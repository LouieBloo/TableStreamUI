import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinFlipComponent } from './coin-flip.component';

describe('CoinFlipComponent', () => {
  let component: CoinFlipComponent;
  let fixture: ComponentFixture<CoinFlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinFlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinFlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
