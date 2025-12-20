import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./components/movies/movie-list/movie-list').then((m) => m.MovieList),
      },
      {
        path: 'movies/create',
        loadComponent: () =>
          import('./components/movies/movie-form/movie-form').then((m) => m.MovieForm),
      },
      {
        path: 'movies/edit/:id',
        loadComponent: () =>
          import('./components/movies/movie-form/movie-form').then((m) => m.MovieForm),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./components/rooms/room-list/room-list').then((m) => m.RoomList),
      },
      {
        path: 'rooms/create',
        loadComponent: () =>
          import('./components/rooms/room-form/room-form').then((m) => m.RoomForm),
      },
      {
        path: 'rooms/edit/:id',
        loadComponent: () =>
          import('./components/rooms/room-form/room-form').then((m) => m.RoomForm),
      },
      {
        path: 'showtimes',
        loadComponent: () =>
          import('./components/showtimes/showtime-list/showtime-list').then((m) => m.ShowtimeList),
      },
      {
        path: 'showtimes/create',
        loadComponent: () =>
          import('./components/showtimes/showtime-form/showtime-form').then((m) => m.ShowtimeForm),
      },
      {
        path: 'showtimes/edit/:id',
        loadComponent: () =>
          import('./components/showtimes/showtime-form/showtime-form').then((m) => m.ShowtimeForm),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
