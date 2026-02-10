import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css',
})
export class MovieList {
  private movieService = inject(MovieService);

  movies: Movie[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading = true;
    this.movieService.getAll().subscribe({
      next: (data) => {
        this.movies = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error to load movies';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  deleteMovie(id: string): void {
    Swal.fire({
      title: '¿Eliminar película?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      // 🔄 Loading
      Swal.fire({
        title: 'Eliminando película...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.movieService.delete(id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Película eliminada',
            text: 'La película fue eliminada correctamente',
            timer: 1500,
            showConfirmButton: false,
          });
          this.loadMovies();
        },
        error: (error) => {
          console.error(error);

          // ❌ Excepción controlada (película en uso)
          Swal.fire({
            icon: 'error',
            title: 'No se puede eliminar',
            text:
              error?.error?.message ||
              'La película no puede eliminarse porque está siendo utilizada en uno o más showtimes',
          });
        },
      });
    });
  }
}
