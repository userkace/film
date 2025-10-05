import { useCallback, useState } from "react";

import { Icon, Icons } from "@/components/Icon";
import { conf } from "@/setup/config";

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function setCookie(name: string, value: string, expiryDays: number): void {
  const date = new Date();
  date.setTime(date.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function AdsPart(): JSX.Element | null {
  const [isAdDismissed, setIsAdDismissed] = useState(() => {
    return getCookie("adDismissed") === "true";
  });

  const dismissAd = useCallback(() => {
    setIsAdDismissed(true);
    setCookie("adDismissed", "true", 2); // Expires after 2 days
  }, []);

  if (isAdDismissed) return null;

  return (
    <div className="w-fit max-w-[32rem] mx-auto relative group pb-4">
      {(() => {
        const adContentUrl = conf().AD_CONTENT_URL;

        // VITE_AD_CONTENT_URL=default message (null will be nothing),referal link,image link, card message
        // Ensure adContentUrl is an array. If not, render nothing for ads.
        if (!Array.isArray(adContentUrl)) {
          return null;
        }

        const ad1LinkIsValid =
          typeof adContentUrl[1] === "string" && adContentUrl[1].length > 0;
        const ad1ImageIsProvided = typeof adContentUrl[2] === "string";
        const showAd1 =
          adContentUrl.length >= 2 && ad1LinkIsValid && ad1ImageIsProvided;

        const ad2LinkIsValid =
          typeof adContentUrl[3] === "string" && adContentUrl[3].length > 0;
        const ad2ImageIsProvided = typeof adContentUrl[4] === "string";
        const showAd2 =
          adContentUrl.length >= 5 && ad2LinkIsValid && ad2ImageIsProvided;

        return (
          <>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-center w-full items-center md:items-start">
              {showAd1 ? (
                <div className="rounded-xl bg-background-main hover:scale-[1.02] max-w-[16rem] md:max-w-[18rem] transition-all duration-300 md:flex-1 relative group">
                  <div className="bg-opacity-10 bg-buttons-purple rounded-xl border-2 border-buttons-purple border-opacity-30 hover:border-opacity-70 hover:shadow-lg hover:shadow-buttons-purple/20">
                    {" "}
                    <button
                      onClick={dismissAd}
                      type="button"
                      className="absolute z-50 -top-2 -right-2 w-6 h-6 bg-mediaCard-hoverBackground rounded-full flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Dismiss ad"
                    >
                      <Icon
                        className="text-xs font-semibold text-type-secondary"
                        icon={Icons.X}
                      />
                    </button>
                    <a href={adContentUrl[1]} className="block">
                      <div className="overflow-hidden rounded-t-xl">
                        <img
                          src={adContentUrl[2]}
                          alt="ad banner"
                          className="w-full h-auto transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-type-dimmed text-center py-2 transition-colors duration-300 group-hover:text-type-secondary">
                        <span>{adContentUrl[3]}</span>
                      </p>
                    </a>
                  </div>
                </div>
              ) : null}
              {showAd2 ? (
                <div className="rounded-xl bg-background-main hover:scale-[1.02] max-w-[16rem] md:max-w-[18rem] transition-all duration-300 md:flex-1 relative group">
                  <div className="bg-opacity-10 bg-buttons-purple rounded-xl border-2 border-buttons-purple border-opacity-30 hover:border-opacity-70 hover:shadow-lg hover:shadow-buttons-purple/20">
                    <button
                      onClick={dismissAd}
                      type="button"
                      className="absolute z-50 -top-2 -right-2 w-6 h-6 bg-mediaCard-hoverBackground rounded-full flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Dismiss ad"
                    >
                      <Icon
                        className="text-xs font-semibold text-type-secondary"
                        icon={Icons.X}
                      />
                    </button>
                    <a href={adContentUrl[4]} className="block">
                      <div className="overflow-hidden rounded-t-xl">
                        <img
                          src={adContentUrl[5]}
                          alt="ad banner"
                          className="w-full h-auto transition-transform duration-300"
                        />
                      </div>
                      <p className="text-xs text-type-dimmed text-center py-2 transition-colors duration-300 group-hover:text-type-secondary">
                        <span>{adContentUrl[6]}</span>
                      </p>
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            {adContentUrl[0] !== "null" && (
              <div>
                <p className="text-xs text-type-dimmed text-center pt-2 mx-4">
                  <a
                    href="https://discord.gg/mcjnJK98Gd"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {adContentUrl[0]}
                  </a>
                </p>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
