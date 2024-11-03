import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinFlipperComponent } from './coin-flipper.component';

describe('CoinFlipperComponent', () => {
  let component: CoinFlipperComponent;
  let fixture: ComponentFixture<CoinFlipperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinFlipperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinFlipperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
