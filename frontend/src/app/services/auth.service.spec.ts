import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment.development';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    _id: '123',
    name: 'testuser',
    email: 'test@test.com',
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(() => {
    // Arrange: Configurar el espía del router
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Arrange: Configurar el TestBed
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    // Arrange: Inyectar servicios y mocks
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Arrange: Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    // Assert: Verificar que no hay solicitudes HTTP pendientes
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    // Assert: El servicio debe ser creado
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully (AAA)', () => {
      // Arrange: Preparar datos de registro
      const registerData: RegisterRequest = {
        name: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      };

      // Act: Llamar al método register
      service.register(registerData).subscribe((response) => {
        // Assert: Verificar la respuesta
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${environment.apiUrl}/users/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });

    it('should update currentUser$ observable after registration (AAA)', (done) => {
      // Arrange: Preparar datos de registro
      const registerData: RegisterRequest = {
        name: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      };

      // Act: Suscribirse al observable y registrar usuario
      service.currentUser$.subscribe((user) => {
        if (user) {
          // Assert: Verificar que el observable se actualizó
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.register(registerData).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/users/register`);
      req.flush(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login user successfully (AAA)', () => {
      // Arrange: Preparar credenciales de login
      const loginData: LoginRequest = {
        email: 'test@test.com',
        password: 'password123',
      };

      // Act: Llamar al método login
      service.login(loginData).subscribe((response) => {
        // Assert: Verificar la respuesta y el almacenamiento
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      // Assert: Verificar la solicitud HTTP
      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockAuthResponse);
    });

    it('should update currentUser$ observable after login (AAA)', (done) => {
      // Arrange: Preparar credenciales de login
      const loginData: LoginRequest = {
        email: 'test@test.com',
        password: 'password123',
      };

      // Act: Suscribirse al observable y hacer login
      service.currentUser$.subscribe((user) => {
        if (user) {
          // Assert: Verificar que el observable se actualizó
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.login(loginData).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear user data and navigate to login (AAA)', () => {
      // Arrange: Configurar usuario autenticado
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Act: Llamar al método logout
      service.logout();

      // Assert: Verificar que se limpió el almacenamiento y se navegó
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear currentUser$ observable on logout (AAA)', (done) => {
      // Arrange: Configurar usuario autenticado
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      // Act: Hacer logout y verificar observable
      let callCount = 0;
      service.currentUser$.subscribe((user) => {
        callCount++;
        if (callCount === 2) {
          // Assert: Verificar que el observable se limpió (segunda emisión)
          expect(user).toBeNull();
          done();
        }
      });

      service.logout();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage (AAA)', () => {
      // Arrange: Configurar token en localStorage
      const testToken = 'test-token-123';
      localStorage.setItem('token', testToken);

      // Act: Obtener el token
      const token = service.getToken();

      // Assert: Verificar que se obtuvo el token correcto
      expect(token).toBe(testToken);
    });

    it('should return null when no token exists (AAA)', () => {
      // Arrange: No hay token en localStorage (ya limpiado en beforeEach)

      // Act: Intentar obtener el token
      const token = service.getToken();

      // Assert: Verificar que retorna null
      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists (AAA)', () => {
      // Arrange: Configurar token en localStorage
      localStorage.setItem('token', 'test-token');

      // Act: Verificar autenticación
      const isAuth = service.isAuthenticated();

      // Assert: Verificar que está autenticado
      expect(isAuth).toBe(true);
    });

    it('should return false when no token exists (AAA)', () => {
      // Arrange: No hay token en localStorage (ya limpiado en beforeEach)

      // Act: Verificar autenticación
      const isAuth = service.isAuthenticated();

      // Assert: Verificar que no está autenticado
      expect(isAuth).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from BehaviorSubject (AAA)', () => {
      // Arrange: Configurar usuario en el BehaviorSubject
      service['currentUserSubject'].next(mockUser);

      // Act: Obtener el usuario actual
      const currentUser = service.getCurrentUser();

      // Assert: Verificar que se obtuvo el usuario correcto
      expect(currentUser).toEqual(mockUser);
    });

    it('should return null when no user is logged in (AAA)', () => {
      // Arrange: No hay usuario en el BehaviorSubject (ya null en beforeEach)

      // Act: Obtener el usuario actual
      const currentUser = service.getCurrentUser();

      // Assert: Verificar que retorna null
      expect(currentUser).toBeNull();
    });
  });

  describe('getUserFromStorage', () => {
    it('should retrieve user from localStorage on service initialization (AAA)', () => {
      // Arrange: Configurar usuario en localStorage antes de inicializar el servicio
      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Act: Crear un nuevo TestBed con el usuario en localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: router },
        ],
      });
      const newService = TestBed.inject(AuthService);

      // Assert: Verificar que el usuario se cargó desde localStorage
      expect(newService.getCurrentUser()).toEqual(mockUser);
      localStorage.clear();
    });

    it('should return null when no user in localStorage (AAA)', () => {
      // Arrange: localStorage está limpio (ya limpiado en beforeEach)

      // Act: El servicio ya está inicializado, verificar estado inicial
      const currentUser = service.getCurrentUser();

      // Assert: Verificar que no hay usuario
      expect(currentUser).toBeNull();
    });
  });
});
