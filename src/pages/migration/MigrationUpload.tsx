import { ChangeEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { SettingsCard } from "@/components/layout/SettingsCard";
import { Stepper } from "@/components/layout/Stepper";
import { CenterContainer } from "@/components/layout/ThinContainer";
import { Divider } from "@/components/utils/Divider";
import { Heading2, Paragraph } from "@/components/utils/Text";
import { useAuth } from "@/hooks/auth/useAuth";
import { MinimalPageLayout } from "@/pages/layouts/MinimalPageLayout";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { useAuthStore } from "@/stores/auth";
import { BookmarkMediaItem, useBookmarkStore } from "@/stores/bookmarks";
import { ProgressMediaItem, useProgressStore } from "@/stores/progress";

interface UploadedData {
  account?: {
    profile?: {
      icon: string;
      colorA: string;
      colorB: string;
    };
    deviceName?: string;
  };
  bookmarks?: Record<string, BookmarkMediaItem>;
  progress?: Record<string, ProgressMediaItem>;
  exportDate?: string;
}

export function MigrationUploadPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore();
  const { importData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceBookmarks = useBookmarkStore((s) => s.replaceBookmarks);
  const replaceProgress = useProgressStore((s) => s.replaceItems);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "processing"
  >("idle");
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const readFile = async (file: File) => {
    try {
      setStatus("processing");
      const fileContent = await file.text();
      const parsedData = JSON.parse(fileContent);

      // Validate and ensure types match what we expect
      const validatedData: UploadedData = {
        ...parsedData,
        bookmarks: parsedData.bookmarks
          ? Object.entries(parsedData.bookmarks).reduce(
              (acc, [id, item]: [string, any]) => {
                // Ensure type is either "show" or "movie"
                if (
                  typeof item.type === "string" &&
                  (item.type === "show" || item.type === "movie")
                ) {
                  acc[id] = {
                    title: item.title || "",
                    year: typeof item.year === "number" ? item.year : undefined,
                    poster: item.poster,
                    type: item.type as "show" | "movie",
                    updatedAt:
                      typeof item.updatedAt === "number"
                        ? item.updatedAt
                        : Date.now(),
                  };
                }
                return acc;
              },
              {} as Record<string, BookmarkMediaItem>,
            )
          : undefined,

        progress: parsedData.progress
          ? Object.entries(parsedData.progress).reduce(
              (acc, [id, item]: [string, any]) => {
                // Ensure type is either "show" or "movie"
                if (
                  typeof item.type === "string" &&
                  (item.type === "show" || item.type === "movie")
                ) {
                  acc[id] = {
                    title: item.title || "",
                    poster: item.poster,
                    type: item.type as "show" | "movie",
                    updatedAt:
                      typeof item.updatedAt === "number"
                        ? item.updatedAt
                        : Date.now(),
                    year: typeof item.year === "number" ? item.year : undefined,
                    progress: item.progress,
                    episodes: item.episodes || {},
                    seasons: item.seasons || {},
                  };
                }
                return acc;
              },
              {} as Record<string, ProgressMediaItem>,
            )
          : undefined,
      };

      setUploadedData(validatedData);
      setStatus("idle");
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      setStatus("error");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setStatus("idle");
      setUploadedData(null);

      // Auto-read the file when selected
      const file = e.target.files[0];
      readFile(file);
    }
  };

  const handleImport = useCallback(() => {
    if (status === "processing") {
      return;
    }

    if (!uploadedData || !user.account) return;

    setStatus("processing");

    if (uploadedData.bookmarks) {
      replaceBookmarks(uploadedData.bookmarks);
    }

    if (uploadedData.progress) {
      replaceProgress(uploadedData.progress);
    }

    importData(
      user.account,
      uploadedData.progress || {},
      uploadedData.bookmarks || {},
    )
      .then(() => {
        setStatus("success");
      })
      .catch((error) => {
        console.error("Error importing data:", error);
        setStatus("error");
      });
  }, [
    replaceBookmarks,
    replaceProgress,
    uploadedData,
    user.account,
    importData,
    status,
  ]);

  const handleLocalSave = useCallback(() => {
    if (!uploadedData) return;
    setStatus("processing");
    try {
      if (uploadedData.bookmarks) {
        localStorage.setItem(
          "__MW::bookmarks",
          JSON.stringify({ state: { bookmarks: uploadedData.bookmarks } }),
        );
        replaceBookmarks(uploadedData.bookmarks);
      }
      if (uploadedData.progress) {
        localStorage.setItem(
          "__MW::progress",
          JSON.stringify({ state: { items: uploadedData.progress } }),
        );
        replaceProgress(uploadedData.progress);
      }
      setStatus("success");
    } catch (e) {
      setStatus("error");
    }
  }, [uploadedData, replaceBookmarks, replaceProgress]);

  return (
    <MinimalPageLayout>
      <PageTitle k="migration.upload.title" subpage />
      <CenterContainer>
        <div>
          <Stepper current={2} steps={2} className="mb-12" />
          <Heading2 className="!text-4xl !mt-0">
            {t("migration.upload.title")}
          </Heading2>
          <Paragraph className="text-lg max-w-md mb-6">
            {t("migration.upload.description")}
          </Paragraph>

          <SettingsCard>
            <div className="flex py-6 flex-col space-y-4 items-center justify-center">
              <div className="flex flex-col space-y-2 w-full items-center">
                <p className="text-sm">
                  {t("migration.upload.file.description")}:
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />

              <Button
                onClick={handleFileButtonClick}
                theme="purple"
                className="w-full max-w-xs"
                padding="md:px-12 p-2.5"
              >
                <Icon icon={Icons.FILE} className="pr-2" />
                {selectedFile
                  ? t("migration.upload.file.change")
                  : t("migration.upload.file.select")}
              </Button>

              {selectedFile && (
                <div className="text-center mt-2 w-full">
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                    {uploadedData?.exportDate && (
                      <div className="text-sm pb-2">
                        {t("migration.upload.exportedOn")}:{" "}
                        {new Date(
                          uploadedData?.exportDate || "",
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </span>
                </div>
              )}

              {status === "processing" && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Icon icon={Icons.CLOCK} className="pr-2" />
                  {t("migration.upload.status.processing")}
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <Icon icon={Icons.WARNING} className="pr-2" />
                  {t("migration.upload.status.error")}
                </div>
              )}
            </div>
          </SettingsCard>

          {uploadedData && (
            <SettingsCard className="mt-6">
              <Heading2 className="!my-0 !text-type-secondary">
                {t("migration.upload.dataPreview")}
              </Heading2>
              <Divider marginClass="my-6 px-8 box-content -mx-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon={Icons.BOOKMARK} className="text-xl" />
                    <span className="font-medium">
                      {t("migration.upload.items.bookmarks")}
                    </span>
                  </div>
                  <div className="text-xl font-bold mt-2">
                    {uploadedData.bookmarks
                      ? Object.keys(uploadedData.bookmarks).length
                      : 0}
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon={Icons.CLOCK} className="text-xl" />
                    <span className="font-medium">
                      {t("migration.upload.items.progress")}
                    </span>
                  </div>
                  <div className="text-xl font-bold mt-2">
                    {uploadedData.progress
                      ? Object.keys(uploadedData.progress).length
                      : 0}
                  </div>
                </div>
              </div>

              <div className="flex py-6 flex-col space-y-2 items-center justify-center">
                {status === "success" ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Icon icon={Icons.CHECKMARK} className="pr-2" />
                    {user.account
                      ? t("migration.upload.status.success")
                      : t("migration.upload.status.successLocal")}
                  </div>
                ) : user.account ? (
                  <Button
                    onClick={handleImport}
                    className="w-full max-w-xs"
                    theme="purple"
                    padding="md:px-12 p-2.5"
                    disabled={status === "processing"}
                  >
                    <Icon icon={Icons.CLOUD_ARROW_UP} className="pr-2" />
                    {status === "processing"
                      ? t("migration.upload.button.processing")
                      : t("migration.upload.button.import")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleLocalSave}
                    className="w-full max-w-xs"
                    theme="purple"
                    padding="md:px-12 p-2.5"
                    disabled={status === "processing"}
                  >
                    <Icon icon={Icons.CLOUD_ARROW_UP} className="pr-2" />
                    {status === "processing"
                      ? t("migration.upload.button.processing")
                      : t("migration.upload.button.saveLocal")}
                  </Button>
                )}
              </div>
            </SettingsCard>
          )}

          <div className="flex justify-between mt-6">
            <Button theme="secondary" onClick={() => navigate("/migration")}>
              {t("migration.back")}
            </Button>

            {status === "success" && (
              <Button onClick={() => navigate("/")} theme="purple">
                {t("migration.upload.button.home")}
              </Button>
            )}
          </div>
        </div>
      </CenterContainer>
    </MinimalPageLayout>
  );
}
