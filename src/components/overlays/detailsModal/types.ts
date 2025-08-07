import { ShowProgressResult } from "@/stores/progress/utils";

export interface DetailsContent {
  title: string;
  overview?: string;
  backdrop?: string;
  posterUrl?: string;
  runtime?: number | null;
  genres?: Array<{ id: number; name: string }>;
  language?: string;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string;
  rating?: string;
  director?: string;
  actors?: string[];
  type?: "movie" | "show";
  id?: number;
  episodes?: number;
  seasons?: number;
  imdbId?: string;
  episode?: {
    id: number;
    number: number;
  };
  seasonData?: {
    seasons: Array<{
      id: number;
      season_number: number;
      name: string;
      episode_count: number;
      overview: string;
      air_date: string;
      poster_path: string | null;
    }>;
    episodes: Array<{
      id: number;
      name: string;
      overview: string;
      episode_number: number;
      season_number: number;
      still_path: string | null;
      air_date: string;
      vote_average: number;
      vote_count: number;
    }>;
  };
  logoUrl?: string;
}

export interface DetailsModalProps {
  id: string;
  data?: {
    id: number;
    type: "movie" | "show";
  };
  minimal?: boolean;
}

export interface DetailsContentProps {
  data: DetailsContent;
  minimal?: boolean;
}

export interface TrailerOverlayProps {
  trailerUrl: string;
  onClose: () => void;
}

export interface EpisodeCarouselProps {
  episodes: Array<{
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    air_date: string;
    vote_average: number;
    vote_count: number;
  }>;
  showProgress?: {
    episode?: {
      id: string;
    };
  } | null;
  progress: Record<string, any>;
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  seasons: Array<{
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    overview: string;
    air_date: string;
    poster_path: string | null;
  }>;
  mediaId?: number;
  mediaTitle?: string;
  mediaPosterUrl?: string;
}

export interface DetailsBodyProps {
  data: DetailsContent;
  onPlayClick: () => void;
  onTrailerClick: () => void;
  onShareClick: () => void;
  showProgress: ShowProgressResult | null;
  voteAverage?: number;
  voteCount?: number;
  releaseDate?: string;
  seasons?: number;
  imdbData?: {
    rating: number;
    votes: number;
    trailer_url?: string;
  };
}

export interface DetailsInfoProps {
  data: DetailsContent;
  imdbData?: any;
  rtData?: any;
  provider?: string;
}

export interface DetailsRatingsProps {
  voteAverage?: number;
  voteCount?: number;
  imdbData?: any;
  rtData?: any;
  mediaId?: number;
  mediaType?: "movie" | "show";
  imdbId?: string;
  provider?: string;
}
