import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarGameInfoComponent } from './sidebar-game-info.component';

describe('SidebarGameInfoComponent', () => {
  let component: SidebarGameInfoComponent;
  let fixture: ComponentFixture<SidebarGameInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarGameInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarGameInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
