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
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [RoomForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: RoomService, useValue: roomServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

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
      type: '2D',
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
      type: '2D',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Failed to create room');
    expect(component.isLoading).toBeFalse();
  });

  // AAA: Edit mode tests
  it('should enter edit mode when roomId is provided in route', () => {
    // Arrange: Create a new component with roomId in route
    const activatedRouteWithId = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('456'),
        },
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RoomForm],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: RoomService, useValue: roomService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRouteWithId },
      ],
    });

    roomService.getById.and.returnValue(
      of({
        _id: '456',
        name: 'Room B',
        capacity: 150,
        type: '3D' as const,
      }),
    );

    const newFixture = TestBed.createComponent(RoomForm);
    const newComponent = newFixture.componentInstance;

    // Act: Initialize component
    newComponent.ngOnInit();

    // Assert: Verify edit mode is activated
    expect(newComponent.isEditMode).toBeTrue();
    expect(newComponent.roomId).toBe('456');
  });

  it('should load room data in edit mode', (done) => {
    // Arrange: Setup component in edit mode
    component.roomId = '456';
    component.isEditMode = true;
    const mockRoom = {
      _id: '456',
      name: 'VIP Room',
      capacity: 50,
      type: 'VIP' as const,
    };
    roomService.getById.and.returnValue(of(mockRoom));

    // Act: Load room data
    component.loadRoom();

    // Assert: Verify form is populated with room data
    setTimeout(() => {
      expect(roomService.getById).toHaveBeenCalledWith('456');
      expect(component.roomForm.get('name')?.value).toBe('VIP Room');
      expect(component.roomForm.get('capacity')?.value).toBe(50);
      expect(component.roomForm.get('type')?.value).toBe('VIP');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should handle error when loading room fails', (done) => {
    // Arrange: Setup component and error response
    component.roomId = '456';
    component.isEditMode = true;
    const errorResponse = { error: { message: 'Room not found' } };
    roomService.getById.and.returnValue(throwError(() => errorResponse));

    // Act: Attempt to load room
    component.loadRoom();

    // Assert: Verify error is handled
    setTimeout(() => {
      expect(component.errorMessage).toBe('Error to load movie');
      expect(component.isLoading).toBeFalse();
      done();
    }, 100);
  });

  it('should update room in edit mode', () => {
    // Arrange: Setup edit mode and form data
    component.isEditMode = true;
    component.roomId = '456';
    roomService.update.and.returnValue(
      of({
        _id: '456',
        name: 'Updated Room',
        capacity: 200,
        type: '3D' as const,
      }),
    );

    component.roomForm.setValue({
      name: 'Updated Room',
      capacity: 200,
      type: '3D',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify update was called and navigation occurred
    expect(roomService.update).toHaveBeenCalledWith('456', component.roomForm.value);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/rooms']);
  });

  it('should set errorMessage when update fails', () => {
    // Arrange: Setup edit mode and error response
    component.isEditMode = true;
    component.roomId = '456';
    const errorResponse = { error: { message: 'Update failed' } };
    roomService.update.and.returnValue(throwError(() => errorResponse));

    component.roomForm.setValue({
      name: 'Room C',
      capacity: 120,
      type: '2D',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe('Update failed');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to rooms list when cancel is clicked', () => {
    // Arrange: Component is ready

    // Act: Call cancel
    component.cancel();

    // Assert: Verify navigation occurred
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/rooms']);
  });

  it('should not submit if form is invalid', () => {
    // Arrange: Form with invalid data
    component.roomForm.setValue({
      name: '', // Invalid: required field
      capacity: 0, // Invalid: min value is 1
      type: '', // Invalid: required field
    });

    // Act: Attempt to submit
    component.onSubmit();

    // Assert: Verify no service call was made
    expect(roomService.create).not.toHaveBeenCalled();
    expect(roomService.update).not.toHaveBeenCalled();
  });

  it('should set default errorMessage when error has no message property', () => {
    // Arrange: Error without message property
    const errorResponse = { error: {} };
    roomService.create.and.returnValue(throwError(() => errorResponse));

    component.roomForm.setValue({
      name: 'Room D',
      capacity: 80,
      type: '2D',
    });

    // Act: Submit form
    component.onSubmit();

    // Assert: Verify default error message
    expect(component.errorMessage).toBe('Error to save room');
  });

  it('should validate name as required', () => {
    // Arrange: Get name control
    const nameControl = component.roomForm.get('name');

    // Act: Set empty value
    nameControl?.setValue('');

    // Assert: Verify validation error
    expect(nameControl?.hasError('required')).toBeTrue();

    // Act: Set valid value
    nameControl?.setValue('Room E');

    // Assert: Verify control is valid
    expect(nameControl?.valid).toBeTrue();
  });

  it('should validate type as required', () => {
    // Arrange: Get type control
    const typeControl = component.roomForm.get('type');

    // Act: Set empty value
    typeControl?.setValue('');

    // Assert: Verify validation error
    expect(typeControl?.hasError('required')).toBeTrue();

    // Act: Set valid value
    typeControl?.setValue('VIP');

    // Assert: Verify control is valid
    expect(typeControl?.valid).toBeTrue();
  });
});
