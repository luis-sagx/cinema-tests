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
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [MovieForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

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
    movieService.create.and.returnValue(
      of({
        _id: '1',
        title: 'New Movie',
        director: 'Director',
        genre: 'Action',
        duration: 120,
        release_year: 2024,
      }),
    );

    component.movieForm.setValue({
      title: 'New Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024,
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
      release_year: 2024,
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Failed to create movie');
  });

  // AAA: Edit mode tests
  it('should enter edit mode when movieId is provided in route', () => {
    // Arrange: Create a new component with movieId in route
    const activatedRouteWithId = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123'),
        },
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MovieForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: MovieService, useValue: movieService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRouteWithId },
      ],
    });

    movieService.getById.and.returnValue(
      of({
        _id: '123',
        title: 'Existing Movie',
        director: 'Director',
        genre: 'Drama',
        duration: 150,
        release_year: 2023,
      }),
    );

    const newFixture = TestBed.createComponent(MovieForm);
    const newComponent = newFixture.componentInstance;

    // Act: Initialize component
    newComponent.ngOnInit();

    // Assert: Verify edit mode is activated
    expect(newComponent.isEditMode).toBeTrue();
    expect(newComponent.movieId).toBe('123');
  });

  it('should load movie data in edit mode', (done) => {
    // Arrange: Setup component in edit mode
    component.movieId = '123';
    component.isEditMode = true;
    const mockMovie = {
      _id: '123',
      title: 'Existing Movie',
      director: 'Director A',
      genre: 'Thriller',
      duration: 140,
      release_year: 2022,
    };
    movieService.getById.and.returnValue(of(mockMovie));

    // Act: Load movie data
    component.loadMovie();

    // Assert: Verify form is populated with movie data
    setTimeout(() => {
      expect(movieService.getById).toHaveBeenCalledWith('123');
      expect(component.movieForm.get('title')?.value).toBe('Existing Movie');
      expect(component.movieForm.get('director')?.value).toBe('Director A');
      expect(component.movieForm.get('genre')?.value).toBe('Thriller');
      expect(component.movieForm.get('duration')?.value).toBe(140);
      expect(component.movieForm.get('release_year')?.value).toBe(2022);
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should handle error when loading movie fails', (done) => {
    // Arrange: Setup component and error response
    component.movieId = '123';
    component.isEditMode = true;
    const errorResponse = { error: { message: 'Movie not found' } };
    movieService.getById.and.returnValue(throwError(() => errorResponse));

    // Act: Attempt to load movie
    component.loadMovie();

    // Assert: Verify error is handled
    setTimeout(() => {
      expect(component.errorMessage).toBe('Error to load movie');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should update movie in edit mode', () => {
    // Arrange: Setup edit mode and form data
    component.isEditMode = true;
    component.movieId = '123';
    movieService.update.and.returnValue(
      of({
        _id: '123',
        title: 'Updated Movie',
        director: 'New Director',
        genre: 'Comedy',
        duration: 110,
        release_year: 2024,
      }),
    );

    component.movieForm.setValue({
      title: 'Updated Movie',
      director: 'New Director',
      genre: 'Comedy',
      duration: 110,
      release_year: 2024,
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify update was called and navigation occurred
    expect(movieService.update).toHaveBeenCalledWith('123', component.movieForm.value);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/movies']);
  });

  it('should set errorMessage when update fails', () => {
    // Arrange: Setup edit mode and error response
    component.isEditMode = true;
    component.movieId = '123';
    const errorResponse = { error: { message: 'Update failed' } };
    movieService.update.and.returnValue(throwError(() => errorResponse));

    component.movieForm.setValue({
      title: 'Updated Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024,
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe('Update failed');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to movies list when cancel is clicked', () => {
    // Arrange: Component is ready

    // Act: Call cancel
    component.cancel();

    // Assert: Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/movies']);
  });

  it('should not submit if form is invalid', () => {
    // Arrange: Form with invalid data
    component.movieForm.setValue({
      title: '', // Invalid: required field
      director: 'Director',
      genre: 'Action',
      duration: 0, // Invalid: min value is 1
      release_year: 2024,
    });

    // Act: Attempt to submit
    component.onSubmit();

    // Assert: Verify no service call was made
    expect(movieService.create).not.toHaveBeenCalled();
    expect(movieService.update).not.toHaveBeenCalled();
  });

  it('should set default errorMessage when error has no message property', () => {
    // Arrange: Error without message property
    const errorResponse = { error: {} };
    movieService.create.and.returnValue(throwError(() => errorResponse));

    component.movieForm.setValue({
      title: 'New Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024,
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify default error message
    expect(component.errorMessage).toBe('Error to save movie');
  });

  it('should set isLoading to true while submitting', () => {
    // Arrange: Setup with delayed response
    movieService.create.and.returnValue(
      of({
        _id: '1',
        title: 'New Movie',
        director: 'Director',
        genre: 'Action',
        duration: 120,
        release_year: 2024,
      }),
    );

    component.movieForm.setValue({
      title: 'New Movie',
      director: 'Director',
      genre: 'Action',
      duration: 120,
      release_year: 2024,
    });

    // Act: Submit form
    expect(component.isLoading).toBeFalse();
    component.onSubmit();

    // Assert: Verify loading state
    expect(component.isLoading).toBeTrue();
  });

  it('should not call loadMovie when movieId is null (AAA)', () => {
    // Arrange: Component without movieId
    component.movieId = null;

    // Act: Call loadMovie directly
    component.loadMovie();

    // Assert: Service should not be called when no ID
    expect(movieService.getById).not.toHaveBeenCalled();
  });

  it('should initialize with isEditMode as false (AAA)', () => {
    // Arrange & Act: Component is created

    // Assert: Verify initial state
    expect(component.isEditMode).toBeFalse();
    expect(component.movieId).toBeNull();
  });

  it('should initialize with empty errorMessage (AAA)', () => {
    // Arrange & Act: Component is created

    // Assert: Verify error message is empty
    expect(component.errorMessage).toBe('');
  });

  it('should initialize with isLoading as false (AAA)', () => {
    // Arrange & Act: Component is created

    // Assert: Verify loading state is false
    expect(component.isLoading).toBeFalse();
  });
});
