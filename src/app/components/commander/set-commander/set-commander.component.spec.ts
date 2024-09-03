import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCommanderComponent } from './set-commander.component';

describe('SetCommanderComponent', () => {
  let component: SetCommanderComponent;
  let fixture: ComponentFixture<SetCommanderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetCommanderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetCommanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
