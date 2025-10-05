import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { base64ToBuffer, decryptData } from "@/backend/accounts/crypto";
import { getRoomStatuses } from "@/backend/player/status";
import { UserAvatar } from "@/components/Avatar";
import { Icon, Icons } from "@/components/Icon";
import { Spinner } from "@/components/layout/Spinner";
import { Transition } from "@/components/utils/Transition";
import { useAuth } from "@/hooks/auth/useAuth";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { conf } from "@/setup/config";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";

function Divider() {
  return <hr className="border-0 w-full h-px bg-dropdown-border" />;
}

function GoToLink(props: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  const goTo = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      window.scrollTo(0, 0);
      navigate(href);
    }
  };

  return (
    <a
      tabIndex={0}
      href={props.href}
      onClick={(evt) => {
        evt.preventDefault();
        if (props.href) goTo(props.href);
        else props.onClick?.();
      }}
      className={props.className}
    >
      {props.children}
    </a>
  );
}

function DropdownLink(props: {
  children: React.ReactNode;
  href?: string;
  icon?: Icons;
  highlight?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <GoToLink
      onClick={props.onClick}
      href={props.href}
      className={classNames(
        "tabbable cursor-pointer flex gap-3 items-center m-3 p-1 rounded font-medium transition-colors duration-100",
        props.highlight
          ? "text-dropdown-highlight hover:text-dropdown-highlightHover"
          : "text-dropdown-text hover:text-white",
        props.className,
      )}
    >
      {props.icon ? <Icon icon={props.icon} className="text-xl" /> : null}
      {props.children}
    </GoToLink>
  );
}

function CircleDropdownLink(props: { icon: Icons; href: string }) {
  return (
    <GoToLink
      href={props.href}
      onClick={() => window.scrollTo(0, 0)}
      className="tabbable w-11 h-11 rounded-full bg-dropdown-contentBackground text-dropdown-text hover:text-white transition-colors duration-100 flex justify-center items-center"
    >
      <Icon className="text-2xl" icon={props.icon} />
    </GoToLink>
  );
}

