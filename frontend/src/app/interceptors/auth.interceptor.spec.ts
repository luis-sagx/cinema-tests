import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let mockHandler: HttpHandlerFn;
  let mockRequest: HttpRequest<string>;

  beforeEach(() => {
    // Arrange: Create spy for AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Mock HTTP handler
    mockHandler = jasmine
      .createSpy<HttpHandlerFn>('HttpHandlerFn')
      .and.returnValue(of({} as HttpEvent<string>));

    // Mock HTTP request
    mockRequest = new HttpRequest('GET', '/api/movies');
  });

  it('should add Authorization header when token exists (AAA)', () => {
    // Arrange: User has valid token
    const mockToken = 'test-token-123';
    authService.getToken.and.returnValue(mockToken);

    // Act: Execute interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify handler was called with cloned request containing token
    expect(mockHandler).toHaveBeenCalled();
    const interceptedRequest = (mockHandler as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<string>;
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('should not modify request when token does not exist (AAA)', () => {
    // Arrange: User has no token
    authService.getToken.and.returnValue(null);

    // Act: Execute interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify handler was called with original request
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
    const interceptedRequest = (mockHandler as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<string>;
    expect(interceptedRequest.headers.has('Authorization')).toBeFalse();
  });

  it('should call getToken to retrieve authentication token (AAA)', () => {
    // Arrange: Setup token retrieval
    authService.getToken.and.returnValue('some-token');

    // Act: Execute interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify token was retrieved
    expect(authService.getToken).toHaveBeenCalled();
  });

  it('should clone request with Authorization header (AAA)', () => {
    // Arrange: User has token
    const expectedToken = 'Bearer my-secret-token';
    authService.getToken.and.returnValue('my-secret-token');

    // Act: Execute interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify cloned request has correct Authorization header
    const interceptedRequest = (mockHandler as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<string>;
    expect(interceptedRequest.headers.get('Authorization')).toBe(expectedToken);
    expect(interceptedRequest.url).toBe(mockRequest.url);
  });

  it('should pass through request when token is empty string (AAA)', () => {
    // Arrange: Token is empty string
    authService.getToken.and.returnValue('');

    // Act: Execute interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify original request is passed
    const interceptedRequest = (mockHandler as jasmine.Spy).calls.mostRecent()
      .args[0] as HttpRequest<string>;
    expect(interceptedRequest).toBe(mockRequest);
  });

  it('should return observable from handler (AAA)', () => {
    // Arrange: Setup handler to return observable
    const mockEvent = {} as HttpEvent<string>;
    mockHandler = jasmine.createSpy<HttpHandlerFn>('HttpHandlerFn').and.returnValue(of(mockEvent));
    authService.getToken.and.returnValue('token');

    // Act: Execute interceptor
    const result = TestBed.runInInjectionContext(() => {
      return authInterceptor(mockRequest, mockHandler);
    });

    // Assert: Verify observable is returned
    result.subscribe((event) => {
      expect(event).toBe(mockEvent);
    });
  });
});
