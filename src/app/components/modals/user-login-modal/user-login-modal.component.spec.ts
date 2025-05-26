import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoginModalComponent } from './user-login-modal.component';

describe('UserLoginModalComponent', () => {
  let component: UserLoginModalComponent;
  let fixture: ComponentFixture<UserLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLoginModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
