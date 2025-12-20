import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-movie-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.css',
})
export class MovieForm {
  private fb = inject(FormBuilder);
  private movieService = inject(MovieService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  movieForm: FormGroup;
  isEditMode = false;
  movieId: string | null = null;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.movieForm = this.fb.group({
      title: ['', [Validators.required]],
      director: [''],
      genre: [''],
      duration: [null, [Validators.required, Validators.min(1)]],
      release_year: [null],
    });
  }

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id');
    if (this.movieId) {
      this.isEditMode = true;
      this.loadMovie();
    }
  }

  loadMovie(): void {
    if (this.movieId) {
      this.isLoading = true;
      this.movieService.getById(this.movieId).subscribe({
        next: (movie) => {
          this.movieForm.patchValue(movie);
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
    if (this.movieForm.valid) {
      this.isLoading = true;
      const movieData: Movie = this.movieForm.value;

      const request =
        this.isEditMode && this.movieId
          ? this.movieService.update(this.movieId, movieData)
          : this.movieService.create(movieData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/dashboard/movies']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error to save movie';
          this.isLoading = false;
          console.error(error);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/movies']);
  }
}
