import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getAllProviders, getProviders } from "@/backend/providers/providers";
import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { SortableList } from "@/components/form/SortableList";
import { Heading2 } from "@/components/utils/Text";
import { usePreferencesStore } from "@/stores/preferences";

export function EmbedOrderPart() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const embedOrder = usePreferencesStore((s) => s.embedOrder);
  const setEmbedOrder = usePreferencesStore((s) => s.setEmbedOrder);
  const enableEmbedOrder = usePreferencesStore((s) => s.enableEmbedOrder);
  const setEnableEmbedOrder = usePreferencesStore((s) => s.setEnableEmbedOrder);

  const allEmbeds = getAllProviders().listEmbeds();

  const embedItems = useMemo(() => {
    const currentDeviceEmbeds = getProviders().listEmbeds();

    // If embed order is empty, show all available embeds
    if (embedOrder.length === 0) {
      return allEmbeds.map((e) => ({
        id: e.id,
        name: e.name || e.id,
        disabled: !currentDeviceEmbeds.find((embed) => embed.id === e.id),
      }));
    }

    // Otherwise, show embeds in the specified order
    return embedOrder.map((id) => ({
      id,
      name: allEmbeds.find((e) => e.id === id)?.name || id,
      disabled: !currentDeviceEmbeds.find((e) => e.id === id),
    }));
  }, [embedOrder, allEmbeds]);

  return (
    <div className="space-y-6">
      <Heading2>Embed Order Settings</Heading2>
      <div className="flex flex-col gap-3">
        <p className="text-white font-bold">
          {t("settings.preferences.embedOrder")}
        </p>
        <div className="max-w-[25rem] font-medium">
          <Trans
            i18nKey="settings.preferences.embedOrderDescription"
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
            onClick={() => setEnableEmbedOrder(!enableEmbedOrder)}
            className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
          >
            <Toggle enabled={enableEmbedOrder} />
            <p className="flex-1 text-white font-bold">
              {t("settings.preferences.embedOrderEnableLabel")}
            </p>
          </div>
        </div>

        {enableEmbedOrder && (
          <div className="w-full flex flex-col gap-4">
            <SortableList
              items={embedItems}
              setItems={(items) => setEmbedOrder(items.map((item) => item.id))}
            />
            <Button
              className="max-w-[25rem]"
              theme="secondary"
              onClick={() => setEmbedOrder(allEmbeds.map((e) => e.id))}
            >
              {t("settings.reset")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
