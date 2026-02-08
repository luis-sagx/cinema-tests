import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  create(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  update(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
