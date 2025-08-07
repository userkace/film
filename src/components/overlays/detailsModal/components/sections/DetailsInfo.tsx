import { t } from "i18next";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";

import { DetailsRatings } from "./DetailsRatings";
import { DetailsInfoProps } from "../../types";

export function DetailsInfo({
  data,
  imdbData,
  rtData,
  provider,
}: DetailsInfoProps) {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleCopyId = async () => {
    if (!isShiftPressed || !data.id) return;
    await navigator.clipboard.writeText(data.id.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const formatRuntime = (minutes?: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEndTime = (runtime?: number | null) => {
    if (!runtime) return null;
    const now = new Date();
    const endTime = new Date(now.getTime() + runtime * 60000);
    return endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="md:col-span-1 bg-background-secondary/50 group-hover:bg-background-secondary/80 p-4 rounded-lg border-buttons-primary transition-colors duration-300">
      <div className="space-y-3 text-xs">
        {data.runtime && (
          <div className="flex flex-wrap items-center gap-2 text-white/80">
            <div className="flex items-center gap-1">
              <span className="font-medium">{t("details.runtime")}</span>{" "}
              {formatRuntime(data.runtime)}
            </div>
            {data.type === "movie" && (
              <div className="flex items-center gap-1">
                <span className="hidden lg:inline mx-1">•</span>
                <Trans
                  i18nKey="details.endsAt"
                  className="font-medium"
                  values={{ time: getEndTime(data.runtime) }}
                />
              </div>
            )}
          </div>
        )}
        {data.language && (
          <div className="flex items-center gap-1 text-white/80">
            <span className="font-medium">{t("details.language")}</span>{" "}
            {data.language.toUpperCase()}
          </div>
        )}
        {data.releaseDate && (
          <div className="flex items-center gap-1 text-white/80">
            <span className="font-medium">{t("details.releaseDate")}</span>{" "}
            {formatDate(data.releaseDate)}
          </div>
        )}
        {data.rating && (
          <div className="flex items-center gap-1 text-white/80">
            <span className="font-medium">{t("details.rating")}</span>{" "}
            {data.rating}
          </div>
        )}

        {/* Hidden TMDB ID */}
        {data.id && isShiftPressed && (
          <div
            className="flex items-center gap-1 text-white/80 cursor-pointer transition-opacity duration-200 select-none"
            onClick={handleCopyId}
            title={isShiftPressed ? "Click to copy" : "Hold Shift to show"}
          >
            <span className="font-medium">ID:</span>
            <span className="font-mono">{data.id}</span>
            {showCopied && <span className="text-green-400 ml-2">Copied!</span>}
          </div>
        )}

        {/* External Ratings */}
        <DetailsRatings
          imdbData={imdbData}
          rtData={rtData}
          mediaId={data.id}
          mediaType={data.type}
          imdbId={data.imdbId}
          voteAverage={data.voteAverage}
          voteCount={data.voteCount}
          provider={provider}
        />
      </div>
    </div>
  );
}
