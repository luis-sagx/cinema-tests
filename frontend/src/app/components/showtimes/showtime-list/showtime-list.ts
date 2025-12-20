import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShowtimeService } from '../../../services/showtime.service';
import { Showtime } from '../../../models/showtime.model';

@Component({
  selector: 'app-showtime-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './showtime-list.html',
  styleUrl: './showtime-list.css',
})
export class ShowtimeList {
  private showtimeService = inject(ShowtimeService);

  showtimes: Showtime[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadShowtimes();
  }

  loadShowtimes(): void {
    this.isLoading = true;
    this.showtimeService.getAll().subscribe({
      next: (data) => {
        this.showtimes = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las funciones';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  deleteShowtime(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta función?')) {
      this.showtimeService.delete(id).subscribe({
        next: () => {
          this.loadShowtimes();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la función';
          console.error(error);
        },
      });
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getMovieTitle(showtime: Showtime): string {
    if (typeof showtime.movie_id === 'object' && showtime.movie_id?.title) {
      return showtime.movie_id.title;
    }
    return 'Película no disponible';
  }

  getRoomName(showtime: Showtime): string {
    if (typeof showtime.room_id === 'object' && showtime.room_id?.name) {
      return showtime.room_id.name;
    }
    return 'Sala no disponible';
  }
}
