import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

export interface EditButtonWithTextProps {
  editing: boolean;
  onEdit?: (editing: boolean) => void;
  id?: string;
  text: string;
  secondaryText?: string;
}

export function EditButtonWithText(props: EditButtonWithTextProps) {
  const { t } = useTranslation();
  const [parent] = useAutoAnimate<HTMLSpanElement>();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onClick = useCallback(() => {
    props.onEdit?.(!props.editing);
  }, [props]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className="flex h-12 items-center overflow-hidden rounded-full bg-background-secondary px-4 py-2 text-white transition-[background-color,transform] hover:bg-background-secondaryHover active:scale-105"
      id={props.id} // Assign id to the button
    >
      <span ref={parent}>
        {props.editing ? (
          <span className="mx-2 sm:mx-4 whitespace-nowrap">
            {props.text ?? t("home.mediaList.stopEditing")}
          </span>
        ) : (
          <span className="mx-2 sm:mx-4 whitespace-nowrap">
            {props.secondaryText}
          </span>
        )}
      </span>
    </button>
  );
}
