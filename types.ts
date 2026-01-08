
export enum Vibe {
  History = 'History',
  Nature = 'Nature',
  Religion = 'Religion',
  Adventure = 'Adventure',
  Beach = 'Beach',
  Culture = 'Culture'
}

export enum Budget {
  Budget = 'Budget',
  Mid = 'Mid-Range',
  Luxury = 'Luxury'
}

export interface UserPreferences {
  vibe: Vibe;
  budget: Budget;
  duration: number;
  startingCity: string;
  month: string;
}

export interface ItineraryDay {
  day: number;
  location: string;
  activities: string[];
  food_recommendations: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  // Simulated Google Maps Platform Data
  rating: number;
  review_count: number;
  opening_hours: string;
  travel_time_from_prev?: string;
  distance_from_prev?: string;
  image_description: string;
}

export interface TripItinerary {
  id?: string;
  trip_title: string;
  total_estimated_cost: string;
  weather_forecast: string;
  itinerary: ItineraryDay[];
  travel_tips: string[];
  createdAt?: number;
  // Added for Search Grounding links as mandated
  grounding_sources?: {
    web?: {
      uri: string;
      title: string;
    }
  }[];
}

export interface ImageAnalysis {
  location_guess: string;
  description: string;
  similar_places_in_mh: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  favorites: string[];
  savedTrips: TripItinerary[];
}
