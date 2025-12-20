import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-room-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-form.html',
  styleUrl: './room-form.css',
})
export class RoomForm {
  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  roomForm: FormGroup;
  isEditMode = false;
  roomId: string | null = null;
  isLoading = false;
  errorMessage = '';
  roomTypes = ['2D', '3D', 'VIP'];

  constructor() {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required]],
      capacity: [null, [Validators.required, Validators.min(1)]],
      type: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id');
    if (this.roomId) {
      this.isEditMode = true;
      this.loadRoom();
    }
  }

  loadRoom(): void {
    if (this.roomId) {
      this.isLoading = true;
      this.roomService.getById(this.roomId).subscribe({
        next: (room) => {
          this.roomForm.patchValue(room);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error to load movie';
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      this.isLoading = true;
      const roomData: Room = this.roomForm.value;

      const request =
        this.isEditMode && this.roomId
          ? this.roomService.update(this.roomId, roomData)
          : this.roomService.create(roomData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/dashboard/rooms']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error to save room';
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/rooms']);
  }
}
