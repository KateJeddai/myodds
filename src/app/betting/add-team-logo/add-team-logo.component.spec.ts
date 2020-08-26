import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeamLogoComponent } from './add-team-logo.component';

describe('AddTeamLogoComponent', () => {
  let component: AddTeamLogoComponent;
  let fixture: ComponentFixture<AddTeamLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTeamLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTeamLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
