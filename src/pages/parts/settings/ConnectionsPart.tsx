import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { SettingsCard } from "@/components/layout/SettingsCard";
import { Modal, ModalCard, useModal } from "@/components/overlays/Modal";
import {
  StatusCircle,
  StatusCircleProps,
} from "@/components/player/internals/StatusCircle";
import { MwLink } from "@/components/text/Link";
import { AuthInputBox } from "@/components/text-inputs/AuthInputBox";
import { Divider } from "@/components/utils/Divider";
import { Heading1, Heading2, Paragraph } from "@/components/utils/Text";
import {
  SetupPart,
  Status,
  testFebboxKey,
  testRealDebridKey,
} from "@/pages/parts/settings/SetupPart";
import { conf } from "@/setup/config";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";

interface ProxyEditProps {
  proxyUrls: string[] | null;
  setProxyUrls: Dispatch<SetStateAction<string[] | null>>;
  proxyTmdb: boolean;
  setProxyTmdb: Dispatch<SetStateAction<boolean>>;
}

interface BackendEditProps {
  backendUrl: string | null;
  setBackendUrl: Dispatch<SetStateAction<string | null>>;
}

interface FebboxKeyProps {
  febboxKey: string | null;
  setFebboxKey: Dispatch<SetStateAction<string | null>>;
}

interface RealDebridKeyProps {
  realDebridKey: string | null;
  setRealDebridKey: Dispatch<SetStateAction<string | null>>;
}

