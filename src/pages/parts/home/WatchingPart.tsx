import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { EditButton } from "@/components/buttons/EditButton";
import { Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { MediaGrid } from "@/components/media/MediaGrid";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { useProgressStore } from "@/stores/progress";
import { shouldShowProgress } from "@/stores/progress/utils";
import { MediaItem } from "@/utils/mediaTypes";

export function WatchingPart({
  onItemsChange,
  onShowDetails,
}: {
  onItemsChange: (hasItems: boolean) => void;
  onShowDetails?: (media: MediaItem) => void;
}) {
  const { t } = useTranslation();
  const progressItems = useProgressStore((s) => s.items);
  const removeItem = useProgressStore((s) => s.removeItem);
  const [editing, setEditing] = useState(false);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();

  const sortedProgressItems = useMemo(() => {
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

  useEffect(() => {
    onItemsChange(sortedProgressItems.length > 0);
  }, [sortedProgressItems, onItemsChange]);

  if (sortedProgressItems.length === 0) return null;

  return (
    <div className="relative">
      <SectionHeading
        title={t("home.continueWatching.sectionTitle")}
        icon={Icons.CLOCK}
      >
        <EditButton
          editing={editing}
          onEdit={setEditing}
          id="edit-button-watching"
        />
      </SectionHeading>
      <MediaGrid ref={gridRef}>
        {sortedProgressItems.map((v) => (
          <div
            key={v.id}
            onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
              e.preventDefault()
            }
          >
            <WatchedMediaCard
              media={v}
              closable={editing}
              onClose={() => removeItem(v.id)}
              onShowDetails={onShowDetails}
            />
          </div>
        ))}
      </MediaGrid>
    </div>
  );
}
