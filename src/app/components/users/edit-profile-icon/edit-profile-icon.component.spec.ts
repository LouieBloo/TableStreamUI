import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileIconComponent } from './edit-profile-icon.component';

describe('EditProfileIconComponent', () => {
  let component: EditProfileIconComponent;
  let fixture: ComponentFixture<EditProfileIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
