import c from "classnames";
import { forwardRef, useEffect, useRef, useState } from "react";

import { Flare } from "@/components/utils/Flare";

import { Icon, Icons } from "../Icon";
import { TextInputControl } from "../text-inputs/TextInputControl";

export interface SearchBarProps {
  placeholder?: string;
  onChange: (value: string, force: boolean) => void;
  onUnFocus: (newSearch?: string) => void;
  value: string;
  isSticky?: boolean;
  isInFeatured?: boolean;
  hideTooltip?: boolean;
}

export const SearchBarInput = forwardRef<HTMLInputElement, SearchBarProps>(
  (props, ref) => {
    const [focused, setFocused] = useState(false);
    const [lightTheme, setLightTheme] = useState(
      Boolean(props.isInFeatured) && window.scrollY < 600,
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    function setSearch(value: string) {
      props.onChange(value, true);
    }

    useEffect(() => {
      const handleScroll = () => {
        setLightTheme(Boolean(props.isInFeatured) && window.scrollY < 600);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [props.isInFeatured]);

    return (
      <div ref={containerRef}>
        <Flare.Base
          className={c({
            "hover:flare-enabled group flex flex-col rounded-[28px] transition-colors sm:flex-row sm:items-center relative backdrop-blur-sm": true,
            "transition-colors duration-300": true,
            "bg-search-background/50": !focused && lightTheme,
            "bg-search-background":
              focused || props.isSticky || !props.isInFeatured,
          })}
        >
          <Flare.Light
            flareSize={400}
            enabled={focused}
            className="rounded-[28px]"
            backgroundClass={c({
              "transition-colors": true,
              "bg-search-background": !focused,
              "bg-search-focused": focused,
            })}
          />
          <Flare.Child className="flex flex-1 flex-col">
            <div
              className={c(
                "absolute bottom-0 left-5 top-0 flex max-h-14 items-center text-search-icon cursor-pointer z-10",
                "transition-colors duration-300",
                props.isInFeatured
                  ? lightTheme
                    ? "text-white/50"
                    : ""
                  : "text-search-icon",
              )}
              onClick={(e) => {
                e.preventDefault();
                setShowTooltip(!showTooltip);
                if (ref && typeof ref !== "function" && ref.current) {
                  ref.current.focus();
                }
              }}
            >
              <Icon icon={Icons.SEARCH} />
            </div>

            <TextInputControl
              ref={ref}
              onUnFocus={() => {
                setFocused(false);
                props.onUnFocus();
              }}
              onFocus={() => setFocused(true)}
              onChange={(val) => setSearch(val)}
              value={props.value}
              className={c(
                "w-full flex-1 bg-transparent px-4 py-4 pl-12 !text-search-text focus:outline-none sm:py-4 sm:pr-2 transition-colors duration-300",
                "transition-colors duration-300",
                props.isInFeatured
                  ? lightTheme
                    ? "text-white/50"
                    : "placeholder-search-placeholder"
                  : "placeholder-search-placeholder",
              )}
              placeholder={props.placeholder}
            />

            {showTooltip && !props.hideTooltip && (
              <div className="py-4">
                <p className="font-bold text-sm mb-1 text-search-text">
                  Advanced Search:
                </p>
                <div className="space-y-1.5 text-xs text-search-text">
                  <div>
                    <p className="mb-0.5">Year search:</p>
                    <p className="text-type-secondary italic pl-2">
                      Inception year:2010
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5">Type search:</p>
                    <p className="text-type-secondary italic pl-2">
                      Marvel type:movie
                    </p>
                    <p className="text-type-secondary italic pl-2">
                      Friends type:tv
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5">TMDB ID search:</p>
                    <p className="text-type-secondary italic pl-2">
                      tmdb:123456 - For movies
                    </p>
                    <p className="text-type-secondary italic pl-2">
                      tmdb:123456:tv - For TV shows
                    </p>
                  </div>
                </div>
              </div>
            )}

            {props.value.length > 0 && (
              <div
                onClick={() => {
                  props.onUnFocus("");
                  if (ref && typeof ref !== "function") {
                    ref.current?.focus();
                  }
                }}
                className="cursor-pointer hover:text-white  absolute bottom-0 right-2 top-0 flex justify-center my-auto h-10 w-10 items-center hover:bg-search-hoverBackground active:scale-110 text-search-icon rounded-full transition-[transform,background-color] duration-200"
              >
                <Icon
                  icon={Icons.X}
                  className="transition-colors duration-200"
                />
              </div>
            )}
          </Flare.Child>
        </Flare.Base>
      </div>
    );
  },
);
