import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomForm } from './room-form';
import { RoomService } from '../../../services/room.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('RoomForm', () => {
  let component: RoomForm;
  let fixture: ComponentFixture<RoomForm>;
  let roomService: jasmine.SpyObj<RoomService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const roomServiceSpy = jasmine.createSpyObj('RoomService', ['getById', 'create', 'update']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [RoomForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    roomService = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(RoomForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize roomForm with empty values', () => {
    expect(component.roomForm).toBeDefined();
    expect(component.roomForm.get('name')?.value).toBe('');
    expect(component.roomForm.get('capacity')?.value).toBeNull();
    expect(component.roomForm.get('type')?.value).toBe('');
  });

  it('should have roomTypes array with valid types', () => {
    expect(component.roomTypes).toEqual(['2D', '3D', 'VIP']);
    expect(component.roomTypes.length).toBe(3);
  });

  it('should validate capacity as required and minimum value', () => {
    const capacityControl = component.roomForm.get('capacity');
    
    capacityControl?.setValue(null);
    expect(capacityControl?.hasError('required')).toBeTrue();
    
    capacityControl?.setValue(0);
    expect(capacityControl?.hasError('min')).toBeTrue();
    
    capacityControl?.setValue(100);
    expect(capacityControl?.valid).toBeTrue();
  });

  it('should create room and navigate on successful submission', () => {
    roomService.create.and.returnValue(of({ _id: '1', name: 'Room A', capacity: 100, type: '2D' }));
    
    component.roomForm.setValue({
      name: 'Room A',
      capacity: 100,
      type: '2D'
    });
    
    component.onSubmit();
    
    expect(roomService.create).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/rooms']);
  });

  it('should set errorMessage on submission failure', () => {
    const errorResponse = { error: { message: 'Failed to create room' } };
    roomService.create.and.returnValue(throwError(() => errorResponse));
    
    component.roomForm.setValue({
      name: 'Room A',
      capacity: 100,
      type: '2D'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Failed to create room');
    expect(component.isLoading).toBeFalse();
  });
});
