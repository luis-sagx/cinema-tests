import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-room-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
})
export class RoomList {
  private roomService = inject(RoomService);

  rooms: Room[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error to load rooms';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  deleteRoom(id: string): void {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.delete(id).subscribe({
        next: () => {
          this.loadRooms();
        },
        error: (error) => {
          this.errorMessage =
            'The room cannot be deleted because it is being used in one or more showtimes';
          console.error(error);
        },
      });
    }
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      '2D': 'bg-cyan-neon/20 text-cyan-neon border-cyan-neon font-semibold ',
      '3D': 'bg-purple-neon/20 text-purple-neon border-purple-neon font-semibold',
      VIP: 'bg-gold/20 text-gold-light border-gold-light font-semibold',
    };
    return classes[type] || '';
  }
}
