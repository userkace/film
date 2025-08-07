import classNames from "classnames";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getAllProviders, getProviders } from "@/backend/providers/providers";
import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { FlagIcon } from "@/components/FlagIcon";
import { Dropdown } from "@/components/form/Dropdown";
import { SortableList } from "@/components/form/SortableList";
import { Heading1 } from "@/components/utils/Text";
import { appLanguageOptions } from "@/setup/i18n";
import { isAutoplayAllowed } from "@/utils/autoplay";
import { getLocaleInfo, sortLangCodes } from "@/utils/language";

export function PreferencesPart(props: {
  language: string;
  setLanguage: (l: string) => void;
  enableThumbnails: boolean;
  setEnableThumbnails: (v: boolean) => void;
  enableAutoplay: boolean;
  setEnableAutoplay: (v: boolean) => void;
  enableSkipCredits: boolean;
  setEnableSkipCredits: (v: boolean) => void;
  sourceOrder: string[];
  setSourceOrder: (v: string[]) => void;
  enableSourceOrder: boolean;
  setenableSourceOrder: (v: boolean) => void;
  enableLowPerformanceMode: boolean;
  setEnableLowPerformanceMode: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const sorted = sortLangCodes(appLanguageOptions.map((item) => item.code));

  const allowAutoplay = isAutoplayAllowed();

  const options = appLanguageOptions
    .sort((a, b) => sorted.indexOf(a.code) - sorted.indexOf(b.code))
    .map((opt) => ({
      id: opt.code,
      name: `${opt.name}${opt.nativeName ? ` — ${opt.nativeName}` : ""}`,
      leftIcon: <FlagIcon langCode={opt.code} />,
    }));

  const selected = options.find(
    (item) => item.id === getLocaleInfo(props.language)?.code,
  );

  const allSources = getAllProviders().listSources();

  const sourceItems = useMemo(() => {
    const currentDeviceSources = getProviders().listSources();
    return props.sourceOrder.map((id) => ({
      id,
      name: allSources.find((s) => s.id === id)?.name || id,
      disabled: !currentDeviceSources.find((s) => s.id === id),
    }));
  }, [props.sourceOrder, allSources]);

  const navigate = useNavigate();

  const handleLowPerformanceModeToggle = () => {
    const newMode = !props.enableLowPerformanceMode;
    props.setEnableLowPerformanceMode(newMode);

    // When enabling low performance mode, disable bandwidth-heavy features
    if (newMode) {
      props.setEnableThumbnails(false);
      props.setEnableAutoplay(false);
    }
  };

  return (
    <div className="space-y-12">
      <Heading1 border>{t("settings.preferences.title")}</Heading1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column */}
        <div className="space-y-8">
          {/* Language Preference */}
          <div>
            <p className="text-white font-bold mb-3">
              {t("settings.preferences.language")}
            </p>
            <p className="max-w-[20rem] font-medium">
              {t("settings.preferences.languageDescription")}
            </p>
            <Dropdown
              className="w-full"
              options={options}
              selectedItem={selected || options[0]}
              setSelectedItem={(opt) => props.setLanguage(opt.id)}
            />
          </div>

          {/* Thumbnail Preference */}
          <div>
            <p className="text-white font-bold mb-3">
              {t("settings.preferences.thumbnail")}
            </p>
            <p className="max-w-[25rem] font-medium">
              {t("settings.preferences.thumbnailDescription")}
            </p>
            <div
              onClick={() => {
                if (!props.enableLowPerformanceMode) {
                  props.setEnableThumbnails(!props.enableThumbnails);
                }
              }}
              className={classNames(
                "bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg",
                props.enableLowPerformanceMode
                  ? "cursor-not-allowed opacity-50 pointer-events-none"
                  : "cursor-pointer opacity-100 pointer-events-auto",
              )}
            >
              <Toggle enabled={props.enableThumbnails} />
              <p className="flex-1 text-white font-bold">
                {t("settings.preferences.thumbnailLabel")}
              </p>
            </div>
          </div>

          {/* Autoplay Preference */}
          <div>
            <p className="text-white font-bold mb-3">
              {t("settings.preferences.autoplay")}
            </p>
            <p className="max-w-[25rem] font-medium">
              {t("settings.preferences.autoplayDescription")}
            </p>
            <div
              onClick={() =>
                allowAutoplay && !props.enableLowPerformanceMode
                  ? props.setEnableAutoplay(!props.enableAutoplay)
                  : null
              }
              className={classNames(
                "bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg",
                allowAutoplay && !props.enableLowPerformanceMode
                  ? "cursor-pointer opacity-100 pointer-events-auto"
                  : "cursor-not-allowed opacity-50 pointer-events-none",
              )}
            >
              <Toggle enabled={props.enableAutoplay && allowAutoplay} />
              <p className="flex-1 text-white font-bold">
                {t("settings.preferences.autoplayLabel")}
              </p>
            </div>

            {/* Skip End Credits Preference */}
            {props.enableAutoplay &&
              allowAutoplay &&
              !props.enableLowPerformanceMode && (
                <div className="pt-4 pl-4 border-l-8 border-dropdown-background">
                  <p className="text-white font-bold mb-3">
                    {t("settings.preferences.skipCredits")}
                  </p>
                  <p className="max-w-[25rem] font-medium">
                    {t("settings.preferences.skipCreditsDescription")}
                  </p>
                  <div
                    onClick={() =>
                      props.setEnableSkipCredits(!props.enableSkipCredits)
                    }
                    className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
                  >
                    <Toggle enabled={props.enableSkipCredits} />
                    <p className="flex-1 text-white font-bold">
                      {t("settings.preferences.skipCreditsLabel")}
                    </p>
                  </div>
                </div>
              )}
          </div>
          {/* Low Performance Mode */}
          <div>
            <p className="text-white font-bold mb-3">
              {t("settings.preferences.lowPerformanceMode")}
            </p>
            <p className="max-w-[25rem] font-medium">
              {t("settings.preferences.lowPerformanceModeDescription")}
            </p>
            <div
              onClick={handleLowPerformanceModeToggle}
              className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
            >
              <Toggle enabled={props.enableLowPerformanceMode} />
              <p className="flex-1 text-white font-bold">
                {t("settings.preferences.lowPerformanceModeLabel")}
              </p>
            </div>
          </div>
        </div>

        {/* Column */}
        <div id="source-order" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-white font-bold">
              {t("settings.preferences.sourceOrder")}
            </p>
            <div className="max-w-[25rem] font-medium">
              <Trans
                i18nKey="settings.preferences.sourceOrderDescription"
                components={{
                  bold: (
                    <span
                      className="text-type-link font-bold cursor-pointer"
                      onClick={() => navigate("/onboarding/extension")}
                    />
                  ),
                }}
              />
              <div
                onClick={() =>
                  props.setenableSourceOrder(!props.enableSourceOrder)
                }
                className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
              >
                <Toggle enabled={props.enableSourceOrder} />
                <p className="flex-1 text-white font-bold">
                  {t("settings.preferences.sourceOrderEnableLabel")}
                </p>
              </div>
            </div>

            {props.enableSourceOrder && (
              <div className="w-full flex flex-col gap-4">
                <SortableList
                  items={sourceItems}
                  setItems={(items) =>
                    props.setSourceOrder(items.map((item) => item.id))
                  }
                />
                <Button
                  className="max-w-[25rem]"
                  theme="secondary"
                  onClick={() =>
                    props.setSourceOrder(allSources.map((s) => s.id))
                  }
                >
                  {t("settings.reset")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
