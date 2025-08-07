import { useEffect, useState } from "react";

import { usePlayerStore } from "@/stores/player/store";
import { formatSeconds } from "@/utils/formatSeconds";

export function Title() {
  const title = usePlayerStore((s) => s.meta?.title);
  const { time } = usePlayerStore((s) => s.progress);
  const [isShifting, setIsShifting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShifting(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShifting(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleTitleClick = () => {
    const baseLink = window.location.href;
    const timeStamp = formatSeconds(time, time >= 3600);

    if (isShifting) {
      navigator.clipboard
        .writeText(`${baseLink}?t=${timeStamp}`)
        .then(() => {});
    } else {
      navigator.clipboard.writeText(baseLink).then(() => {});
    }
  };

  return (
    <p
      onClick={handleTitleClick}
      className="cursor-copy transform transition-transform duration-200 hover:scale-105"
      title={isShifting ? "Copy with current time" : "Copy link"}
    >
      {title}
    </p>
  );
}
