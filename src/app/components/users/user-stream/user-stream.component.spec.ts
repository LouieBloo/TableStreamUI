import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStreamComponent } from './user-stream.component';

describe('UserStreamComponent', () => {
  let component: UserStreamComponent;
  let fixture: ComponentFixture<UserStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
