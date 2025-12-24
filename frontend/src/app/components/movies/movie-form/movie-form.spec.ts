import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieForm } from './movie-form';
import { MovieService } from '../../../services/movie.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('MovieForm', () => {
  let component: MovieForm;
  let fixture: ComponentFixture<MovieForm>;
  let movieService: jasmine.SpyObj<MovieService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getById', 'create', 'update']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [MovieForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(MovieForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize movieForm with empty values', () => {
    expect(component.movieForm).toBeDefined();
    expect(component.movieForm.get('title')?.value).toBe('');
    expect(component.movieForm.get('duration')?.value).toBeNull();
  });

  it('should validate title as required', () => {
    const titleControl = component.movieForm.get('title');
    
    titleControl?.setValue('');
    expect(titleControl?.hasError('required')).toBeTrue();
    
    titleControl?.setValue('Inception');
    expect(titleControl?.valid).toBeTrue();
  });

  it('should validate duration as required and minimum value', () => {
    const durationControl = component.movieForm.get('duration');
    
    durationControl?.setValue(null);
    expect(durationControl?.hasError('required')).toBeTrue();
    
    durationControl?.setValue(0);
    expect(durationControl?.hasError('min')).toBeTrue();
    
    durationControl?.setValue(120);
    expect(durationControl?.valid).toBeTrue();
  });

  it('should create movie and navigate on successful submission', () => {
    movieService.create.and.returnValue(of({ _id: '1', title: 'New Movie', director: 'Director', genre: 'Action', duration: 120, release_year: 2024 }));
    
    component.movieForm.setValue({
      title: 'New Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024
    });
    
    component.onSubmit();
    
    expect(movieService.create).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/movies']);
  });

  it('should set errorMessage on submission failure', () => {
    const errorResponse = { error: { message: 'Failed to create movie' } };
    movieService.create.and.returnValue(throwError(() => errorResponse));
    
    component.movieForm.setValue({
      title: 'New Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Failed to create movie');
  });
});
