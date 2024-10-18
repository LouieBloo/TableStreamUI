import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTestComponent } from './ai-test.component';

describe('AiTestComponent', () => {
  let component: AiTestComponent;
  let fixture: ComponentFixture<AiTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