function ProxyEdit({
  proxyUrls,
  setProxyUrls,
  proxyTmdb,
  setProxyTmdb,
}: ProxyEditProps) {
  const { t } = useTranslation();
  const add = useCallback(() => {
    setProxyUrls((s) => [...(s ?? []), ""]);
  }, [setProxyUrls]);

  const changeItem = useCallback(
    (index: number, val: string) => {
      setProxyUrls((s) => [
        ...(s ?? []).map((v, i) => {
          if (i !== index) return v;
          return val;
        }),
      ]);
    },
    [setProxyUrls],
  );

  const removeItem = useCallback(
    (index: number) => {
      setProxyUrls((s) => [...(s ?? []).filter((v, i) => i !== index)]);
    },
    [setProxyUrls],
  );

  const toggleProxyUrls = useCallback(() => {
    const newValue = proxyUrls === null ? [] : null;
    setProxyUrls(newValue);
    // Disable TMDB proxying when proxy workers are disabled
    if (newValue === null) setProxyTmdb(false);
  }, [proxyUrls, setProxyUrls, setProxyTmdb]);

  return (
    <SettingsCard>
      <div className="flex justify-between items-center gap-4">
        <div className="my-3">
          <p className="text-white font-bold mb-3">
            {t("settings.connections.workers.label")}
          </p>
          <p className="max-w-[30rem] font-medium">
            <Trans i18nKey="settings.connections.workers.description">
              <MwLink to="https://docs.pstream.mov/proxy/deploy">
                {t("settings.connections.workers.documentation")}
              </MwLink>
            </Trans>
          </p>
        </div>
        <div>
          <Toggle onClick={toggleProxyUrls} enabled={proxyUrls !== null} />
        </div>
      </div>
      {proxyUrls !== null ? (
        <>
          <Divider marginClass="my-6 px-8 box-content -mx-8" />
          <p className="text-white font-bold mb-3">
            {t("settings.connections.workers.urlLabel")}
          </p>

          <div className="my-6 space-y-2 max-w-md">
            {(proxyUrls?.length ?? 0) === 0 ? (
              <p>{t("settings.connections.workers.emptyState")}</p>
            ) : null}
            {(proxyUrls ?? []).map((v, i) => (
              <div
                // not the best but we can live with it
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="grid grid-cols-[1fr,auto] items-center gap-2"
              >
                <AuthInputBox
                  value={v}
                  onChange={(val) => changeItem(i, val)}
                  placeholder={
                    t("settings.connections.workers.urlPlaceholder") ??
                    undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="h-full scale-90 hover:scale-100 rounded-full aspect-square bg-authentication-inputBg hover:bg-authentication-inputBgHover flex justify-center items-center transition-transform duration-200 hover:text-white cursor-pointer"
                >
                  <Icon className="text-xl" icon={Icons.X} />
                </button>
              </div>
            ))}
          </div>

          <Button theme="purple" onClick={add}>
            {t("settings.connections.workers.addButton")}
          </Button>
          <Divider marginClass="my-6 px-8 box-content -mx-8" />

          <div className="flex justify-between items-center gap-4">
            <div className="my-3">
              <p className="text-white font-bold mb-3">
                {t("settings.connections.workers.proxyTMDB.title")}
              </p>
              <p className="max-w-[30rem] font-medium">
                {t("settings.connections.workers.proxyTMDB.description")}
              </p>
            </div>
            <div>
              <Toggle
                enabled={proxyTmdb}
                onClick={() => setProxyTmdb(!proxyTmdb)}
              />
            </div>
          </div>
        </>
      ) : null}
    </SettingsCard>
  );
}

function BackendEdit({ backendUrl, setBackendUrl }: BackendEditProps) {
  const { t } = useTranslation();
  const user = useAuthStore();
  return (
    <SettingsCard>
      <div className="flex justify-between items-center gap-4">
        <div className="my-3">
          <p className="text-white font-bold mb-3">
            {t("settings.connections.server.label")}
          </p>
          <p className="max-w-[30rem] font-medium">
            <Trans i18nKey="settings.connections.server.description">
              <MwLink to="https://docs.pstream.mov/backend/deploy">
                {t("settings.connections.server.documentation")}
              </MwLink>
            </Trans>
          </p>
          {user.account && (
            <div>
              <br />
              <p className="max-w-[30rem] font-medium">
                <Trans i18nKey="settings.connections.server.migration.description">
                  <MwLink to="/migration">
                    {t("settings.connections.server.migration.link")}
                  </MwLink>
                </Trans>
              </p>
            </div>
          )}
        </div>
        <div>
          <Toggle
            onClick={() => setBackendUrl((s) => (s === null ? "" : null))}
            enabled={backendUrl !== null}
          />
        </div>
      </div>
      {backendUrl !== null ? (
        <>
          <Divider marginClass="my-6 px-8 box-content -mx-8" />
          <p className="text-white font-bold mb-3">
            {t("settings.connections.server.urlLabel")}
          </p>
          <AuthInputBox
            onChange={setBackendUrl}
            value={backendUrl ?? ""}
            placeholder="https://"
          />
        </>
      ) : null}
    </SettingsCard>
  );
}

async function getFebboxKeyStatus(febboxKey: string | null) {
  if (febboxKey) {
    const status: Status = await testFebboxKey(febboxKey);
    return status;
  }
  return "unset";
}

function FebboxKeyEdit({ febboxKey, setFebboxKey }: FebboxKeyProps) {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);
  const user = useAuthStore();
  const preferences = usePreferencesStore();
  const exampleModal = useModal("febbox-example-settings");

  // Enable febbox token when account is loaded and we have a token
  useEffect(() => {
    if (user.account && febboxKey === null && preferences.febboxKey) {
      setFebboxKey(preferences.febboxKey);
    }
  }, [user.account, febboxKey, preferences.febboxKey, setFebboxKey]);

  const [status, setStatus] = useState<Status>("unset");
  const statusMap: Record<Status, StatusCircleProps["type"]> = {
    error: "error",
    success: "success",
    unset: "noresult",
    api_down: "error",
    invalid_token: "error",
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const result = await getFebboxKeyStatus(febboxKey);
      setStatus(result);
    };
    checkTokenStatus();
  }, [febboxKey]);

  if (conf().ALLOW_FEBBOX_KEY) {
    return (
      <>
        <SettingsCard>
          <div className="flex justify-between items-center gap-4">
            <div className="my-3">
              <p className="text-white font-bold mb-3">
                {t("fedapi.onboarding.title")}
              </p>
              <p className="max-w-[30rem] font-medium">
                <Trans i18nKey="fedapi.onboarding.description" />
              </p>
            </div>
            <div>
              <Toggle
                onClick={() => setFebboxKey((s) => (s === null ? "" : null))}
                enabled={febboxKey !== null}
              />
            </div>
          </div>
          {febboxKey !== null ? (
            <>
              <Divider marginClass="my-6 px-8 box-content -mx-8" />

              <div className="my-3">
                <p className="max-w-[30rem] font-medium">
                  {t("fedapi.setup.title")}
                  <br />
                  <div
                    onClick={() => setShowVideo(!showVideo)}
                    className="flex items-center justify-between p-1 px-2 my-2 w-fit border border-type-secondary rounded-lg cursor-pointer text-type-secondary hover:text-white transition-colors duration-200"
                  >
                    <span className="text-sm">
                      {showVideo
                        ? t("fedapi.setup.hideVideo")
                        : t("fedapi.setup.showVideo")}
                    </span>
                    {showVideo ? (
                      <Icon icon={Icons.CHEVRON_UP} className="pl-1" />
                    ) : (
                      <Icon icon={Icons.CHEVRON_DOWN} className="pl-1" />
                    )}
                  </div>
                  {showVideo && (
                    <>
                      <div className="relative pt-[56.25%] mt-2">
                        <iframe
                          src="https://player.vimeo.com/video/1059834885?h=c3ab398d42&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                          className="absolute top-0 left-0 w-full h-full border border-type-secondary rounded-lg bg-black"
                          title="P-Stream FED API Setup Tutorial"
                        />
                      </div>
                      <br />
                    </>
                  )}
                  <Trans i18nKey="fedapi.setup.step.1">
                    <MwLink url="https://febbox.com" />
                  </Trans>
                  <br />
                  <Trans i18nKey="fedapi.setup.step.2" />
                  <br />
                  <Trans i18nKey="fedapi.setup.step.3" />
                  <br />
                  <Trans i18nKey="fedapi.setup.step.4" />{" "}
                  <button
                    type="button"
                    onClick={exampleModal.show}
                    className="text-type-link hover:text-type-linkHover"
                  >
                    <Trans i18nKey="fedapi.setup.tokenExample.button" />
                  </button>
                  <br />
                  <Trans i18nKey="fedapi.setup.step.5" />
                </p>
                <p className="text-type-danger mt-2">
                  <Trans i18nKey="fedapi.setup.step.warning" />
                </p>
              </div>

              <Divider marginClass="my-6 px-8 box-content -mx-8" />
              <p className="text-white font-bold">
                {t("settings.connections.febbox.tokenLabel", "Token")}
              </p>
              <div className="flex items-center w-full">
                <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
                <AuthInputBox
                  onChange={(newToken) => {
                    setFebboxKey(newToken);
                  }}
                  value={febboxKey ?? ""}
                  placeholder="eyJ0eXAi..."
                  passwordToggleable
                  className="flex-grow"
                />
              </div>
              {status === "error" && (
                <p className="text-type-danger mt-4">
                  {t("fedapi.status.failure")}
                </p>
              )}
              {status === "api_down" && (
                <p className="text-type-danger mt-4">
                  {t("fedapi.status.api_down")}
                </p>
              )}
              {status === "invalid_token" && (
                <p className="text-type-danger mt-4">
                  {t("fedapi.status.invalid_token")}
                </p>
              )}
            </>
          ) : null}
        </SettingsCard>
        <Modal id={exampleModal.id}>
          <ModalCard>
            <Heading2 className="!mt-0 !mb-4 !text-2xl">
              {t("fedapi.setup.tokenExample.title")}
            </Heading2>
            <Paragraph className="!mt-1 !mb-6">
              {t("fedapi.setup.tokenExample.description")}
            </Paragraph>
            <div className="bg-authentication-inputBg p-4 rounded-lg mb-6 font-mono text-sm break-all">
              eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDc1MTI2MTksIm5iZiI6MTc0NzUxMjYxOSwiZXhwIjoxNzc4NjE2NjM5LCJkYXRhIjp7InVpZCI6NTI1NTc3LCsudujeI6IjE4NTQ4NmEwMzBjMGNlMWJjY2IzYWJjMjI2OTYwYzQ4dhdhs.qkuTF2aVPu54S0RFJS_ca7rlHuGz_Fe6kWkBydYQoCg
            </div>
            <Paragraph className="!mt-1 !mb-6 text-type-danger">
              {t("fedapi.setup.tokenExample.warning")}
            </Paragraph>
            <div className="flex justify-end">
              <Button theme="secondary" onClick={exampleModal.hide}>
                {t("fedapi.setup.tokenExample.close")}
              </Button>
            </div>
          </ModalCard>
        </Modal>
      </>
    );
  }
}

