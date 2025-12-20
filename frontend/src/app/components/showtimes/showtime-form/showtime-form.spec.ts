import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtimeForm } from './showtime-form';

describe('ShowtimeForm', () => {
  let component: ShowtimeForm;
  let fixture: ComponentFixture<ShowtimeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtimeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
