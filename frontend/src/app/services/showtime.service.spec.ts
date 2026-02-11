import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ShowtimeService } from './showtime.service';
import { Showtime } from '../models/showtime.model';
import { environment } from '../../environments/environment.development';
import { provideHttpClient } from '@angular/common/http';

describe('ShowtimeService', () => {
  let service: ShowtimeService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/showtimes`;

  const mockShowtime: Showtime = {
    _id: '1',
    movie_id: 'movie1',
    room_id: 'room1',
    start_time: new Date('2024-12-20T18:00:00'),
    end_time: new Date('2024-12-20T20:00:00'),
    user_id: 'user1',
  };

  const mockShowtimes: Showtime[] = [
    mockShowtime,
    {
      _id: '2',
      movie_id: 'movie2',
      room_id: 'room2',
      start_time: new Date('2024-12-20T20:30:00'),
      end_time: new Date('2024-12-20T22:30:00'),
      user_id: 'user2',
    },
  ];

  beforeEach(() => {
    // Arrange: Configurar el TestBed
    TestBed.configureTestingModule({
      providers: [ShowtimeService, provideHttpClient(), provideHttpClientTesting()],
    });

    // Arrange: Inyectar servicios y mocks
    service = TestBed.inject(ShowtimeService);
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
    it('should retrieve all showtimes successfully (AAA)', () => {
      // Arrange: Los mockShowtimes ya están definidos

      // Act: Llamar al método getAll
      service.getAll().subscribe((showtimes) => {
        // Assert: Verificar que se recibieron las funciones
        expect(showtimes).toEqual(mockShowtimes);
        expect(showtimes.length).toBe(2);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockShowtimes);
    });

    it('should handle empty array response (AAA)', () => {
      // Arrange: Array vacío

      // Act: Llamar al método getAll
      service.getAll().subscribe((showtimes) => {
        // Assert: Verificar que se recibió un array vacío
        expect(showtimes).toEqual([]);
        expect(showtimes.length).toBe(0);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should retrieve a single showtime by id successfully (AAA)', () => {
      // Arrange: Preparar ID de función
      const showtimeId = '1';

      // Act: Llamar al método getById
      service.getById(showtimeId).subscribe((showtime) => {
        // Assert: Verificar que se recibió la función correcta
        expect(showtime).toEqual(mockShowtime);
        expect(showtime._id).toBe(showtimeId);
        expect(showtime.movie_id).toBe('movie1');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockShowtime);
    });

    it('should handle 404 error when showtime not found (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const showtimeId = 'non-existent';
      const errorMessage = 'Showtime not found';

      // Act: Llamar al método getById
      service.getById(showtimeId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new showtime successfully (AAA)', () => {
      // Arrange: Preparar nueva función (sin ID)
      const newShowtime: Showtime = {
        movie_id: 'movie3',
        room_id: 'room3',
        start_time: new Date('2024-12-21T16:00:00'),
        end_time: new Date('2024-12-21T18:00:00'),
        user_id: 'user3',
      };

      const createdShowtime: Showtime = { ...newShowtime, _id: '3' };

      // Act: Llamar al método create
      service.create(newShowtime).subscribe((showtime) => {
        // Assert: Verificar que se creó la función
        expect(showtime).toEqual(createdShowtime);
        expect(showtime._id).toBe('3');
        expect(showtime.user_id).toBe('user3');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newShowtime);
      req.flush(createdShowtime);
    });

    it('should handle validation error when creating showtime (AAA)', () => {
      // Arrange: Preparar función con datos inválidos
      const invalidShowtime: Showtime = {
        movie_id: '',
        room_id: '',
        start_time: new Date('2024-12-20T20:00:00'),
        end_time: new Date('2024-12-20T18:00:00'), // endTime antes de startTime
        user_id: '',
      };

      // Act: Llamar al método create
      service.create(invalidShowtime).subscribe({
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

    it('should handle time conflict error (AAA)', () => {
      // Arrange: Preparar función con conflicto de horario
      const conflictShowtime: Showtime = {
        movie_id: 'movie1',
        room_id: 'room1',
        start_time: new Date('2024-12-20T18:30:00'),
        end_time: new Date('2024-12-20T20:30:00'),
        user_id: 'user1',
      };

      // Act: Llamar al método create
      service.create(conflictShowtime).subscribe({
        next: () => fail('should have failed with conflict error'),
        error: (error) => {
          // Assert: Verificar el error de conflicto
          expect(error.status).toBe(409);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush('Time conflict', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('update', () => {
    it('should update an existing showtime successfully (AAA)', () => {
      // Arrange: Preparar función actualizada
      const showtimeId = '1';
      const updatedShowtime: Showtime = {
        ...mockShowtime,
        user_id: 'user1',
      };

      // Act: Llamar al método update
      service.update(showtimeId, updatedShowtime).subscribe((showtime) => {
        // Assert: Verificar que se actualizó la función
        expect(showtime).toEqual(updatedShowtime);
        expect(showtime.user_id).toBe('user1');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedShowtime);
      req.flush(updatedShowtime);
    });

    it('should handle error when updating non-existent showtime (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const showtimeId = 'non-existent';
      const updatedShowtime: Showtime = { ...mockShowtime };

      // Act: Llamar al método update
      service.update(showtimeId, updatedShowtime).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('PUT');
      req.flush('Showtime not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle time conflict when updating showtime (AAA)', () => {
      // Arrange: Preparar función con conflicto de horario
      const showtimeId = '1';
      const conflictShowtime: Showtime = {
        ...mockShowtime,
        start_time: new Date('2024-12-20T20:00:00'),
        end_time: new Date('2024-12-20T22:00:00'),
      };

      // Act: Llamar al método update
      service.update(showtimeId, conflictShowtime).subscribe({
        next: () => fail('should have failed with conflict error'),
        error: (error) => {
          // Assert: Verificar el error de conflicto
          expect(error.status).toBe(409);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('PUT');
      req.flush('Time conflict', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('delete', () => {
    it('should delete a showtime successfully (AAA)', () => {
      // Arrange: Preparar ID de función a eliminar
      const showtimeId = '1';

      // Act: Llamar al método delete
      service.delete(showtimeId).subscribe((response) => {
        // Assert: Verificar que se completó la eliminación (void puede ser null o undefined)
        expect(response).toBeNull();
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent showtime (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const showtimeId = 'non-existent';

      // Act: Llamar al método delete
      service.delete(showtimeId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Showtime not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle conflict when deleting showtime with reservations (AAA)', () => {
      // Arrange: Preparar ID de función con reservaciones
      const showtimeId = '1';

      // Act: Llamar al método delete
      service.delete(showtimeId).subscribe({
        next: () => fail('should have failed with 409 error'),
        error: (error) => {
          // Assert: Verificar el error de conflicto
          expect(error.status).toBe(409);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${showtimeId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Showtime has reservations', { status: 409, statusText: 'Conflict' });
    });
  });
});
