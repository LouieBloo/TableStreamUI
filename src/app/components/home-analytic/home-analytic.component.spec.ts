import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeAnalyticComponent } from './home-analytic.component';

describe('HomeAnalyticComponent', () => {
  let component: HomeAnalyticComponent;
  let fixture: ComponentFixture<HomeAnalyticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAnalyticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAnalyticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
