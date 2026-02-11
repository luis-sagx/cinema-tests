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
    const showtimeServiceSpy = jasmine.createSpyObj('ShowtimeService', [
      'getById',
      'create',
      'update',
    ]);
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getAll']);
    const roomServiceSpy = jasmine.createSpyObj('RoomService', ['getAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
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
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

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
      {
        _id: '1',
        title: 'Movie 1',
        director: 'Director 1',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
    ];
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];

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
      end_time: '2024-12-24T16:00',
    });

    expect(component.showtimeForm.valid).toBeTrue();
  });

  it('should create showtime and navigate on successful submission', () => {
    const mockMovies = [
      {
        _id: '1',
        title: 'Movie 1',
        director: 'Director 1',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
    ];
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];

    movieService.getAll.and.returnValue(of(mockMovies));
    roomService.getAll.and.returnValue(of(mockRooms));
    showtimeService.create.and.returnValue(
      of({
        _id: '1',
        movie_id: 'movie1',
        room_id: 'room1',
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00'),
      }),
    );

    component.ngOnInit();

    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00',
    });

    component.onSubmit();

    expect(showtimeService.create).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/showtimes']);
  });

  it('should set errorMessage on submission failure', () => {
    const mockMovies = [
      {
        _id: '1',
        title: 'Movie 1',
        director: 'Director 1',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
    ];
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
      end_time: '2024-12-24T16:00',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Time conflict');
  });

  // AAA: Edit mode tests
  it('should enter edit mode when showtimeId is provided in route', () => {
    // Arrange: Create a new component with showtimeId in route
    const activatedRouteWithId = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('789'),
        },
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ShowtimeForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ShowtimeService, useValue: showtimeService },
        { provide: MovieService, useValue: movieService },
        { provide: RoomService, useValue: roomService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRouteWithId },
      ],
    });

    movieService.getAll.and.returnValue(of([]));
    roomService.getAll.and.returnValue(of([]));
    showtimeService.getById.and.returnValue(
      of({
        _id: '789',
        movie_id: 'movie1',
        room_id: 'room1',
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00'),
      }),
    );

    const newFixture = TestBed.createComponent(ShowtimeForm);
    const newComponent = newFixture.componentInstance;

    // Act: Initialize component
    newComponent.ngOnInit();

    // Assert: Verify edit mode is activated
    expect(newComponent.isEditMode).toBeTrue();
    expect(newComponent.showtimeId).toBe('789');
  });

  it('should load showtime data in edit mode', (done) => {
    // Arrange: Setup component in edit mode
    component.showtimeId = '789';
    component.isEditMode = true;
    const mockShowtime = {
      _id: '789',
      movie_id: 'movie123',
      room_id: 'room456',
      start_time: new Date('2024-12-25T18:00'),
      end_time: new Date('2024-12-25T20:00'),
    };
    showtimeService.getById.and.returnValue(of(mockShowtime));

    // Act: Load showtime data
    component.loadShowtime();

    // Assert: Verify form is populated with showtime data
    setTimeout(() => {
      expect(showtimeService.getById).toHaveBeenCalledWith('789');
      expect(component.showtimeForm.get('movie_id')?.value).toBe('movie123');
      expect(component.showtimeForm.get('room_id')?.value).toBe('room456');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should handle error when loading showtime fails', (done) => {
    // Arrange: Setup component and error response
    component.showtimeId = '789';
    const errorResponse = { error: { message: 'Showtime not found' } };
    showtimeService.getById.and.returnValue(throwError(() => errorResponse));

    // Act: Attempt to load showtime
    component.loadShowtime();

    // Assert: Verify error is handled
    setTimeout(() => {
      expect(component.errorMessage).toBe('Error loading showtime');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should update showtime in edit mode', () => {
    // Arrange: Setup edit mode and form data
    component.isEditMode = true;
    component.showtimeId = '789';
    showtimeService.update.and.returnValue(
      of({
        _id: '789',
        movie_id: 'movie999',
        room_id: 'room888',
        start_time: new Date('2024-12-26T19:00'),
        end_time: new Date('2024-12-26T21:00'),
      }),
    );

    component.showtimeForm.setValue({
      movie_id: 'movie999',
      room_id: 'room888',
      start_time: '2024-12-26T19:00',
      end_time: '2024-12-26T21:00',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify update was called and navigation occurred
    expect(showtimeService.update).toHaveBeenCalledWith(
      '789',
      jasmine.objectContaining({
        movie_id: 'movie999',
        room_id: 'room888',
      }),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/showtimes']);
  });

  it('should set errorMessage when update fails', () => {
    // Arrange: Setup edit mode and error response
    component.isEditMode = true;
    component.showtimeId = '789';
    const errorResponse = { error: { message: 'Update failed' } };
    showtimeService.update.and.returnValue(throwError(() => errorResponse));

    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe('Update failed');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to showtimes list when cancel is clicked', () => {
    // Arrange: Component is ready

    // Act: Call cancel
    component.cancel();

    // Assert: Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/showtimes']);
  });

  it('should not submit if form is invalid', () => {
    // Arrange: Form with invalid data
    component.showtimeForm.setValue({
      movie_id: '', // Invalid: required field
      room_id: '', // Invalid: required field
      start_time: '',
      end_time: '',
    });

    // Act: Attempt to submit
    component.onSubmit();

    // Assert: Verify no service call was made
    expect(showtimeService.create).not.toHaveBeenCalled();
    expect(showtimeService.update).not.toHaveBeenCalled();
  });

  it('should set default errorMessage when error has no message property', () => {
    // Arrange: Error without message property
    const errorResponse = { error: {} };
    showtimeService.create.and.returnValue(throwError(() => errorResponse));

    component.showtimeForm.setValue({
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: '2024-12-24T14:00',
      end_time: '2024-12-24T16:00',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify default error message
    expect(component.errorMessage).toBe('Error saving showtime');
  });

  it('should handle error when loading data fails', (done) => {
    // Arrange: Setup error response for loadData
    const errorResponse = { error: { message: 'Data loading failed' } };
    movieService.getAll.and.returnValue(throwError(() => errorResponse));
    roomService.getAll.and.returnValue(of([]));

    // Act: Load data
    component.loadData();

    // Assert: Verify error is handled
    setTimeout(() => {
      expect(component.errorMessage).toBe('Error loading data');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should format date correctly for input', () => {
    // Arrange: Date string
    const dateString = '2024-12-25T14:30:00';

    // Act: Format date
    const formattedDate = component.formatDateForInput(dateString);

    // Assert: Verify formatted date
    expect(formattedDate).toBe('2024-12-25');
  });

  it('should format Date object correctly for input', () => {
    // Arrange: Date object
    const date = new Date('2024-06-15T10:00:00');

    // Act: Format date
    const formattedDate = component.formatDateForInput(date);

    // Assert: Verify formatted date
    expect(formattedDate).toBe('2024-06-15');
  });

  it('should validate movie_id as required', () => {
    // Arrange: Get movie_id control
    const movieControl = component.showtimeForm.get('movie_id');

    // Act: Set empty value
    movieControl?.setValue('');

    // Assert: Verify validation error
    expect(movieControl?.hasError('required')).toBeTrue();

    // Act: Set valid value
    movieControl?.setValue('movie123');

    // Assert: Verify control is valid
    expect(movieControl?.valid).toBeTrue();
  });

  it('should validate room_id as required', () => {
    // Arrange: Get room_id control
    const roomControl = component.showtimeForm.get('room_id');

    // Act: Set empty value
    roomControl?.setValue('');

    // Assert: Verify validation error
    expect(roomControl?.hasError('required')).toBeTrue();

    // Act: Set valid value
    roomControl?.setValue('room456');

    // Assert: Verify control is valid
    expect(roomControl?.valid).toBeTrue();
  });

  it('should load showtime after movies and rooms are loaded in edit mode', (done) => {
    // Arrange: Setup edit mode
    component.showtimeId = '789';
    component.isEditMode = true;

    const mockMovies = [
      {
        _id: '1',
        title: 'Movie 1',
        director: 'Director 1',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
    ];
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];
    const mockShowtime = {
      _id: '789',
      movie_id: 'movie1',
      room_id: 'room1',
      start_time: new Date('2024-12-24'),
      end_time: new Date('2024-12-25'),
    };

    movieService.getAll.and.returnValue(of(mockMovies));
    roomService.getAll.and.returnValue(of(mockRooms));
    showtimeService.getById.and.returnValue(of(mockShowtime));

    // Act: Load data
    component.loadData();

    // Assert: Verify showtime is loaded after movies and rooms
    setTimeout(() => {
      expect(component.movies).toEqual(mockMovies);
      expect(component.rooms).toEqual(mockRooms);
      expect(showtimeService.getById).toHaveBeenCalledWith('789');
      done();
    }, 100);
  });
});