async function getRealDebridKeyStatus(realDebridKey: string | null) {
  if (realDebridKey) {
    const status: Status = await testRealDebridKey(realDebridKey);
    return status;
  }
  return "unset";
}

function RealDebridKeyEdit({
  realDebridKey,
  setRealDebridKey,
}: RealDebridKeyProps) {
  const { t } = useTranslation();
  const user = useAuthStore();
  const preferences = usePreferencesStore();

  // Enable Real Debrid token when account is loaded and we have a token
  useEffect(() => {
    if (user.account && realDebridKey === null && preferences.realDebridKey) {
      setRealDebridKey(preferences.realDebridKey);
    }
  }, [
    user.account,
    realDebridKey,
    preferences.realDebridKey,
    setRealDebridKey,
  ]);

  const [status, setStatus] = useState<Status>("unset");
  const statusMap: Record<Status, StatusCircleProps["type"]> = {
    error: "error",
    success: "success",
    unset: "noresult",
    api_down: "error",
    invalid_token: "error",
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const result = await getRealDebridKeyStatus(realDebridKey);
      setStatus(result);
    };
    checkTokenStatus();
  }, [realDebridKey]);

  if (conf().ALLOW_REAL_DEBRID_KEY) {
    return (
      <SettingsCard>
        <div className="flex justify-between items-center gap-4">
          <div className="my-3">
            <p className="text-white font-bold mb-3">{t("realdebrid.title")}</p>
            <p className="max-w-[30rem] font-medium">
              {t("realdebrid.description")}
            </p>
            <MwLink>
              <a
                href="https://real-debrid.com/"
                target="_blank"
                rel="noreferrer"
              >
                real-debrid.com
              </a>
            </MwLink>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              onClick={() => setRealDebridKey((s) => (s === null ? "" : null))}
              enabled={realDebridKey !== null}
            />
          </div>
        </div>
        {realDebridKey !== null ? (
          <>
            <Divider marginClass="my-6 px-8 box-content -mx-8" />
            <p className="text-white font-bold mb-3">
              {t("realdebrid.tokenLabel")}
            </p>
            <div className="flex items-center w-full">
              <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
              <AuthInputBox
                onChange={(newToken) => {
                  setRealDebridKey(newToken);
                }}
                value={realDebridKey ?? ""}
                placeholder="ABC123..."
                passwordToggleable
                className="flex-grow"
              />
            </div>
            {status === "error" && (
              <p className="text-type-danger mt-4">
                {t("realdebrid.status.failure")}
              </p>
            )}
            {status === "api_down" && (
              <p className="text-type-danger mt-4">
                {t("realdebrid.status.api_down")}
              </p>
            )}
            {status === "invalid_token" && (
              <p className="text-type-danger mt-4">
                {t("realdebrid.status.invalid_token")}
              </p>
            )}
          </>
        ) : null}
      </SettingsCard>
    );
  }
  return null;
}

export function ConnectionsPart(
  props: BackendEditProps &
    ProxyEditProps &
    FebboxKeyProps &
    RealDebridKeyProps,
) {
  const { t } = useTranslation();
  return (
    <div>
      <Heading1 border>{t("settings.connections.title")}</Heading1>
      <div className="space-y-6">
        <SetupPart /> {/* I was wondering what happened to this badddev >:( */}
        <ProxyEdit
          proxyUrls={props.proxyUrls}
          setProxyUrls={props.setProxyUrls}
          proxyTmdb={props.proxyTmdb}
          setProxyTmdb={props.setProxyTmdb}
        />
        <BackendEdit
          backendUrl={props.backendUrl}
          setBackendUrl={props.setBackendUrl}
        />
        <RealDebridKeyEdit
          realDebridKey={props.realDebridKey}
          setRealDebridKey={props.setRealDebridKey}
        />
        <FebboxKeyEdit
          febboxKey={props.febboxKey}
          setFebboxKey={props.setFebboxKey}
        />
      </div>
    </div>
  );
}
