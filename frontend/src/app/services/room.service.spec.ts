import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoomService } from './room.service';
import { Room } from '../models/room.model';
import { environment } from '../../environments/environment.development';
import { provideHttpClient } from '@angular/common/http';

describe('RoomService', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/rooms`;

  const mockRoom: Room = {
    _id: '1',
    name: 'Room 1',
    capacity: 100,
    type: '3D',
  };

  const mockRooms: Room[] = [
    mockRoom,
    {
      _id: '2',
      name: 'Room 2',
      capacity: 150,
      type: 'VIP',
    },
  ];

  beforeEach(() => {
    // Arrange: Configurar el TestBed
    TestBed.configureTestingModule({
      providers: [RoomService, provideHttpClient(), provideHttpClientTesting()],
    });

    // Arrange: Inyectar servicios y mocks
    service = TestBed.inject(RoomService);
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
    it('should retrieve all rooms successfully (AAA)', () => {
      // Arrange: Los mockRooms ya están definidos

      // Act: Llamar al método getAll
      service.getAll().subscribe((rooms) => {
        // Assert: Verificar que se recibieron las salas
        expect(rooms).toEqual(mockRooms);
        expect(rooms.length).toBe(2);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRooms);
    });

    it('should handle empty array response (AAA)', () => {
      // Arrange: Array vacío

      // Act: Llamar al método getAll
      service.getAll().subscribe((rooms) => {
        // Assert: Verificar que se recibió un array vacío
        expect(rooms).toEqual([]);
        expect(rooms.length).toBe(0);
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getById', () => {
    it('should retrieve a single room by id successfully (AAA)', () => {
      // Arrange: Preparar ID de sala
      const roomId = '1';

      // Act: Llamar al método getById
      service.getById(roomId).subscribe((room) => {
        // Assert: Verificar que se recibió la sala correcta
        expect(room).toEqual(mockRoom);
        expect(room._id).toBe(roomId);
        expect(room.name).toBe('Room 1');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoom);
    });

    it('should handle 404 error when room not found (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const roomId = 'non-existent';
      const errorMessage = 'Room not found';

      // Act: Llamar al método getById
      service.getById(roomId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new room successfully (AAA)', () => {
      // Arrange: Preparar nueva sala (sin ID)
      const newRoom: Room = {
        name: 'Room 3',
        capacity: 80,
        type: '2D',
      };

      const createdRoom: Room = { ...newRoom, _id: '3' };

      // Act: Llamar al método create
      service.create(newRoom).subscribe((room) => {
        // Assert: Verificar que se creó la sala
        expect(room).toEqual(createdRoom);
        expect(room._id).toBe('3');
        expect(room.name).toBe('Room 3');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRoom);
      req.flush(createdRoom);
    });

    it('should handle validation error when creating room (AAA)', () => {
      // Arrange: Preparar sala con datos inválidos
      const invalidRoom: Room = {
        name: '', // nombre vacío
        capacity: -10, // capacidad negativa
        type: '3D',
      };

      // Act: Llamar al método create
      service.create(invalidRoom).subscribe({
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

    it('should handle duplicate room name error (AAA)', () => {
      // Arrange: Preparar sala con nombre duplicado
      const duplicateRoom: Room = {
        name: 'Room 1', // nombre ya existe
        capacity: 100,
        type: '3D',
      };

      // Act: Llamar al método create
      service.create(duplicateRoom).subscribe({
        next: () => fail('should have failed with conflict error'),
        error: (error) => {
          // Assert: Verificar el error de conflicto
          expect(error.status).toBe(409);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush('Room name already exists', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('update', () => {
    it('should update an existing room successfully (AAA)', () => {
      // Arrange: Preparar sala actualizada
      const roomId = '1';
      const updatedRoom: Room = {
        ...mockRoom,
        capacity: 120,
        type: 'VIP',
      };

      // Act: Llamar al método update
      service.update(roomId, updatedRoom).subscribe((room) => {
        // Assert: Verificar que se actualizó la sala
        expect(room).toEqual(updatedRoom);
        expect(room.capacity).toBe(120);
        expect(room.type).toBe('VIP');
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedRoom);
      req.flush(updatedRoom);
    });

    it('should handle error when updating non-existent room (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const roomId = 'non-existent';
      const updatedRoom: Room = { ...mockRoom };

      // Act: Llamar al método update
      service.update(roomId, updatedRoom).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('PUT');
      req.flush('Room not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete a room successfully (AAA)', () => {
      // Arrange: Preparar ID de sala a eliminar
      const roomId = '1';

      // Act: Llamar al método delete
      service.delete(roomId).subscribe((response) => {
        // Assert: Verificar que se completó la eliminación (void puede ser null o undefined)
        expect(response).toBeNull();
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent room (AAA)', () => {
      // Arrange: Preparar ID inexistente
      const roomId = 'non-existent';

      // Act: Llamar al método delete
      service.delete(roomId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert: Verificar el error
          expect(error.status).toBe(404);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Room not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle conflict when deleting room in use (AAA)', () => {
      // Arrange: Preparar ID de sala en uso
      const roomId = '1';

      // Act: Llamar al método delete
      service.delete(roomId).subscribe({
        next: () => fail('should have failed with 409 error'),
        error: (error) => {
          // Assert: Verificar el error de conflicto
          expect(error.status).toBe(409);
        },
      });

      // Assert: Verificar la solicitud HTTP y error
      const req = httpMock.expectOne(`${apiUrl}/${roomId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Room is in use', { status: 409, statusText: 'Conflict' });
    });
  });
});
