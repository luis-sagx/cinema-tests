import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Showtime } from '../models/showtime.model';

@Injectable({
  providedIn: 'root',
})
export class ShowtimeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/showtimes';

  getAll(): Observable<Showtime[]> {
    return this.http.get<Showtime[]>(this.apiUrl);
  }

  getById(id: string): Observable<Showtime> {
    return this.http.get<Showtime>(`${this.apiUrl}/${id}`);
  }

  create(showtime: Showtime): Observable<Showtime> {
    return this.http.post<Showtime>(this.apiUrl, showtime);
  }

  update(id: string, showtime: Showtime): Observable<Showtime> {
    return this.http.put<Showtime>(`${this.apiUrl}/${id}`, showtime);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
