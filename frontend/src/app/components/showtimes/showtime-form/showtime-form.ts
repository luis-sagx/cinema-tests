import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ShowtimeService } from '../../../services/showtime.service';
import { MovieService } from '../../../services/movie.service';
import { RoomService } from '../../../services/room.service';
import { Showtime } from '../../../models/showtime.model';
import { Movie } from '../../../models/movie.model';
import { Room } from '../../../models/room.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-showtime-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './showtime-form.html',
  styleUrl: './showtime-form.css',
})
export class ShowtimeForm {
  private fb = inject(FormBuilder);
  private showtimeService = inject(ShowtimeService);
  private movieService = inject(MovieService);
  private roomService = inject(RoomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showtimeForm: FormGroup;
  isEditMode = false;
  showtimeId: string | null = null;
  isLoading = false;
  errorMessage = '';
  movies: Movie[] = [];
  rooms: Room[] = [];

  constructor() {
    this.showtimeForm = this.fb.group({
      movie_id: ['', [Validators.required]],
      room_id: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.showtimeId = this.route.snapshot.paramMap.get('id');
    if (this.showtimeId) {
      this.isEditMode = true;
    }
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      movies: this.movieService.getAll(),
      rooms: this.roomService.getAll(),
    }).subscribe({
      next: (data) => {
        this.movies = data.movies;
        this.rooms = data.rooms;
        if (this.showtimeId) {
          this.loadShowtime();
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  loadShowtime(): void {
    if (this.showtimeId) {
      this.showtimeService.getById(this.showtimeId).subscribe({
        next: (showtime) => {
          this.showtimeForm.patchValue({
            movie_id: showtime.movie_id,
            room_id: showtime.room_id,
            start_time: this.formatDateForInput(showtime.start_time),
            end_time: this.formatDateForInput(showtime.end_time),
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar la función';
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.showtimeForm.valid) {
      this.isLoading = true;

      // Crear fechas sin hora (solo fecha)
      const startDate = new Date(this.showtimeForm.value.start_time);
      const endDate = new Date(this.showtimeForm.value.end_time);

      const showtimeData: Showtime = {
        ...this.showtimeForm.value,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      const request =
        this.isEditMode && this.showtimeId
          ? this.showtimeService.update(this.showtimeId, showtimeData)
          : this.showtimeService.create(showtimeData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/dashboard/showtimes']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al guardar la función';
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/showtimes']);
  }
}
