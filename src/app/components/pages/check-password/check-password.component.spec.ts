import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPasswordComponent } from './check-password.component';

describe('CheckPasswordComponent', () => {
  let component: CheckPasswordComponent;
  let fixture: ComponentFixture<CheckPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
