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
        this.errorMessage = 'Error loading showtimes';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  deleteShowtime(id: string): void {
    if (confirm('Are you sure you want to delete this showtime?')) {
      this.showtimeService.delete(id).subscribe({
        next: () => {
          this.loadShowtimes();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting showtime';
          console.error(error);
        },
      });
    }
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
