import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getMediaCredits,
  getPersonProfileImage,
} from "@/backend/metadata/tmdb";
import {
  TMDBCastMember,
  TMDBContentTypes,
  TMDBCrewMember,
} from "@/backend/metadata/types/tmdb";

interface CastCarouselProps {
  mediaId: string;
  mediaType: TMDBContentTypes;
}

export function CastCarousel({ mediaId, mediaType }: CastCarouselProps) {
  const { t } = useTranslation();
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [director, setDirector] = useState<TMDBCrewMember | null>(null);

  useEffect(() => {
    async function loadCast() {
      try {
        const credits = await getMediaCredits(mediaId, mediaType);
        // Find the director
        const foundDirector = credits.crew.find(
          (member) => member.job === "Director" && member.profile_path,
        );
        setDirector(foundDirector || null);

        // Only show cast members with profile images
        const castWithImages = credits.cast
          .filter((member) => member.profile_path)
          .slice(0, 20); // Limit to top 20 cast members
        setCast(castWithImages);
      } catch (err) {
        console.error("Failed to load cast:", err);
      }
    }
    loadCast();
  }, [mediaId, mediaType]);

  if (cast.length === 0 && !director) return null;

  return (
    <div className="space-y-4 pt-8">
      <div className="flex overflow-x-auto scrollbar-none pb-4 gap-4">
        {director && (
          <a
            href={`https://www.themoviedb.org/person/${director.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="relative h-32 w-32 overflow-hidden rounded-full">
              <img
                src={getPersonProfileImage(director.profile_path)}
                alt={director.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center w-32 flex flex-col">
              <span className="font-medium truncate">{director.name}</span>
              <span className="text-sm truncate">{t("Director")}</span>
            </div>
          </a>
        )}
        {cast.map((member) => (
          <a
            key={member.id}
            href={`https://www.themoviedb.org/person/${member.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="relative h-32 w-32 overflow-hidden rounded-full">
              <img
                src={getPersonProfileImage(member.profile_path)}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-center w-32 flex flex-col">
              <span className="font-medium truncate">{member.name}</span>
              <span className="text-sm truncate">{member.character}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
