import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create (AAA)', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize loginForm with empty values (AAA)', () => {
      // Assert
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have isLoading initially false (AAA)', () => {
      // Assert
      expect(component.isLoading).toBeFalse();
    });

    it('should have errorMessage initially empty (AAA)', () => {
      // Assert
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should validate email as required (AAA)', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('');

      // Assert
      expect(emailControl?.hasError('required')).toBeTrue();
      expect(emailControl?.valid).toBeFalse();
    });

    it('should validate email format (AAA)', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('invalid-email');

      // Assert
      expect(emailControl?.hasError('email')).toBeTrue();
      expect(emailControl?.valid).toBeFalse();
    });

    it('should accept valid email (AAA)', () => {
      // Arrange
      const emailControl = component.loginForm.get('email');

      // Act
      emailControl?.setValue('test@test.com');

      // Assert
      expect(emailControl?.valid).toBeTrue();
      expect(emailControl?.errors).toBeNull();
    });

    it('should validate password as required (AAA)', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('');

      // Assert
      expect(passwordControl?.hasError('required')).toBeTrue();
      expect(passwordControl?.valid).toBeFalse();
    });

    it('should validate password minimum length (AAA)', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('12345');

      // Assert
      expect(passwordControl?.hasError('minlength')).toBeTrue();
      expect(passwordControl?.valid).toBeFalse();
    });

    it('should accept valid password (AAA)', () => {
      // Arrange
      const passwordControl = component.loginForm.get('password');

      // Act
      passwordControl?.setValue('123456');

      // Assert
      expect(passwordControl?.valid).toBeTrue();
      expect(passwordControl?.errors).toBeNull();
    });

    it('should invalidate form when empty (AAA)', () => {
      // Assert
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should validate form when all fields valid (AAA)', () => {
      // Act
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456'
      });

      // Assert
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Getters', () => {
    it('should return email control (AAA)', () => {
      // Act
      const emailControl = component.email;

      // Assert
      expect(emailControl).toBe(component.loginForm.get('email'));
    });

    it('should return password control (AAA)', () => {
      // Act
      const passwordControl = component.password;

      // Assert
      expect(passwordControl).toBe(component.loginForm.get('password'));
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form invalid (AAA)', () => {
      // Arrange - form is invalid by default

      // Act
      component.onSubmit();

      // Assert
      expect(authService.login).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });

    it('should submit and navigate on success (AAA)', () => {
      // Arrange
      const mockResponse = {
        token: 'test-token',
        user: { _id: '1', name: 'Test', email: 'test@test.com' }
      };
      authService.login.and.returnValue(of(mockResponse));
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalse();
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: '123456'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.errorMessage).toBe('');
    });

    it('should set isLoading during submission (AAA)', () => {
      // Arrange
      authService.login.and.returnValue(of({
        token: 'test-token',
        user: { _id: '1', name: 'Test', email: 'test@test.com' }
      }));
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error with message (AAA)', () => {
      // Arrange
      const errorResponse = {
        error: { message: 'Invalid credentials' }
      };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.loginForm.setValue({
        email: 'test@test.com',
        password: 'wrong'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle error without message (AAA)', () => {
      // Arrange
      const errorResponse = { error: {} };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('Error to login');
      expect(component.isLoading).toBeFalse();
    });

    it('should clear error message on new submission (AAA)', () => {
      // Arrange
      component.errorMessage = 'Previous error';
      authService.login.and.returnValue(of({
        token: 'test-token',
        user: { _id: '1', name: 'Test', email: 'test@test.com' }
      }));
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('');
    });
  });
});
