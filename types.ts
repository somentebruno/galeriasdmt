export enum ViewState {
  PHOTOS = 'photos',
  EXPLORE = 'explore',
  PLACES = 'places',
  SHARING = 'sharing',
  ALBUMS = 'albums',
  UTILITIES = 'utilities',
  ARCHIVE = 'archive',
  TRASH = 'trash',
  HYBRID_GALLERY = 'hybrid_gallery'
}

export interface Photo {
  id: string;
  src: string;
  alt: string;
  date?: string;
  location?: string;
  title?: string;
  subtitle?: string; // For memories or descriptions
  aspect?: 'wide' | 'tall' | 'square' | 'video';
  views?: number; // Simulated stat
  storage_path?: string;
  media_type?: 'image' | 'video';
  video_id?: string;
  taken_at?: string;
  latitude?: number;
  longitude?: number;
}

export interface Memory {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

export interface Cluster {
  id: string;
  lat: string; // CSS top %
  lng: string; // CSS left %
  count: number;
  thumbnail: string;
  locationName: string;
}