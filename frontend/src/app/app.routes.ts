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
  },
  //     children: [
  //       {
  //         path: '',
  //         redirectTo: 'movies',
  //         pathMatch: 'full',
  //       },
  //  {
  //     path: 'movies',
  //     loadComponent: () =>
  //       import('./components/movies/movie-list/movie-list.component').then(
  //         (m) => m.MovieListComponent
  //       ),
  //   },
  //   {
  //     path: 'movies/create',
  //     loadComponent: () =>
  //       import('./components/movies/movie-form/movie-form.component').then(
  //         (m) => m.MovieFormComponent
  //       ),
  //   },
  //   {
  //     path: 'movies/edit/:id',
  //     loadComponent: () =>
  //       import('./components/movies/movie-form/movie-form.component').then(
  //         (m) => m.MovieFormComponent
  //       ),
  //   },
  //   {
  //     path: 'rooms',
  //     loadComponent: () =>
  //       import('./components/rooms/room-list/room-list.component').then(
  //         (m) => m.RoomListComponent
  //       ),
  //   },
  //   {
  //     path: 'rooms/create',
  //     loadComponent: () =>
  //       import('./components/rooms/room-form/room-form.component').then(
  //         (m) => m.RoomFormComponent
  //       ),
  //   },
  //   {
  //     path: 'rooms/edit/:id',
  //     loadComponent: () =>
  //       import('./components/rooms/room-form/room-form.component').then(
  //         (m) => m.RoomFormComponent
  //       ),
  //   },
  //   {
  //     path: 'showtimes',
  //     loadComponent: () =>
  //       import('./components/showtimes/showtime-list/showtime-list.component').then(
  //         (m) => m.ShowtimeListComponent
  //       ),
  //   },
  //   {
  //     path: 'showtimes/create',
  //     loadComponent: () =>
  //       import('./components/showtimes/showtime-form/showtime-form.component').then(
  //         (m) => m.ShowtimeFormComponent
  //       ),
  //   },
  //   {
  //     path: 'showtimes/edit/:id',
  //     loadComponent: () =>
  //       import('./components/showtimes/showtime-form/showtime-form.component').then(
  //         (m) => m.ShowtimeFormComponent
  //       ),
  //   },
  //     ],
  // },
  {
    path: '**',
    redirectTo: 'login',
  },
];
