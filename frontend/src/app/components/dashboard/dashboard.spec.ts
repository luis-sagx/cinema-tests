import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of({ _id: '1', email: 'test@test.com', name: 'Test User' })
    });

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have authService injected', () => {
    expect(component.authService).toBeDefined();
    expect(component.authService).toBe(authService);
  });

  it('should have currentUser$ observable from authService', () => {
    expect(component.currentUser$).toBeDefined();
    component.currentUser$.subscribe(user => {
      expect(user).toEqual({ _id: '1', email: 'test@test.com', name: 'Test User' });
    });
  });

  it('should call authService.logout when logout is called', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should call logout method only once per invocation', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalledTimes(1);
    
    component.logout();
    expect(authService.logout).toHaveBeenCalledTimes(2);
  });
});
