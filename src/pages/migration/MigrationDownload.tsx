import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { SettingsCard } from "@/components/layout/SettingsCard";
import { Stepper } from "@/components/layout/Stepper";
import { CenterContainer } from "@/components/layout/ThinContainer";
import { Divider } from "@/components/utils/Divider";
import { Heading2, Heading3, Paragraph } from "@/components/utils/Text";
import { MinimalPageLayout } from "@/pages/layouts/MinimalPageLayout";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { useAuthStore } from "@/stores/auth";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useProgressStore } from "@/stores/progress";

export function MigrationDownloadPage() {
  const { t } = useTranslation();
  const user = useAuthStore();
  const navigate = useNavigate();
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const progress = useProgressStore((s) => s.items);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleDownload = useCallback(() => {
    try {
      const exportData = {
        account: {
          profile: user.account?.profile,
          deviceName: user.account?.deviceName,
        },
        bookmarks,
        progress,
        exportDate: new Date().toISOString(),
      };

      // Convert to JSON and create a downloadable link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      // Create filename with current date
      const exportFileDefaultName = `mw-account-data-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setStatus("success");
    } catch (error) {
      console.error("Error during data download:", error);
      setStatus("error");
    }
  }, [bookmarks, progress, user.account]);

  return (
    <MinimalPageLayout>
      <PageTitle subpage k="global.pages.migration" />
      <CenterContainer>
        <div>
          <Stepper steps={2} current={2} className="mb-12" />
          <Heading2 className="!text-4xl">
            {t("migration.download.title")}
          </Heading2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <Paragraph className="text-lg max-w-md">
              {t("migration.download.description")}
            </Paragraph>
            <SettingsCard>
              <div className="flex justify-between items-center">
                <Heading3 className="!my-0 !text-type-secondary">
                  {t("migration.download.items.description")}{" "}
                </Heading3>
              </div>
              <Divider marginClass="my-6 px-8 box-content -mx-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon={Icons.BOOKMARK} className="text-xl" />
                    <span className="font-medium">
                      {t("migration.download.items.bookmarks")}
                    </span>
                  </div>
                  <div className="text-xl font-bold mt-2">
                    {Object.keys(bookmarks).length}
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon={Icons.CLOCK} className="text-xl" />
                    <span className="font-medium">
                      {t("migration.download.items.progress")}
                    </span>
                  </div>
                  <div className="text-xl font-bold mt-2">
                    {Object.keys(progress).length}
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
          <Divider />
          <div className="flex justify-between">
            <Button theme="secondary" onClick={() => navigate("/migration")}>
              {t("migration.back")}
            </Button>
            {status !== "success" && (
              <Button theme="purple" onClick={handleDownload}>
                {t("migration.download.button.download")}
              </Button>
            )}

            {status === "success" && (
              <div>
                <Button theme="purple" onClick={() => navigate("/")}>
                  {t("migration.download.button.home")}
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-center pt-4">
            {status === "success" && (
              <p className="text-green-600 mt-4">
                {t("migration.download.status.success")}
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 mt-4">
                {t("migration.download.status.error")}
              </p>
            )}
          </div>
        </div>
      </CenterContainer>
    </MinimalPageLayout>
  );
}
