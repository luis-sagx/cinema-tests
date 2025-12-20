import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';

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
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movieService.delete(id).subscribe({
        next: () => {
          this.loadMovies();
        },
        error: (error) => {
          this.errorMessage =
            'The movie cannot be deleted because it is being used in one or more showtimes';
          console.error(error);
        },
      });
    }
  }
}
