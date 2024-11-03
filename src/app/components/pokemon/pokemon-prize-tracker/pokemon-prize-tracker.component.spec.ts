import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonPrizeTrackerComponent } from './pokemon-prize-tracker.component';

describe('PokemonPrizeTrackerComponent', () => {
  let component: PokemonPrizeTrackerComponent;
  let fixture: ComponentFixture<PokemonPrizeTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonPrizeTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonPrizeTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
