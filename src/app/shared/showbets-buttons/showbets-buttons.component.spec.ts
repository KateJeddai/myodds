import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowbetsButtonsComponent } from './showbets-buttons.component';

describe('ShowbetsButtonsComponent', () => {
  let component: ShowbetsButtonsComponent;
  let fixture: ComponentFixture<ShowbetsButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowbetsButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowbetsButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
