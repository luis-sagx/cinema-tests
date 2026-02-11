import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty values', () => {
    // Assert
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email as required', () => {
    // Arrange
    const emailControl = component.loginForm.get('email');

    // Act
    emailControl?.setValue('');

    // Assert
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();
  });

  it('should validate password as required', () => {
    // Arrange
    const passwordControl = component.loginForm.get('password');

    // Act
    passwordControl?.setValue('');

    // Assert
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTrue();
  });

  it('should call authService.login and navigate on successful login', () => {
    authService.login.and.returnValue(
      of({ token: 'fake-token', user: { name: 'Test User', email: 'test@example.com' } }),
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading).toBeFalse();
  });

  it('should set errorMessage on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });

  it('should set default error message when no specific error message provided', () => {
    authService.login.and.returnValue(throwError(() => ({ error: {} })));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error to login');
  });

  it('should not call authService.login if form is invalid', () => {
    component.loginForm.setValue({
      email: 'invalid-email',
      password: '123',
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should return email control', () => {
    expect(component.email).toBe(component.loginForm.get('email'));
  });

  it('should return password control', () => {
    expect(component.password).toBe(component.loginForm.get('password'));
  });
});
