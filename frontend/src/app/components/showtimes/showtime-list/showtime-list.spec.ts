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
        { provide: ShowtimeService, useValue: showtimeServiceSpy },
      ],
    }).compileComponents();

    showtimeService = TestBed.inject(ShowtimeService) as jasmine.SpyObj<ShowtimeService>;

    fixture = TestBed.createComponent(ShowtimeList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty showtimes array', () => {
    // Assert
    expect(component.showtimes).toEqual([]);
    expect(component.showtimes.length).toBe(0);
  });

  it('should load showtimes on initialization', () => {
    // Arrange
    const mockShowtimes = [
      {
        _id: '1',
        movie_id: {
          _id: 'm1',
          title: 'Movie 1',
          director: 'Director',
          genre: 'Action',
          duration: 120,
          release_year: 2023,
        },
        room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00'),
      },
    ];

    showtimeService.getAll.and.returnValue(of(mockShowtimes));

    component.ngOnInit();

    expect(showtimeService.getAll).toHaveBeenCalled();
    expect(component.showtimes).toEqual(mockShowtimes);
    expect(component.isLoading).toBeFalse();
  });

  it('should format date correctly', () => {
    // Arrange
    const testDate = new Date('2024-12-24T14:00');

    // Act
    const formatted = component.formatDate(testDate);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should get movie title from showtime object', () => {
    // Arrange
    const mockShowtime = {
      _id: '1',
      movie_id: {
        _id: 'm1',
        title: 'Inception',
        director: 'Nolan',
        genre: 'Sci-Fi',
        duration: 148,
        release_year: 2010,
      },
      room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
      start_time: new Date('2024-12-24T14:00'),
      end_time: new Date('2024-12-24T16:00'),
    };

    const title = component.getMovieTitle(mockShowtime);

    // Assert
    expect(title).toBe('Inception');
  });

  it('should delete showtime and reload list on successful deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockShowtimes = [
      {
        _id: '1',
        movie_id: {
          _id: 'm1',
          title: 'Movie 1',
          director: 'Director',
          genre: 'Action',
          duration: 120,
          release_year: 2023,
        },
        room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
        start_time: new Date('2024-12-24T14:00'),
        end_time: new Date('2024-12-24T16:00'),
      },
    ];
    showtimeService.delete.and.returnValue(of(undefined));
    showtimeService.getAll.and.returnValue(of(mockShowtimes));

    // Act
    component.deleteShowtime('1');
    tick();

    expect(showtimeService.delete).toHaveBeenCalledWith('1');
    expect(showtimeService.getAll).toHaveBeenCalled();
  });

  // AAA: Additional deleteShowtime tests
  it('should not delete showtime if user cancels confirmation', () => {
    // Arrange: Setup confirmation to return false
    spyOn(window, 'confirm').and.returnValue(false);

    // Act: Attempt to delete
    component.deleteShowtime('1');

    // Assert: Verify no delete was called
    expect(showtimeService.delete).not.toHaveBeenCalled();
  });

  it('should handle error when delete fails', () => {
    // Arrange: Setup delete to fail
    spyOn(window, 'confirm').and.returnValue(true);
    const errorResponse = { error: { message: 'Showtime is in use' } };
    showtimeService.delete.and.returnValue(throwError(() => errorResponse));

    // Act: Delete showtime
    component.deleteShowtime('1');

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe('Error deleting showtime');
  });

  it('should get room name from showtime object', () => {
    // Arrange: Create mock showtime
    const mockShowtime = {
      _id: '1',
      movie_id: {
        _id: 'm1',
        title: 'Movie 1',
        director: 'Director',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
      room_id: { _id: 'r1', name: 'VIP Room', capacity: 50, type: 'VIP' as const },
      start_time: new Date('2024-12-24T14:00'),
      end_time: new Date('2024-12-24T16:00'),
    };

    // Act: Get room name
    const roomName = component.getRoomName(mockShowtime);

    // Assert: Verify room name is returned
    expect(roomName).toBe('VIP Room');
  });

  it('should handle showtime with string movie_id', () => {
    // Arrange: Create showtime with string movie_id (not populated)
    const mockShowtime = {
      _id: '1',
      movie_id: 'movie123' as unknown as string,
      room_id: { _id: 'r1', name: 'Room 1', capacity: 100, type: '2D' as const },
      start_time: new Date('2024-12-24T14:00'),
      end_time: new Date('2024-12-24T16:00'),
    };

    // Act: Get movie title
    const title = component.getMovieTitle(mockShowtime);

    // Assert: Verify it returns fallback message
    expect(title).toBe('Movie not available');
  });

  it('should handle showtime with string room_id', () => {
    // Arrange: Create showtime with string room_id (not populated)
    const mockShowtime = {
      _id: '1',
      movie_id: {
        _id: 'm1',
        title: 'Movie 1',
        director: 'Director',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
      room_id: 'room456' as unknown as string,
      start_time: new Date('2024-12-24T14:00'),
      end_time: new Date('2024-12-24T16:00'),
    };

    // Act: Get room name
    const roomName = component.getRoomName(mockShowtime);

    // Assert: Verify it returns fallback message
    expect(roomName).toBe('Room not available');
  });

  it('should set errorMessage when loading showtimes fails', () => {
    showtimeService.getAll.and.returnValue(throwError(() => new Error('Network error')));

    component.loadShowtimes();

    expect(component.errorMessage).toBe('Error loading showtimes');
    expect(component.isLoading).toBeFalse();
  });
});
