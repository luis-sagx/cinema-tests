export interface Room {
  _id?: string;
  name: string;
  capacity: number;
  type: '2D' | '3D' | 'VIP';
}
