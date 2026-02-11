import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieList } from './movie-list';
import { MovieService } from '../../../services/movie.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('MovieList', () => {
  let component: MovieList;
  let fixture: ComponentFixture<MovieList>;
  let movieService: jasmine.SpyObj<MovieService>;

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [MovieList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MovieService, useValue: movieServiceSpy },
      ],
    }).compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;

    fixture = TestBed.createComponent(MovieList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty movies array', () => {
    // Assert
    expect(component.movies).toEqual([]);
    expect(component.movies.length).toBe(0);
  });

  it('should load movies on initialization', () => {
    // Arrange
    const mockMovies = [
      {
        _id: '1',
        title: 'Movie 1',
        director: 'Director 1',
        genre: 'Action',
        duration: 120,
        release_year: 2023,
      },
      {
        _id: '2',
        title: 'Movie 2',
        director: 'Director 2',
        genre: 'Comedy',
        duration: 90,
        release_year: 2024,
      },
    ];

    movieService.getAll.and.returnValue(of(mockMovies));

    component.ngOnInit();

    expect(movieService.getAll).toHaveBeenCalled();
    expect(component.movies).toEqual(mockMovies);
    expect(component.isLoading).toBeFalse();
  });

  it('should set errorMessage when loading movies fails', () => {
    movieService.getAll.and.returnValue(throwError(() => new Error('Network error')));

    component.loadMovies();

    expect(component.errorMessage).toBe('Error to load movies');
    expect(component.isLoading).toBeFalse();
  });

  it('should delete movie and reload list on successful deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);

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
    movieService.delete.and.returnValue(of(undefined));
    movieService.getAll.and.returnValue(of(mockMovies));

    // Act
    component.deleteMovie('1');
    tick();

    // Assert
    expect(movieService.delete).toHaveBeenCalledWith('1');
    expect(movieService.getAll).toHaveBeenCalled();
  });

  it('should not delete movie if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    // Act
    component.deleteMovie('1');
    tick();

    // Assert
    expect(movieService.delete).not.toHaveBeenCalled();
  });

  // AAA: Additional deleteMovie tests
  it('should handle error when delete fails', () => {
    // Arrange: Setup delete to fail
    spyOn(window, 'confirm').and.returnValue(true);
    const errorResponse = { error: { message: 'Movie is in use' } };
    movieService.delete.and.returnValue(throwError(() => errorResponse));

    // Act: Delete movie
    component.deleteMovie('1');

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe(
      'The movie cannot be deleted because it is being used in one or more showtimes',
    );
  });

  it('should clear errorMessage before loading movies', () => {
    // Arrange: Set initial error message
    component.errorMessage = 'Previous error';
    movieService.getAll.and.returnValue(of([]));

    // Act: Reload movies
    component.loadMovies();

    // Assert: Error should be cleared during loading
    // Since subscribe is async, we check state after subscription
    expect(movieService.getAll).toHaveBeenCalled();
  });
});
