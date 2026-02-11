import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomList } from './room-list';
import { RoomService } from '../../../services/room.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('RoomList', () => {
  let component: RoomList;
  let fixture: ComponentFixture<RoomList>;
  let roomService: jasmine.SpyObj<RoomService>;

  beforeEach(async () => {
    const roomServiceSpy = jasmine.createSpyObj('RoomService', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [RoomList],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: RoomService, useValue: roomServiceSpy },
      ],
    }).compileComponents();

    roomService = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;

    fixture = TestBed.createComponent(RoomList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty rooms array', () => {
    expect(component.rooms).toEqual([]);
    expect(component.rooms.length).toBe(0);
  });

  it('should load rooms on initialization', () => {
    const mockRooms = [
      { _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const },
      { _id: '2', name: 'Room 2', capacity: 50, type: '3D' as const },
    ];

    roomService.getAll.and.returnValue(of(mockRooms));

    component.ngOnInit();

    expect(roomService.getAll).toHaveBeenCalled();
    expect(component.rooms).toEqual(mockRooms);
    expect(component.isLoading).toBeFalse();
  });

  it('should return correct CSS class for room types', () => {
    expect(component.getTypeClass('2D')).toContain('bg-cyan-neon');
    expect(component.getTypeClass('3D')).toContain('bg-purple-neon');
    expect(component.getTypeClass('VIP')).toContain('bg-gold');
  });

  it('should delete room and reload list on successful deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockRooms = [{ _id: '1', name: 'Room 1', capacity: 100, type: '2D' as const }];

    roomService.delete.and.returnValue(of(undefined));
    roomService.getAll.and.returnValue(of(mockRooms));

    component.deleteRoom('1');

    expect(roomService.delete).toHaveBeenCalledWith('1');
    expect(roomService.getAll).toHaveBeenCalled();
  });

  it('should set errorMessage when loading rooms fails', () => {
    roomService.getAll.and.returnValue(throwError(() => new Error('Network error')));

    component.loadRooms();

    expect(component.errorMessage).toBe('Error to load rooms');
    expect(component.isLoading).toBeFalse();
  });

  // AAA: Additional deleteRoom tests
  it('should not delete room if user cancels confirmation', () => {
    // Arrange: Setup confirmation to return false
    spyOn(window, 'confirm').and.returnValue(false);

    // Act: Attempt to delete
    component.deleteRoom('1');

    // Assert: Verify no delete was called
    expect(roomService.delete).not.toHaveBeenCalled();
  });

  it('should handle error when delete fails', () => {
    // Arrange: Setup delete to fail
    spyOn(window, 'confirm').and.returnValue(true);
    const errorResponse = { error: { message: 'Room is in use' } };
    roomService.delete.and.returnValue(throwError(() => errorResponse));

    // Act: Delete room
    component.deleteRoom('1');

    // Assert: Verify error message is set
    expect(component.errorMessage).toBe(
      'The room cannot be deleted because it is being used in one or more showtimes',
    );
  });

  it('should return default class for unknown room type', () => {
    // Arrange & Act: Get class for unknown type
    const className = component.getTypeClass('Unknown' as '2D' | '3D' | 'VIP');

    // Assert: Verify default class is returned (empty string for unknown types)
    expect(className).toBe('');
  });
});
