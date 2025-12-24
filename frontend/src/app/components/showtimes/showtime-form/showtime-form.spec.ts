import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowtimeForm } from './showtime-form';
import { ShowtimeService } from '../../../services/showtime.service';
import { MovieService } from '../../../services/movie.service';
import { RoomService } from '../../../services/room.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ShowtimeForm', () => {
  let component: ShowtimeForm;
  let fixture: ComponentFixture<ShowtimeForm>;
  let showtimeService: jasmine.SpyObj<ShowtimeService>;
  let movieService: jasmine.SpyObj<MovieService>;
  let roomService: jasmine.SpyObj<RoomService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const showtimeServiceSpy = jasmine.createSpyObj('ShowtimeService', ['getById', 'create', 'update']);
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getAll']);
    const roomServiceSpy = jasmine.createSpyObj('RoomService', ['getAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ShowtimeForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ShowtimeService, useValue: showtimeServiceSpy },
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    showtimeService = TestBed.inject(ShowtimeService) as jasmine.SpyObj<ShowtimeService>;
    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    roomService = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ShowtimeForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showtimeForm with empty values', () => {
    expect(component.showtimeForm).toBeDefined();
    expect(component.showtimeForm.get('movie_id')?.value).toBe('');
    expect(component.showtimeForm.get('room_id')?.value).toBe('');
  });

  it('should load movies and rooms on initialization', () => {
    const mockMovies = [
      { _id: '1', title: 'Movie 1', director: 'Director 1', genre: 'Action', duration: 120, release_year: 2023 }
    ];
    const mockRooms = [
      { _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }
    ];
    
    movieService.getAll.and.returnValue(of(mockMovies));
    roomService.getAll.and.returnValue(of(mockRooms));
    
    component.loadData();
    
    expect(movieService.getAll).toHaveBeenCalled();
    expect(roomService.getAll).toHaveBeenCalled();
    expect(component.movies).toEqual(mockMovies);
    expect(component.rooms).toEqual(mockRooms);
  });

  it('should validate all required fields', () => {
    expect(component.showtimeForm.valid).toBeFalse();
    
    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00'
    });
    
    expect(component.showtimeForm.valid).toBeTrue();
  });

  it('should create showtime and navigate on successful submission', () => {
    const mockMovies = [{ _id: '1', title: 'Movie 1', director: 'Director 1', genre: 'Action', duration: 120, release_year: 2023 }];
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];
    
    movieService.getAll.and.returnValue(of(mockMovies));
    roomService.getAll.and.returnValue(of(mockRooms));
    showtimeService.create.and.returnValue(of({ 
      _id: '1', 
      movie_id: 'movie1', 
      room_id: 'room1', 
      start_time: new Date('2024-12-24T14:00'), 
      end_time: new Date('2024-12-24T16:00') 
    }));
    
    component.ngOnInit();
    
    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00'
    });
    
    component.onSubmit();
    
    expect(showtimeService.create).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/showtimes']);
  });

  it('should set errorMessage on submission failure', () => {
    const mockMovies = [{ _id: '1', title: 'Movie 1', director: 'Director 1', genre: 'Action', duration: 120, release_year: 2023 }];
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];
    const errorResponse = { error: { message: 'Time conflict' } };
    
    movieService.getAll.and.returnValue(of(mockMovies));
    roomService.getAll.and.returnValue(of(mockRooms));
    showtimeService.create.and.returnValue(throwError(() => errorResponse));
    
    component.ngOnInit();
    
    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Time conflict');
  });
});
