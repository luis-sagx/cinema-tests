import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShowtimeService } from '../../../services/showtime.service';
import { Showtime } from '../../../models/showtime.model';
import Swal from 'sweetalert2';

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
        this.errorMessage = 'Error loading showtimes';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  deleteShowtime(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.showtimeService.delete(id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El showtime fue eliminado correctamente',
            timer: 1500,
            showConfirmButton: false,
          });
          this.loadShowtimes();
        },
        error: (error) => {
          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error?.error?.message ||
              'Ocurrió un problema al eliminar el showtime. Intenta nuevamente.',
          });
        },
      });
    });
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();

    // Crear fecha en formato local usando los componentes UTC
    const localDate = new Date(year, month, day);
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getMovieTitle(showtime: Showtime): string {
    if (typeof showtime.movie_id === 'object' && showtime.movie_id?.title) {
      return showtime.movie_id.title;
    }
    return 'Movie not available';
  }

  getRoomName(showtime: Showtime): string {
    if (typeof showtime.room_id === 'object' && showtime.room_id?.name) {
      return showtime.room_id.name;
    }
    return 'Room not available';
  }
}
