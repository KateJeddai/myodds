import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetPaginatorComponent } from './bet-paginator.component';

describe('BetPaginatorComponent', () => {
  let component: BetPaginatorComponent;
  let fixture: ComponentFixture<BetPaginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetPaginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
