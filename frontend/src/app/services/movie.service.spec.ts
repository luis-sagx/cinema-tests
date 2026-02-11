import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { Movie } from '../models/movie.model';
import { environment } from '../../environments/environment.development';
import { provideHttpClient } from '@angular/common/http';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/movies`;

  const mockMovie: Movie = {
    _id: '1',
    title: 'Test Movie',
    genre: 'Action',
    duration: 120,
    release_year: 2024,
    director: 'Test Director',
  };

  const mockMovies: Movie[] = [
    mockMovie,
    {
      _id: '2',
      title: 'Another Movie',
      genre: 'Comedy',
      duration: 90,
      release_year: 2024,
      director: 'Another Director',
    },
  ];

  beforeEach(() => {
    // Arrange: Configurar el TestBed
    TestBed.configureTestingModule({
      providers: [MovieService, provideHttpClient(), provideHttpClientTesting()],
    });

    // Arrange: Inyectar servicios y mocks
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Assert: Verificar que no hay solicitudes HTTP pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    // Assert: El servicio debe ser creado
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all movies successfully (AAA)', () => {
      // Arrange: Los mockMovies ya están definidos

      // Act: Llamar al método getAll
      service.getAll().subscribe((movies) => {
        // Assert: Verificar que se recibieron las películas
        expect(movies).toEqual(mockMovies);
        expect(movies.length).toBe(2);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockMovies);
    });

    it('should handle empty array response (AAA)', () => {
      // Arrange: Array vacío

      // Act: Llamar al método getAll
      service.getAll().subscribe((movies) => {
        // Assert: Verificar que se recibió un array vacío
        expect(movies).toEqual([]);
        expect(movies.length).toBe(0);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should retrieve a single movie by id successfully (AAA)', () => {
      // Arrange: Preparar ID de película
      const movieId = '1';

      // Act: Llamar al método getById
      service.getById(movieId).subscribe((movie) => {
        // Assert: Verificar que se recibió la película correcta
        expect(movie).toEqual(mockMovie);
        expect(movie._id).toBe(movieId);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMovie);
    });

    it('should handle 404 error when movie not found (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const movieId = 'non-existent';
      const errorMessage = 'Movie not found';

      // Act: Llamar al método getById
      service.getById(movieId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new movie successfully (AAA)', () => {
      // Arrange: Preparar nueva película (sin ID)
      const newMovie: Movie = {
        title: 'New Movie',
        genre: 'Drama',
        duration: 110,
        release_year: 2020,
        director: 'New Director',
      };

      const createdMovie: Movie = { ...newMovie, _id: '3' };

      // Act: Llamar al método create
      service.create(newMovie).subscribe((movie) => {
        // Assert: Verificar que se creó la película
        expect(movie).toEqual(createdMovie);
        expect(movie._id).toBe('3');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newMovie);
      req.flush(createdMovie);
    });

    it('should handle validation error when creating movie (AAA)', () => {
      // Arrange: Preparar película con datos inválidos
      const invalidMovie: Movie = {
        title: '', // título vacío
        genre: 'Action',
        duration: -1, // duración negativa
        release_year: 2024,
        director: 'Test',
      };

      // Act: Llamar al método create
      service.create(invalidMovie).subscribe({
        next: () => fail('should have failed with validation error'),
        error: (error) => {
          // Assert: Verificar el error de validación
          expect(error.status).toBe(400);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing movie successfully (AAA)', () => {
      // Arrange: Preparar película actualizada
      const movieId = '1';
      const updatedMovie: Movie = {
        ...mockMovie,
        title: 'Updated Title',
      };

      // Act: Llamar al método update
      service.update(movieId, updatedMovie).subscribe((movie) => {
        // Assert: Verificar que se actualizó la película
        expect(movie).toEqual(updatedMovie);
        expect(movie.title).toBe('Updated Title');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedMovie);
      req.flush(updatedMovie);
    });

    it('should handle error when updating non-existent movie (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const movieId = 'non-existent';
      const updatedMovie: Movie = { ...mockMovie };

      // Act: Llamar al método update
      service.update(movieId, updatedMovie).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('PUT');
      req.flush('Movie not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully (AAA)', () => {
      // Arrange: Preparar ID de película a eliminar
      const movieId = '1';

      // Act: Llamar al método delete
      service.delete(movieId).subscribe((response) => {
        // Assert: Verificar que se completó la eliminación (void puede ser null o undefined)
        expect(response).toBeNull();
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent movie (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const movieId = 'non-existent';

      // Act: Llamar al método delete
      service.delete(movieId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Movie not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error when deleting movie (AAA)', () => {
      // Arrange: Preparar ID que causará error del servidor
      const movieId = '1';

      // Act: Llamar al método delete
      service.delete(movieId).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          // Assert: Verificar el error del servidor
          expect(error.status).toBe(500);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${movieId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
