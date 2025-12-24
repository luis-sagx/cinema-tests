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
        { provide: MovieService, useValue: movieServiceSpy }
      ]
    })
    .compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;

    fixture = TestBed.createComponent(MovieList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty movies array', () => {
    expect(component.movies).toEqual([]);
    expect(component.movies.length).toBe(0);
  });

  it('should load movies on initialization', () => {
    const mockMovies = [
      { _id: '1', title: 'Movie 1', director: 'Director 1', genre: 'Action', duration: 120, release_year: 2023 },
      { _id: '2', title: 'Movie 2', director: 'Director 2', genre: 'Comedy', duration: 90, release_year: 2024 }
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
      { _id: '1', title: 'Movie 1', director: 'Director 1', genre: 'Action', duration: 120, release_year: 2023 }
    ];
    
    movieService.delete.and.returnValue(of(undefined));
    movieService.getAll.and.returnValue(of(mockMovies));
    
    component.deleteMovie('1');
    
    expect(movieService.delete).toHaveBeenCalledWith('1');
    expect(movieService.getAll).toHaveBeenCalled();
  });

  it('should not delete movie if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteMovie('1');
    
    expect(movieService.delete).not.toHaveBeenCalled();
  });
});
