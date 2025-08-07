import { conf } from "@/utils/setup/config";

export interface TmdbMovie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface ListMetadata {
  originalFilmCount: number;
  foundTmdbMovies: number;
  expectedItemCount: number | null;
  workingSelector: string;
}

export interface LetterboxdList {
  listName: string;
  listUrl: string;
  tmdbMovies: TmdbMovie[];
  metadata: ListMetadata;
}

export interface LetterboxdResponse {
  lists: LetterboxdList[];
}

// Base function to fetch from Letterboxd API
async function fetchFromLetterboxd<T = LetterboxdResponse>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(`${conf().BACKEND_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

// Get Letterboxd lists with TMDB movie information
export const getLetterboxdLists = () => fetchFromLetterboxd("/letterboxd");
