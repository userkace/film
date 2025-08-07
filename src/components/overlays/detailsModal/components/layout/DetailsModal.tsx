import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import {
  getMediaBackdrop,
  getMediaDetails,
  getMediaLogo,
  getMediaPoster,
} from "@/backend/metadata/tmdb";
import {
  TMDBContentTypes,
  TMDBMovieData,
  TMDBShowData,
} from "@/backend/metadata/types/tmdb";
import { IconPatch } from "@/components/buttons/IconPatch";
import { Icons } from "@/components/Icon";
import { Flare } from "@/components/utils/Flare";
import { useOverlayStack } from "@/stores/interface/overlayStack";

import { DetailsContent } from "./DetailsContent";
import { DetailsSkeleton } from "./DetailsSkeleton";
import { OverlayPortal } from "../../../OverlayDisplay";
import { DetailsModalProps } from "../../types";

export function DetailsModal({ id, data, minimal }: DetailsModalProps) {
  const { hideModal, isModalVisible, modalStack } = useOverlayStack();
  const [detailsData, setDetailsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const modalIndex = modalStack.indexOf(id);
  const zIndex = modalIndex >= 0 ? 1000 + modalIndex : 999;

  const hide = useCallback(() => hideModal(id), [hideModal, id]);
  const isShown = isModalVisible(id);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!data?.id || !data?.type) return;

      setIsLoading(true);
      try {
        const type =
          data.type === "movie" ? TMDBContentTypes.MOVIE : TMDBContentTypes.TV;
        const details = await getMediaDetails(data.id.toString(), type);
        const backdropUrl = getMediaBackdrop(details.backdrop_path);
        const logoUrl = await getMediaLogo(data.id.toString(), type);
        if (type === TMDBContentTypes.MOVIE) {
          const movieDetails = details as TMDBMovieData;
          const posterUrl = getMediaPoster(movieDetails.poster_path);
          setDetailsData({
            title: movieDetails.title,
            overview: movieDetails.overview,
            backdrop: backdropUrl,
            posterUrl,
            runtime: movieDetails.runtime,
            genres: movieDetails.genres,
            language: movieDetails.original_language,
            voteAverage: movieDetails.vote_average,
            voteCount: movieDetails.vote_count,
            releaseDate: movieDetails.release_date,
            rating: movieDetails.release_dates?.results?.find(
              (r) => r.iso_3166_1 === "US",
            )?.release_dates?.[0]?.certification,
            type: "movie",
            id: movieDetails.id,
            imdbId: movieDetails.external_ids?.imdb_id,
            logoUrl,
          });
        } else {
          const showDetails = details as TMDBShowData & {
            episodes: Array<{
              id: number;
              name: string;
              episode_number: number;
              overview: string;
              still_path: string | null;
              air_date: string;
              season_number: number;
            }>;
          };
          const posterUrl = getMediaPoster(showDetails.poster_path);
          setDetailsData({
            title: showDetails.name,
            overview: showDetails.overview,
            backdrop: backdropUrl,
            posterUrl,
            episodes: showDetails.number_of_episodes,
            seasons: showDetails.number_of_seasons,
            genres: showDetails.genres,
            language: showDetails.original_language,
            voteAverage: showDetails.vote_average,
            voteCount: showDetails.vote_count,
            releaseDate: showDetails.first_air_date,
            rating: showDetails.content_ratings?.results?.find(
              (r) => r.iso_3166_1 === "US",
            )?.rating,
            type: "show",
            id: showDetails.id,
            imdbId: showDetails.external_ids?.imdb_id,
            seasonData: {
              seasons: showDetails.seasons,
              episodes: showDetails.episodes,
            },
            logoUrl,
          });
        }
      } catch (err) {
        console.error("Failed to fetch media details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isShown && data?.id) {
      fetchDetails();
    }
  }, [isShown, data]);

  useEffect(() => {
    if (isShown && !data?.id && !isLoading) {
      hide();
    }
  }, [isShown, data, isLoading, hide]);

  return (
    <OverlayPortal
      darken
      close={hide}
      show={isShown}
      durationClass="duration-500"
      zIndex={zIndex}
    >
      <Helmet>
        <html data-no-scroll />
      </Helmet>
      <div className="flex absolute inset-0 items-center justify-center pt-safe">
        <Flare.Base
          className={classNames(
            "group -m-[0.705em] rounded-3xl bg-background-main",
            "max-h-[900px] max-w-[1200px]",
            "bg-mediaCard-hoverBackground/60 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden",
            "h-[97%] w-[95%]",
            "relative",
          )}
        >
          <div className="transition-transform duration-300 h-full relative">
            <Flare.Light
              flareSize={300}
              cssColorVar="--colors-mediaCard-hoverAccent"
              backgroundClass="bg-mediaCard-hoverBackground duration-100"
              className="rounded-3xl bg-background-main group-hover:opacity-30 transition-opacity duration-300"
            />
            <div className="absolute right-4 top-4 z-50 pointer-events-auto">
              <button
                type="button"
                className="text-s font-semibold text-type-secondary hover:text-white transition-transform hover:scale-95 select-none"
                onClick={hide}
              >
                <IconPatch icon={Icons.X} />
              </button>
            </div>
            <Flare.Child className="pointer-events-auto relative h-full overflow-y-auto scrollbar-none select-text">
              <div className="select-text">
                {isLoading || !detailsData ? (
                  <DetailsSkeleton />
                ) : (
                  <DetailsContent data={detailsData} minimal={minimal} />
                )}
              </div>
            </Flare.Child>
          </div>
        </Flare.Base>
      </div>
    </OverlayPortal>
  );
}
