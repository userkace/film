import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncFn } from "react-use";

import {
  base64ToBuffer,
  decryptData,
  encryptData,
} from "@/backend/accounts/crypto";
import { getSessions, updateSession } from "@/backend/accounts/sessions";
import { getSettings, updateSettings } from "@/backend/accounts/settings";
import { editUser } from "@/backend/accounts/user";
import { getAllProviders } from "@/backend/providers/providers";
import { Button } from "@/components/buttons/Button";
import { WideContainer } from "@/components/layout/WideContainer";
import { UserIcons } from "@/components/UserIcon";
import { Heading1 } from "@/components/utils/Text";
import { Transition } from "@/components/utils/Transition";
import { useAuth } from "@/hooks/auth/useAuth";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettingsState } from "@/hooks/useSettingsState";
import { AccountActionsPart } from "@/pages/parts/settings/AccountActionsPart";
import { AccountEditPart } from "@/pages/parts/settings/AccountEditPart";
import { AppearancePart } from "@/pages/parts/settings/AppearancePart";
import { CaptionsPart } from "@/pages/parts/settings/CaptionsPart";
import { ConnectionsPart } from "@/pages/parts/settings/ConnectionsPart";
import { DeviceListPart } from "@/pages/parts/settings/DeviceListPart";
import { RegisterCalloutPart } from "@/pages/parts/settings/RegisterCalloutPart";
import { SidebarPart } from "@/pages/parts/settings/SidebarPart";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { AccountWithToken, useAuthStore } from "@/stores/auth";
import { useLanguageStore } from "@/stores/language";
import { usePreferencesStore } from "@/stores/preferences";
import { useSubtitleStore } from "@/stores/subtitles";
import { usePreviewThemeStore, useThemeStore } from "@/stores/theme";

import { SubPageLayout } from "./layouts/SubPageLayout";
import { AdminPanelPart } from "./parts/settings/AdminPanel";
import { PreferencesPart } from "./parts/settings/PreferencesPart";

function SettingsLayout(props: { children: React.ReactNode }) {
  const { isMobile } = useIsMobile();

  return (
    <WideContainer ultraWide classNames="overflow-visible">
      <div
        className={classNames(
          "grid gap-12",
          isMobile ? "grid-cols-1" : "lg:grid-cols-[280px,1fr]",
        )}
      >
        <SidebarPart />
        <div>{props.children}</div>
      </div>
    </WideContainer>
  );
}

export function AccountSettings(props: {
  account: AccountWithToken;
  deviceName: string;
  setDeviceName: (s: string) => void;
  colorA: string;
  setColorA: (s: string) => void;
  colorB: string;
  setColorB: (s: string) => void;
  userIcon: UserIcons;
  setUserIcon: (s: UserIcons) => void;
}) {
  const url = useBackendUrl();
  const { account } = props;
  const [sessionsResult, execSessions] = useAsyncFn(() => {
    if (!url) return Promise.resolve([]);
    return getSessions(url, account);
  }, [account, url]);
  useEffect(() => {
    execSessions();
  }, [execSessions]);

  return (
    <>
      <AccountEditPart
        deviceName={props.deviceName}
        setDeviceName={props.setDeviceName}
        colorA={props.colorA}
        setColorA={props.setColorA}
        colorB={props.colorB}
        setColorB={props.setColorB}
        userIcon={props.userIcon}
        setUserIcon={props.setUserIcon}
      />
      <DeviceListPart
        error={!!sessionsResult.error}
        loading={sessionsResult.loading}
        sessions={sessionsResult.value ?? []}
        onChange={execSessions}
      />
      <AccountActionsPart />
    </>
  );
}

