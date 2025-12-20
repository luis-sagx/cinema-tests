export interface Movie {
  _id?: string;
  title: string;
  director: string;
  genre: string;
  duration: number;
  release_year: number | null;
  user_id?: string;
}
