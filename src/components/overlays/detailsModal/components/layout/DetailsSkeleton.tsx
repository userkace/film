export function DetailsSkeleton() {
  // Static arrays of unique identifiers for skeleton elements
  const episodeSkeletons = [
    "episode-skeleton-1",
    "episode-skeleton-2",
    "episode-skeleton-3",
    "episode-skeleton-4",
  ];
  const castSkeletons = [
    "cast-skeleton-1",
    "cast-skeleton-2",
    "cast-skeleton-3",
    "cast-skeleton-4",
    "cast-skeleton-5",
    "cast-skeleton-6",
  ];

  return (
    <div className="relative h-full flex flex-col animate-pulse">
      {/* Backdrop */}
      <div
        className="relative -mt-12 z-20"
        style={{
          height: "500px",
        }}
      >
        {/* Title/Logo positioned on backdrop */}
        <div className="absolute inset-x-0 bottom-20 z-30 px-6">
          <div className="h-12 w-64 bg-white/10 rounded-lg" />{" "}
          {/* Logo/Title placeholder */}
        </div>
        <div
          className="absolute inset-0 bg-white/10"
          style={{
            maskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 120px)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 120px)",
            zIndex: -1,
          }}
        />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 mt-[-70px] flex-grow relative z-30">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="h-10 w-32 bg-white/10 rounded-lg" />{" "}
          {/* Play button */}
          <div className="h-10 w-32 bg-white/10 rounded-lg" />{" "}
          {/* Trailer button */}
          <div className="h-10 w-32 bg-white/10 rounded-lg" />{" "}
          {/* Share button */}
          <div className="flex-1" />
          <div className="h-6 w-24 bg-white/10 rounded-lg" /> {/* Rating */}
          <div className="h-6 w-24 bg-white/10 rounded-lg" />{" "}
          {/* Release date */}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 pt-4">
          {/* Left Column - Main Content (2/3) */}
          <div className="md:col-span-2">
            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="h-6 w-20 bg-white/10 rounded-full" />
              <div className="h-6 w-24 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>

            {/* Director and Cast */}
            <div className="space-y-4 mb-6">
              <div className="h-4 w-48 bg-white/10 rounded" /> {/* Director */}
              <div className="h-4 w-64 bg-white/10 rounded" /> {/* Cast */}
            </div>
          </div>

          {/* Right Column - Details Info (1/3) */}
          <div className="md:col-span-1">
            <div className="bg-video-context-border p-4 rounded-lg border-buttons-primary bg-opacity-80">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-white/10 rounded" /> {/* Runtime */}
                <div className="h-4 w-24 bg-white/10 rounded" />{" "}
                {/* Language */}
                <div className="h-4 w-36 bg-white/10 rounded" />{" "}
                {/* Release date */}
                <div className="h-4 w-20 bg-white/10 rounded" /> {/* Rating */}
                <div className="h-4 w-40 bg-white/10 rounded" />{" "}
                {/* External ratings */}
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Carousel Skeleton */}
        <div className="mt-8">
          <div className="h-6 w-48 bg-white/10 rounded mb-4" />{" "}
          {/* Season selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodeSkeletons.map((key) => (
              <div key={key} className="aspect-video bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Cast Carousel Skeleton */}
        <div className="mt-8">
          <div className="h-6 w-32 bg-white/10 rounded mb-4" />{" "}
          {/* Cast title */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {castSkeletons.map((key) => (
              <div key={key} className="flex-shrink-0 w-32">
                <div className="aspect-[2/3] bg-white/10 rounded-lg mb-2" />{" "}
                {/* Profile image */}
                <div className="h-4 w-24 bg-white/10 rounded mx-auto" />{" "}
                {/* Name */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
