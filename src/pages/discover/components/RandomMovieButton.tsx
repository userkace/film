import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { get } from "@/backend/metadata/tmdb";
import { Movie } from "@/pages/discover/common";
import { conf } from "@/setup/config";
import { useLanguageStore } from "@/stores/language";
import { getTmdbLanguageCode } from "@/utils/language";

interface TMDBMovieResponse {
  results: Movie[];
}

export function RandomMovieButton() {
  const [randomMovie, setRandomMovie] = useState<Movie | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTimeout, setCountdownTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const userLanguage = useLanguageStore((s) => s.language);
  const formattedLanguage = getTmdbLanguageCode(userLanguage);

  // Fetch popular movies for random selection
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await get<TMDBMovieResponse>("/movie/popular", {
          api_key: conf().TMDB_READ_API_KEY,
          language: formattedLanguage,
          page: 2,
        });
        setMovies(data.results);
      } catch (error) {
        console.error("Error fetching popular movies:", error);
      }
    };

    fetchMovies();
  }, [formattedLanguage]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : prev));
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [countdown]);

  const handleRandomMovieClick = () => {
    if (movies.length === 0) return;

    const uniqueTitles = new Set(movies.map((movie) => movie.title));
    const uniqueTitlesArray = Array.from(uniqueTitles);
    const randomIndex = Math.floor(Math.random() * uniqueTitlesArray.length);
    const selectedMovie = movies.find(
      (movie) => movie.title === uniqueTitlesArray[randomIndex],
    );

    if (selectedMovie) {
      if (countdown !== null && countdown > 0) {
        setCountdown(null);
        if (countdownTimeout) {
          clearTimeout(countdownTimeout);
          setCountdownTimeout(null);
          setRandomMovie(null);
        }
      } else {
        setRandomMovie(selectedMovie);
        setCountdown(5);
        const timeoutId = setTimeout(() => {
          navigate(`/media/tmdb-movie-${selectedMovie.id}-random`);
        }, 5000);
        setCountdownTimeout(timeoutId);
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      <button
        type="button"
        className={`
          relative flex items-center overflow-hidden
          rounded-full text-white h-10
          bg-pill-background bg-opacity-50 hover:bg-pill-backgroundHover
          transition-all duration-300 ease-in-out
          ${countdown !== null && countdown > 0 ? "min-w-[10px] pl-3" : "w-10"}
        `}
        onClick={handleRandomMovieClick}
      >
        {/* Title container that slides in */}
        <div
          className={`
            relative whitespace-nowrap
            transition-all duration-300 ease-in-out
            ${countdown !== null && countdown > 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
          `}
        >
          {countdown !== null && countdown > 0 && (
            <span className="font-bold">{randomMovie?.title}</span>
          )}
        </div>

        {/* Icon container that stays fixed on the right */}
        <div className="ml-auto flex items-center justify-center w-10 h-10">
          {countdown !== null && countdown > 0 ? (
            <div className="animate-[pulse_1s_ease-in-out_infinite] text-lg font-bold">
              {countdown}
            </div>
          ) : (
            <img
              src="/lightbar-images/dice.svg"
              alt="Dice"
              className="w-6 h-6"
            />
          )}
        </div>
      </button>
    </div>
  );
}
