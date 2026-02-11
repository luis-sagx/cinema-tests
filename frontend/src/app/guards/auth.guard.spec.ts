import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    // Arrange: Create spies for dependencies
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('should allow activation when user is authenticated (AAA)', () => {
    // Arrange: User is authenticated
    authService.isAuthenticated.and.returnValue(true);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert: Guard allows navigation
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated (AAA)', () => {
    // Arrange: User is not authenticated
    authService.isAuthenticated.and.returnValue(false);

    // Act: Execute guard
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert: Guard blocks navigation and redirects
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call isAuthenticated to check auth status (AAA)', () => {
    // Arrange: Setup auth service
    authService.isAuthenticated.and.returnValue(true);

    // Act: Execute guard
    TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert: Verify authentication check was performed
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should not redirect when authenticated (AAA)', () => {
    // Arrange: User is authenticated
    authService.isAuthenticated.and.returnValue(true);

    // Act: Execute guard
    TestBed.runInInjectionContext(() => authGuard(route, state));

    // Assert: No redirect occurs
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
