import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize registerForm with empty values', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should validate name as required', () => {
    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBeTrue();
  });

  it('should validate email as required', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();
  });

  it('should validate password as required', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTrue();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('ab');
    expect(nameControl?.hasError('minlength')).toBeTrue();
  });

  it('should call authService.register and navigate on successful registration', () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.register.and.returnValue(
      of({ token: 'fake-token', user: { name: 'John Doe', email: 'john@example.com' } }),
    );

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    expect(component.isLoading).toBeFalse();
  });

  it('should set errorMessage on registration failure', () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    const errorResponse = { error: { message: 'Email already exists' } };
    authService.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Email already exists');
    expect(component.isLoading).toBeFalse();
  });

  it('should set default error message when no specific error message provided', () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.register.and.returnValue(throwError(() => ({ error: {} })));

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al registrarse');
  });

  it('should not call authService.register if form is invalid', () => {
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    component.registerForm.setValue({
      name: 'ab',
      email: 'invalid-email',
      password: '123',
    });

    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should return name control', () => {
    expect(component.name).toBe(component.registerForm.get('name'));
  });

  it('should return email control', () => {
    expect(component.email).toBe(component.registerForm.get('email'));
  });

  it('should return password control', () => {
    expect(component.password).toBe(component.registerForm.get('password'));
  });
});
