import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevAccessComponent } from './dev-access.component';

describe('DevAccessComponent', () => {
  let component: DevAccessComponent;
  let fixture: ComponentFixture<DevAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
