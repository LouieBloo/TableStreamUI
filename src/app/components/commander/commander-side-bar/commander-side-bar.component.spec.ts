import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommanderSideBarComponent } from './commander-side-bar.component';

describe('CommanderSideBarComponent', () => {
  let component: CommanderSideBarComponent;
  let fixture: ComponentFixture<CommanderSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommanderSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommanderSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
