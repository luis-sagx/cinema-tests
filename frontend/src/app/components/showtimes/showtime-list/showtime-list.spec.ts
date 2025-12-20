import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowtimeList } from './showtime-list';

describe('ShowtimeList', () => {
  let component: ShowtimeList;
  let fixture: ComponentFixture<ShowtimeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowtimeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
