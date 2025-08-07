import classNames from "classnames";
import { ReactNode } from "react";

import { Icon, Icons } from "@/components/Icon";
import { Spinner } from "@/components/layout/Spinner";
import { Title } from "@/components/player/internals/ContextMenu/Misc";

export function Chevron(props: { children?: React.ReactNode }) {
  return (
    <span className="text-white flex items-center font-medium">
      {props.children}
      <Icon className="text-xl ml-1 -mr-1.5" icon={Icons.CHEVRON_RIGHT} />
    </span>
  );
}

export function LinkTitle(props: {
  children: React.ReactNode;
  textClass?: string;
  box?: boolean;
}) {
  return (
    <span
      className={classNames([
        "font-medium text-left",
        props.box
          ? "flex flex-col items-center justify-center h-full gap-1 text-center"
          : "",
        props.textClass || "text-video-context-type-main",
      ])}
    >
      {props.children}
    </span>
  );
}

export function BackLink(props: {
  onClick?: () => void;
  children: React.ReactNode;
  rightSide?: React.ReactNode;
  side?: "left" | "right";
}) {
  const { side = "left" } = props;

  if (side === "right") {
    return (
      <Title
        rightSide={
          <button
            type="button"
            className="p-2 rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
            onClick={props.onClick}
          >
            <Icon className="text-xl" icon={Icons.ARROW_RIGHT} />
          </button>
        }
      >
        <button type="button" onClick={props.onClick}>
          <span className="line-clamp-1 break-all">{props.children}</span>
        </button>
      </Title>
    );
  }
  return (
    <Title rightSide={props.rightSide}>
      <button
        type="button"
        className="-ml-2 p-2 rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
        onClick={props.onClick}
      >
        <Icon className="text-xl" icon={Icons.ARROW_LEFT} />
      </button>
      <span className="line-clamp-1 break-all">{props.children}</span>
    </Title>
  );
}

export function Link(props: {
  rightSide?: ReactNode;
  clickable?: boolean;
  active?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  box?: boolean;
  disabled?: boolean;
}) {
  const classes = classNames(
    "flex py-2 transition-colors duration-100 rounded-lg",
    props.box ? "bg-video-context-light/10 h-20" : "",
    {
      "cursor-default": !props.clickable,
      "hover:bg-video-context-light hover:bg-opacity-20 cursor-pointer tabbable":
        props.clickable,
      "bg-video-context-light bg-opacity-20": props.active,
      "-ml-3 px-3 w-full": !props.box,
      "opacity-50 pointer-events-none": props.disabled,
    },
  );
  const styles = { width: "calc(100% + 1.5rem)" };

  const content = (
    <div
      className={classNames("flex items-center flex-1 h-full", props.className)}
    >
      <div className="flex-1 text-left flex h-full">{props.children}</div>
      <div className="flex">{props.rightSide}</div>
    </div>
  );

  if (!props.onClick) {
    return (
      <div
        className={classes}
        style={styles}
        data-active-link={props.active ? true : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      style={props.box ? {} : styles}
      onClick={props.onClick}
      data-active-link={props.active ? true : undefined}
      disabled={props.disabled}
    >
      {content}
    </button>
  );
}

export function ChevronLink(props: {
  rightText?: string;
  onClick?: () => void;
  children?: ReactNode;
  active?: boolean;
  box?: boolean;
  disabled?: boolean;
}) {
  const rightContent = <Chevron>{props.rightText}</Chevron>;
  return (
    <Link
      onClick={props.onClick}
      active={props.active}
      clickable
      rightSide={props.box ? null : rightContent}
      className={props.box ? "flex flex-col items-center justify-center" : ""}
      box={props.box}
      disabled={props.disabled}
    >
      <LinkTitle box={props.box}>{props.children}</LinkTitle>
    </Link>
  );
}

export function SelectableLink(props: {
  selected?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  box?: boolean;
}) {
  let rightContent;
  if (props.selected) {
    rightContent = (
      <Icon
        icon={Icons.CIRCLE_CHECK}
        className="text-xl text-video-context-type-accent"
      />
    );
  }
  if (props.error)
    rightContent = (
      <span className="flex items-center text-video-context-error">
        <Icon className="ml-2" icon={Icons.WARNING} />
      </span>
    );
  if (props.loading) rightContent = <Spinner className="text-lg" />; // should override selected and error

  return (
    <Link
      onClick={props.onClick}
      clickable={!props.disabled}
      rightSide={rightContent}
      box={props.box}
    >
      <LinkTitle
        textClass={classNames({
          "text-white": props.selected,
          "text-video-context-type-main text-opacity-40": props.disabled,
        })}
      >
        {props.children}
      </LinkTitle>
    </Link>
  );
}