export function SettingsPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const { t } = useTranslation();
  const activeTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const previewTheme = usePreviewThemeStore((s) => s.previewTheme);
  const setPreviewTheme = usePreviewThemeStore((s) => s.setPreviewTheme);

  const appLanguage = useLanguageStore((s) => s.language);
  const setAppLanguage = useLanguageStore((s) => s.setLanguage);

  const subStyling = useSubtitleStore((s) => s.styling);
  const setSubStyling = useSubtitleStore((s) => s.updateStyling);

  const proxySet = useAuthStore((s) => s.proxySet);
  const setProxySet = useAuthStore((s) => s.setProxySet);

  const backendUrlSetting = useAuthStore((s) => s.backendUrl);
  const setBackendUrl = useAuthStore((s) => s.setBackendUrl);

  const febboxKey = usePreferencesStore((s) => s.febboxKey);
  const setFebboxKey = usePreferencesStore((s) => s.setFebboxKey);

  const realDebridKey = usePreferencesStore((s) => s.realDebridKey);
  const setRealDebridKey = usePreferencesStore((s) => s.setRealDebridKey);

  const enableThumbnails = usePreferencesStore((s) => s.enableThumbnails);
  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);

  const enableAutoplay = usePreferencesStore((s) => s.enableAutoplay);
  const setEnableAutoplay = usePreferencesStore((s) => s.setEnableAutoplay);

  const enableSkipCredits = usePreferencesStore((s) => s.enableSkipCredits);
  const setEnableSkipCredits = usePreferencesStore(
    (s) => s.setEnableSkipCredits,
  );

  const sourceOrder = usePreferencesStore((s) => s.sourceOrder);
  const setSourceOrder = usePreferencesStore((s) => s.setSourceOrder);

  const enableDiscover = usePreferencesStore((s) => s.enableDiscover);
  const setEnableDiscover = usePreferencesStore((s) => s.setEnableDiscover);

  const enableFeatured = usePreferencesStore((s) => s.enableFeatured);
  const setEnableFeatured = usePreferencesStore((s) => s.setEnableFeatured);

  const enableDetailsModal = usePreferencesStore((s) => s.enableDetailsModal);
  const setEnableDetailsModal = usePreferencesStore(
    (s) => s.setEnableDetailsModal,
  );

  const enableImageLogos = usePreferencesStore((s) => s.enableImageLogos);
  const setEnableImageLogos = usePreferencesStore((s) => s.setEnableImageLogos);

  const enableSourceOrder = usePreferencesStore((s) => s.enableSourceOrder);
  const setEnableSourceOrder = usePreferencesStore(
    (s) => s.setEnableSourceOrder,
  );

  const proxyTmdb = usePreferencesStore((s) => s.proxyTmdb);
  const setProxyTmdb = usePreferencesStore((s) => s.setProxyTmdb);

  const enableCarouselView = usePreferencesStore((s) => s.enableCarouselView);
  const setEnableCarouselView = usePreferencesStore(
    (s) => s.setEnableCarouselView,
  );

  const forceCompactEpisodeView = usePreferencesStore(
    (s) => s.forceCompactEpisodeView,
  );
  const setForceCompactEpisodeView = usePreferencesStore(
    (s) => s.setForceCompactEpisodeView,
  );

  const enableLowPerformanceMode = usePreferencesStore(
    (s) => s.enableLowPerformanceMode,
  );
  const setEnableLowPerformanceMode = usePreferencesStore(
    (s) => s.setEnableLowPerformanceMode,
  );

  const account = useAuthStore((s) => s.account);
  const updateProfile = useAuthStore((s) => s.setAccountProfile);
  const updateDeviceName = useAuthStore((s) => s.updateDeviceName);
  const decryptedName = useMemo(() => {
    if (!account) return "";
    return decryptData(account.deviceName, base64ToBuffer(account.seed));
  }, [account]);

  const backendUrl = useBackendUrl();

  const { logout } = useAuth();
  const user = useAuthStore();

  useEffect(() => {
    const loadSettings = async () => {
      if (account && backendUrl) {
        const settings = await getSettings(backendUrl, account);
        if (settings.febboxKey) {
          setFebboxKey(settings.febboxKey);
        }
        if (settings.realDebridKey) {
          setRealDebridKey(settings.realDebridKey);
        }
      }
    };
    loadSettings();
  }, [account, backendUrl, setFebboxKey, setRealDebridKey]);

  const state = useSettingsState(
    activeTheme,
    appLanguage,
    subStyling,
    decryptedName,
    proxySet,
    backendUrlSetting,
    febboxKey,
    realDebridKey,
    account ? account.profile : undefined,
    enableThumbnails,
    enableAutoplay,
    enableDiscover,
    enableFeatured,
    enableDetailsModal,
    sourceOrder,
    enableSourceOrder,
    proxyTmdb,
    enableSkipCredits,
    enableImageLogos,
    enableCarouselView,
    forceCompactEpisodeView,
    enableLowPerformanceMode,
  );

  const availableSources = useMemo(() => {
    const sources = getAllProviders().listSources();
    const sourceIDs = sources.map((s) => s.id);
    const stateSources = state.sourceOrder.state;

    // Filter out sources that are not in `stateSources` and are in `sources`
    const updatedSources = stateSources.filter((ss) => sourceIDs.includes(ss));

    // Add sources from `sources` that are not in `stateSources`
    const missingSources = sources
      .filter((s) => !stateSources.includes(s.id))
      .map((s) => s.id);

    return [...updatedSources, ...missingSources];
  }, [state.sourceOrder.state]);

  useEffect(() => {
    setPreviewTheme(activeTheme ?? "default");
  }, [setPreviewTheme, activeTheme]);

  useEffect(() => {
    // Clear preview theme on unmount
    return () => {
      setPreviewTheme(null);
    };
  }, [setPreviewTheme]);

  const setThemeWithPreview = useCallback(
    (theme: string) => {
      state.theme.set(theme === "default" ? null : theme);
      setPreviewTheme(theme);
    },
    [state.theme, setPreviewTheme],
  );

  const saveChanges = useCallback(async () => {
    if (account && backendUrl) {
      if (
        state.appLanguage.changed ||
        state.theme.changed ||
        state.proxyUrls.changed ||
        state.febboxKey.changed ||
        state.realDebridKey.changed ||
        state.enableThumbnails.changed ||
        state.enableAutoplay.changed ||
        state.enableSkipCredits.changed ||
        state.enableDiscover.changed ||
        state.enableFeatured.changed ||
        state.enableDetailsModal.changed ||
        state.enableImageLogos.changed ||
        state.sourceOrder.changed ||
        state.enableSourceOrder.changed ||
        state.proxyTmdb.changed ||
        state.enableCarouselView.changed ||
        state.forceCompactEpisodeView.changed ||
        state.enableLowPerformanceMode.changed
      ) {
        await updateSettings(backendUrl, account, {
          applicationLanguage: state.appLanguage.state,
          applicationTheme: state.theme.state,
          proxyUrls: state.proxyUrls.state?.filter((v) => v !== "") ?? null,
          febboxKey: state.febboxKey.state,
          realDebridKey: state.realDebridKey.state,
          enableThumbnails: state.enableThumbnails.state,
          enableAutoplay: state.enableAutoplay.state,
          enableSkipCredits: state.enableSkipCredits.state,
          enableDiscover: state.enableDiscover.state,
          enableFeatured: state.enableFeatured.state,
          enableDetailsModal: state.enableDetailsModal.state,
          enableImageLogos: state.enableImageLogos.state,
          sourceOrder: state.sourceOrder.state,
          enableSourceOrder: state.enableSourceOrder.state,
          proxyTmdb: state.proxyTmdb.state,
          enableCarouselView: state.enableCarouselView.state,
          forceCompactEpisodeView: state.forceCompactEpisodeView.state,
          enableLowPerformanceMode: state.enableLowPerformanceMode.state,
        });
      }
      if (state.deviceName.changed) {
        const newDeviceName = await encryptData(
          state.deviceName.state,
          base64ToBuffer(account.seed),
        );
        await updateSession(backendUrl, account, {
          deviceName: newDeviceName,
        });
        updateDeviceName(newDeviceName);
      }
      if (state.profile.changed) {
        await editUser(backendUrl, account, {
          profile: state.profile.state,
        });
      }
    }

    setEnableThumbnails(state.enableThumbnails.state);
    setEnableAutoplay(state.enableAutoplay.state);
    setEnableSkipCredits(state.enableSkipCredits.state);
    setEnableDiscover(state.enableDiscover.state);
    setEnableFeatured(state.enableFeatured.state);
    setEnableDetailsModal(state.enableDetailsModal.state);
    setEnableImageLogos(state.enableImageLogos.state);
    setSourceOrder(state.sourceOrder.state);
    setAppLanguage(state.appLanguage.state);
    setTheme(state.theme.state);
    setSubStyling(state.subtitleStyling.state);
    setProxySet(state.proxyUrls.state?.filter((v) => v !== "") ?? null);
    setEnableSourceOrder(state.enableSourceOrder.state);
    setFebboxKey(state.febboxKey.state);
    setRealDebridKey(state.realDebridKey.state);
    setProxyTmdb(state.proxyTmdb.state);
    setEnableCarouselView(state.enableCarouselView.state);
    setForceCompactEpisodeView(state.forceCompactEpisodeView.state);
    setEnableLowPerformanceMode(state.enableLowPerformanceMode.state);

    if (state.profile.state) {
      updateProfile(state.profile.state);
    }

    // when backend url gets changed, log the user out first
    if (state.backendUrl.changed) {
      await logout();

      let url = state.backendUrl.state;
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

      setBackendUrl(url);
    }
  }, [
    account,
    backendUrl,
    setEnableThumbnails,
    setFebboxKey,
    setRealDebridKey,
    state,
    setEnableAutoplay,
    setEnableSkipCredits,
    setEnableDiscover,
    setEnableFeatured,
    setEnableDetailsModal,
    setEnableImageLogos,
    setSourceOrder,
    setAppLanguage,
    setTheme,
    setSubStyling,
    setProxySet,
    updateDeviceName,
    updateProfile,
    logout,
    setBackendUrl,
    setEnableSourceOrder,
    setProxyTmdb,
    setEnableCarouselView,
    setForceCompactEpisodeView,
    setEnableLowPerformanceMode,
  ]);
  return (
    <SubPageLayout>
      <PageTitle subpage k="global.pages.settings" />
      <SettingsLayout>
        <div id="settings-account">
          <Heading1 border className="!mb-0">
            {t("settings.account.title")}
          </Heading1>
          {user.account && state.profile.state ? (
            <AccountSettings
              account={user.account}
              deviceName={state.deviceName.state}
              setDeviceName={state.deviceName.set}
              colorA={state.profile.state.colorA}
              setColorA={(v) => {
                state.profile.set((s) => (s ? { ...s, colorA: v } : undefined));
              }}
              colorB={state.profile.state.colorB}
              setColorB={(v) =>
                state.profile.set((s) => (s ? { ...s, colorB: v } : undefined))
              }
              userIcon={state.profile.state.icon as any}
              setUserIcon={(v) =>
                state.profile.set((s) => (s ? { ...s, icon: v } : undefined))
              }
            />
          ) : (
            <RegisterCalloutPart />
          )}
        </div>
        <div className="mt-10">
          <AdminPanelPart />
        </div>
        <div id="settings-preferences" className="mt-28">
          <PreferencesPart
            language={state.appLanguage.state}
            setLanguage={state.appLanguage.set}
            enableThumbnails={state.enableThumbnails.state}
            setEnableThumbnails={state.enableThumbnails.set}
            enableAutoplay={state.enableAutoplay.state}
            setEnableAutoplay={state.enableAutoplay.set}
            enableSkipCredits={state.enableSkipCredits.state}
            setEnableSkipCredits={state.enableSkipCredits.set}
            sourceOrder={availableSources}
            setSourceOrder={state.sourceOrder.set}
            enableSourceOrder={state.enableSourceOrder.state}
            setenableSourceOrder={state.enableSourceOrder.set}
            enableLowPerformanceMode={state.enableLowPerformanceMode.state}
            setEnableLowPerformanceMode={state.enableLowPerformanceMode.set}
          />
        </div>
        <div id="settings-appearance" className="mt-28">
          <AppearancePart
            active={previewTheme ?? "default"}
            inUse={activeTheme ?? "default"}
            setTheme={setThemeWithPreview}
            enableDiscover={state.enableDiscover.state}
            setEnableDiscover={state.enableDiscover.set}
            enableFeatured={state.enableFeatured.state}
            setEnableFeatured={state.enableFeatured.set}
            enableDetailsModal={state.enableDetailsModal.state}
            setEnableDetailsModal={state.enableDetailsModal.set}
            enableImageLogos={state.enableImageLogos.state}
            setEnableImageLogos={state.enableImageLogos.set}
            enableCarouselView={state.enableCarouselView.state}
            setEnableCarouselView={state.enableCarouselView.set}
            forceCompactEpisodeView={state.forceCompactEpisodeView.state}
            setForceCompactEpisodeView={state.forceCompactEpisodeView.set}
            enableLowPerformanceMode={state.enableLowPerformanceMode.state}
          />
        </div>
        <div id="settings-captions" className="mt-28">
          <CaptionsPart
            styling={state.subtitleStyling.state}
            setStyling={state.subtitleStyling.set}
          />
        </div>
        <div id="settings-connection" className="mt-28">
          <ConnectionsPart
            backendUrl={state.backendUrl.state}
            setBackendUrl={state.backendUrl.set}
            proxyUrls={state.proxyUrls.state}
            setProxyUrls={state.proxyUrls.set}
            febboxKey={state.febboxKey.state}
            setFebboxKey={state.febboxKey.set}
            realDebridKey={state.realDebridKey.state}
            setRealDebridKey={state.realDebridKey.set}
            proxyTmdb={state.proxyTmdb.state}
            setProxyTmdb={state.proxyTmdb.set}
          />
        </div>
      </SettingsLayout>
      <Transition
        animation="fade"
        show={state.changed}
        className="bg-settings-saveBar-background border-t border-settings-card-border/50 py-4 transition-opacity w-full fixed bottom-0 flex justify-between flex-col md:flex-row px-8 items-start md:items-center gap-3 z-[999]"
      >
        <p className="text-type-danger">{t("settings.unsaved")}</p>
        <div className="space-x-3 w-full md:w-auto flex">
          <Button
            className="w-full md:w-auto"
            theme="secondary"
            onClick={state.reset}
          >
            {t("settings.reset")}
          </Button>
          <Button
            className="w-full md:w-auto"
            theme="purple"
            onClick={saveChanges}
          >
            {t("settings.save")}
          </Button>
        </div>
      </Transition>
    </SubPageLayout>
  );
}

export default SettingsPage;
