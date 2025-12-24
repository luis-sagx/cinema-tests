import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowtimeList } from './showtime-list';
import { ShowtimeService } from '../../../services/showtime.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ShowtimeList', () => {
  let component: ShowtimeList;
  let fixture: ComponentFixture<ShowtimeList>;
  let showtimeService: jasmine.SpyObj<ShowtimeService>;

  beforeEach(async () => {
    const showtimeServiceSpy = jasmine.createSpyObj('ShowtimeService', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [ShowtimeList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ShowtimeService, useValue: showtimeServiceSpy }
      ]
    })
    .compileComponents();

    showtimeService = TestBed.inject(ShowtimeService) as jasmine.SpyObj<ShowtimeService>;

    fixture = TestBed.createComponent(ShowtimeList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty showtimes array', () => {
    expect(component.showtimes).toEqual([]);
    expect(component.showtimes.length).toBe(0);
  });

  it('should load showtimes on initialization', () => {
    const mockShowtimes = [
      { 
        _id: '1', 
        movie_id: { _id: 'm1', title: 'Movie 1', director: 'Director', genre: 'Action', duration: 120, release_year: 2023 },
        room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00')
      }
    ];
    
    showtimeService.getAll.and.returnValue(of(mockShowtimes));
    
    component.ngOnInit();
    
    expect(showtimeService.getAll).toHaveBeenCalled();
    expect(component.showtimes).toEqual(mockShowtimes);
    expect(component.isLoading).toBeFalse();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-12-24T14:00');
    const formatted = component.formatDate(testDate);
    
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should get movie title from showtime object', () => {
    const mockShowtime = {
      _id: '1',
      movie_id: { _id: 'm1', title: 'Inception', director: 'Nolan', genre: 'Sci-Fi', duration: 148, release_year: 2010 },
      room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
      start_time: new Date('2024-12-24T14:00'),
      end_time: new Date('2024-12-24T16:00')
    };
    
    const title = component.getMovieTitle(mockShowtime);
    expect(title).toBe('Inception');
  });

  it('should delete showtime and reload list on successful deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockShowtimes = [
      { 
        _id: '1', 
        movie_id: { _id: 'm1', title: 'Movie 1', director: 'Director', genre: 'Action', duration: 120, release_year: 2023 },
        room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00')
      }
    ];
    
    showtimeService.delete.and.returnValue(of(undefined));
    showtimeService.getAll.and.returnValue(of(mockShowtimes));
    
    component.deleteShowtime('1');
    
    expect(showtimeService.delete).toHaveBeenCalledWith('1');
    expect(showtimeService.getAll).toHaveBeenCalled();
  });
});
