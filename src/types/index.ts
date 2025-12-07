export interface Performance {
  id?: string;
  points: number;
  assists: number;
  rebounds: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  minutes_played?: number;
  field_goal_pct?: number;
  three_point_pct?: number;
  free_throw_pct?: number;
  efficiency_rating?: number;
  overall_score: number;
  performance_date: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  nationality: string;
  image_url?: string;
  is_active: boolean;
  notes?: string;
  performances?: Performance[];
}

export interface PlayerFormData {
  name: string;
  position: string;
  age: string;
  height_cm: string;
  weight_kg: string;
  nationality: string;
  image_url: string;
  notes: string;
}

export interface Turf {
  id: string;
  name: string;
  location: string;
  description?: string;
  price_per_hour: number;
  images?: string[];
  amenities?: string[];
  is_active?: boolean;
  operating_hours?: Record<string, unknown>;
  slot_minutes?: number;
  open_time?: string;
  close_time?: string;
  currency?: string;
  timezone?: string;
  sport_type?: string;
  surface_type?: string;
  capacity?: number;
  buffer_minutes?: number;
  lead_time_minutes?: number;
  bookable_days_ahead?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'url' | 'email' | 'textarea';
  placeholder?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
}
