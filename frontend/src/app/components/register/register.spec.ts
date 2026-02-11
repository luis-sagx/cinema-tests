import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

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
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize registerForm with empty values', () => {
    // Assert
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should validate name as required', () => {
    // Arrange
    const nameControl = component.registerForm.get('name');

    // Act
    nameControl?.setValue('');

    // Assert
    expect(nameControl?.hasError('required')).toBeTrue();
  });

  it('should validate email as required', () => {
    // Arrange
    const emailControl = component.registerForm.get('email');

    // Act
    emailControl?.setValue('');

    // Assert
    expect(emailControl?.hasError('required')).toBeTrue();
  });
});
