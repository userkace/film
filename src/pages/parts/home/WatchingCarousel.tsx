import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { EditButton } from "@/components/buttons/EditButton";
import { Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CarouselNavButtons } from "@/pages/discover/components/CarouselNavButtons";
import { useProgressStore } from "@/stores/progress";
import { shouldShowProgress } from "@/stores/progress/utils";
import { MediaItem } from "@/utils/mediaTypes";

interface WatchingCarouselProps {
  carouselRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  onShowDetails?: (media: MediaItem) => void;
}

const LONG_PRESS_DURATION = 500; // 0.5 seconds

function MediaCardSkeleton() {
  return (
    <div className="relative mt-4 group cursor-default user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-mediaCard-hoverBackground rounded-lg" />
        <div className="mt-2 h-4 bg-mediaCard-hoverBackground rounded w-3/4" />
      </div>
    </div>
  );
}

export function WatchingCarousel({
  carouselRefs,
  onShowDetails,
}: WatchingCarouselProps) {
  const { t } = useTranslation();
  const browser = !!window.chrome;
  let isScrolling = false;
  const [editing, setEditing] = useState(false);
  const removeItem = useProgressStore((s) => s.removeItem);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track overflow state
  const [hasOverflow, setHasOverflow] = useState(false);

  const { isMobile } = useIsMobile();

  const itemsLength = useProgressStore((state) => {
    return Object.entries(state.items).filter(
      (entry) => shouldShowProgress(entry[1]).show,
    ).length;
  });

  const progressItems = useProgressStore((state) => state.items);

  const items = useMemo(() => {
    const output: MediaItem[] = [];
    Object.entries(progressItems)
      .filter((entry) => shouldShowProgress(entry[1]).show)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .forEach((entry) => {
        output.push({
          id: entry[0],
          ...entry[1],
        });
      });
    return output;
  }, [progressItems]);

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling) return;
    isScrolling = true;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (browser) {
      setTimeout(() => {
        isScrolling = false;
      }, 345);
    } else {
      isScrolling = false;
    }
  };

  const categorySlug = "continue-watching";
  const SKELETON_COUNT = 10;

  const handleLongPress = () => {
    // Find the button by ID and simulate a click
    const editButton = document.getElementById("edit-button-watching");
    if (editButton) {
      (editButton as HTMLButtonElement).click();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default touch action
    pressTimerRef.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger long press for left mouse button (button 0)
    if (e.button === 0) {
      e.preventDefault(); // Prevent default mouse action
      pressTimerRef.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
    }
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Function to check overflow for the carousel
  const checkOverflow = (element: HTMLDivElement | null) => {
    if (!element) {
      setHasOverflow(false);
      return;
    }

    const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
    setHasOverflow(hasHorizontalOverflow);
  };

  // Function to set carousel ref and check overflow
  const setCarouselRef = (element: HTMLDivElement | null) => {
    carouselRefs.current[categorySlug] = element;

    // Check overflow after a short delay to ensure content is rendered
    setTimeout(() => checkOverflow(element), 100);
  };

  // Effect to recheck overflow on window resize
  useEffect(() => {
    const handleResize = () => {
      const element = carouselRefs.current[categorySlug];
      if (element) {
        checkOverflow(element);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [carouselRefs, categorySlug]);

  if (itemsLength === 0) return null;

  return (
    <>
      <SectionHeading
        title={t("home.continueWatching.sectionTitle")}
        icon={Icons.CLOCK}
        className="ml-2 md:ml-8 mt-2 -mb-5"
      >
        <div className="mr-6">
          <EditButton
            editing={editing}
            onEdit={setEditing}
            id="edit-button-watching"
          />
        </div>
      </SectionHeading>
      <div className="relative overflow-hidden carousel-container md:pb-4">
        <div
          id={`carousel-${categorySlug}`}
          className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
          ref={setCarouselRef}
          onWheel={handleWheel}
        >
          <div className="md:w-12" />

          {items.length > 0
            ? items.map((media) => (
                <div
                  key={media.id}
                  style={{ userSelect: "none" }}
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                >
                  <WatchedMediaCard
                    key={media.id}
                    media={media}
                    onShowDetails={onShowDetails}
                    closable={editing}
                    onClose={() => removeItem(media.id)}
                  />
                </div>
              ))
            : Array.from({ length: SKELETON_COUNT }).map(() => (
                <MediaCardSkeleton
                  key={`skeleton-${categorySlug}-${Math.random().toString(36).substring(7)}`}
                />
              ))}

          <div className="md:w-12" />
        </div>

        {!isMobile && (
          <CarouselNavButtons
            categorySlug={categorySlug}
            carouselRefs={carouselRefs}
            hasOverflow={hasOverflow}
          />
        )}
      </div>
    </>
  );
}