function WatchPartyInputLink() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = useBackendUrl();
  const account = useAuthStore((s) => s.account);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !backendUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getRoomStatuses(
        backendUrl,
        account,
        code.trim().toUpperCase(),
      );
      const users = Object.values(response.users);

      if (users.length === 0) {
        setError(t("watchParty.emptyRoom"));
        return;
      }

      const hostUser = users.find((user) => user[0].isHost)?.[0];
      if (!hostUser) {
        setError(t("watchParty.noHost"));
        return;
      }

      const { content } = hostUser;

      let targetUrl = "";
      if (
        content.type.toLowerCase() === "tv show" &&
        content.seasonId &&
        content.episodeId
      ) {
        targetUrl = `/media/tmdb-tv-${content.tmdbId}/${content.seasonId}/${content.episodeId}`;
      } else {
        targetUrl = `/media/tmdb-movie-${content.tmdbId}`;
      }

      const url = new URL(targetUrl, window.location.origin);
      url.searchParams.set("watchparty", code.trim().toUpperCase());

      navigate(url.pathname + url.search);
      setCode("");
    } catch (err) {
      console.error("Failed to fetch room data:", err);
      setError(t("watchParty.invalidRoom"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames(
        "m-3 p-1 rounded font-medium transition-colors duration-100 group",
        "text-dropdown-text hover:text-white",
        isFocused ? "bg-dropdown-contentBackground" : "",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Icon icon={Icons.WATCH_PARTY} className="text-xl" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("watchParty.joinParty")}
            className="bg-transparent border-none outline-none w-full text-base placeholder:text-dropdown-text group-hover:placeholder:text-white"
            maxLength={10}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={classNames(
              "p-1 rounded hover:bg-dropdown-contentBackground transition-colors",
              isLoading && "opacity-50 cursor-not-allowed",
              !code.trim() && "opacity-0 pointer-events-none",
            )}
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <Icon
                icon={Icons.ARROW_RIGHT}
                className="text-xl transition-opacity duration-200"
              />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 px-1 ml-8">{error}</p>}
      </div>
    </form>
  );
}

export function LinksDropdown(props: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const deviceName = useAuthStore((s) => s.account?.deviceName);
  const seed = useAuthStore((s) => s.account?.seed);
  const bufferSeed = useMemo(
    () => (seed ? base64ToBuffer(seed) : null),
    [seed],
  );
  const { logout } = useAuth();

  useEffect(() => {
    function onWindowClick(evt: MouseEvent) {
      if ((evt.target as HTMLElement).closest(".is-dropdown")) return;
      setOpen(false);
    }

    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((s) => !s);
  }, []);

  const enableLowPerformanceMode = usePreferencesStore(
    (s) => s.enableLowPerformanceMode,
  );

  return (
    <div className="relative is-dropdown">
      <div
        className={classNames(
          "cursor-pointer tabbable rounded-full flex gap-2 text-white items-center py-2 px-3 bg-pill-background hover:bg-pill-backgroundHover backdrop-blur-lg transition-all duration-100 hover:scale-105",
          open ? "bg-opacity-100" : "bg-opacity-50",
        )}
        tabIndex={0}
        onClick={toggleOpen}
        onKeyUp={(evt) => evt.key === "Enter" && toggleOpen()}
      >
        {props.children}
        <Icon
          className={classNames(
            "text-xl transition-transform duration-100",
            open ? "rotate-180" : "",
          )}
          icon={Icons.CHEVRON_DOWN}
        />
      </div>
      <Transition animation="slide-down" show={open}>
        <div className="rounded-lg absolute w-64 bg-dropdown-altBackground top-full mt-3 right-0">
          {deviceName && bufferSeed ? (
            <DropdownLink className="text-white" href="/settings">
              <UserAvatar />
              {decryptData(deviceName, bufferSeed)}
            </DropdownLink>
          ) : (
            <DropdownLink href="/login" icon={Icons.RISING_STAR} highlight>
              {t("navigation.menu.register")}
            </DropdownLink>
          )}
          <Divider />
          <DropdownLink href="/settings" icon={Icons.SETTINGS}>
            {t("navigation.menu.settings")}
          </DropdownLink>
          {process.env.NODE_ENV === "development" ? (
            <DropdownLink href="/dev" icon={Icons.COMPRESS}>
              {t("navigation.menu.development")}
            </DropdownLink>
          ) : null}
          <DropdownLink href="/about" icon={Icons.CIRCLE_QUESTION}>
            {t("navigation.menu.about")}
          </DropdownLink>
          {!enableLowPerformanceMode && (
            <DropdownLink href="/discover" icon={Icons.RISING_STAR}>
              {t("navigation.menu.discover")}
            </DropdownLink>
          )}
          <WatchPartyInputLink />
          {deviceName ? (
            <DropdownLink
              className="!text-type-danger opacity-75 hover:opacity-100"
              icon={Icons.LOGOUT}
              onClick={logout}
            >
              {t("navigation.menu.logout")}
            </DropdownLink>
          ) : null}
          <Divider />
          <div className="my-4 flex justify-center items-center gap-4">
            {conf().GITHUB_LINK && (
              <CircleDropdownLink
                href={conf().GITHUB_LINK}
                icon={Icons.GITHUB}
              />
            )}
            <CircleDropdownLink
              href={conf().DISCORD_LINK}
              icon={Icons.DISCORD}
            />
            <CircleDropdownLink href="/support" icon={Icons.SUPPORT} />
            <CircleDropdownLink
              href="https://rentry.co/h5mypdfs"
              icon={Icons.TIP_JAR}
            />
          </div>
        </div>
      </Transition>
    </div>
  );
}
