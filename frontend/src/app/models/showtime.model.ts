export interface Showtime {
  _id?: string;
  movie_id: string | { _id: string; title: string };
  room_id: string | { _id: string; name: string };
  start_time: string | Date;
  end_time: string | Date;
  user_id?: string;
}
