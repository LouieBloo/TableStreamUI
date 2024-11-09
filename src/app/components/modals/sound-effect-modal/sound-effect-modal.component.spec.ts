import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundEffectModalComponent } from './sound-effect-modal.component';

describe('SoundEffectModalComponent', () => {
  let component: SoundEffectModalComponent;
  let fixture: ComponentFixture<SoundEffectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoundEffectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
