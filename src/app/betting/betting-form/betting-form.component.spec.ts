import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BettingFormComponent } from './betting-form.component';

describe('BettingFormComponent', () => {
  let component: BettingFormComponent;
  let fixture: ComponentFixture<BettingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BettingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BettingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
