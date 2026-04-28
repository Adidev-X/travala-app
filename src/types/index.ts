export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface Destination {
  id: string;
  name: string;
  trips: number;
  isLive: boolean;
  image: string;
}

export interface HotDestination {
  id: string;
  name: string;
  trips: number;
  tag: string;
  size: 'portrait' | 'square' | 'horizontal';
  image: string;
}

export interface Trip {
  id: string;
  dest: string;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  type: string;
  price: string;
  image: string;
}

export interface Category {
  id: string;
  label: string;
}
