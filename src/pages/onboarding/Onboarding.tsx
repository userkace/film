import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { SettingsCard } from "@/components/layout/SettingsCard";
import { Stepper } from "@/components/layout/Stepper";
import { BiggerCenterContainer } from "@/components/layout/ThinContainer";
import { VerticalLine } from "@/components/layout/VerticalLine";
import {
  FancyModal,
  Modal,
  ModalCard,
  useModal,
} from "@/components/overlays/Modal";
import {
  StatusCircle,
  StatusCircleProps,
} from "@/components/player/internals/StatusCircle";
import { MwLink } from "@/components/text/Link";
import { AuthInputBox } from "@/components/text-inputs/AuthInputBox";
import { Divider } from "@/components/utils/Divider";
import { Ol } from "@/components/utils/Ol";
import {
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
} from "@/components/utils/Text";
import { MinimalPageLayout } from "@/pages/layouts/MinimalPageLayout";
import {
  useNavigateOnboarding,
  useRedirectBack,
} from "@/pages/onboarding/onboardingHooks";
import {
  Card,
  CardContent,
  Link,
  MiniCardContent,
} from "@/pages/onboarding/utils";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { conf } from "@/setup/config";
import { usePreferencesStore } from "@/stores/preferences";
import { getProxyUrls } from "@/utils/proxyUrls";

import { RegionSelectorPart } from "../parts/settings/RegionSelectorPart";
import {
  Status,
  testFebboxKey,
  testRealDebridKey,
} from "../parts/settings/SetupPart";

async function getFebboxKeyStatus(febboxKey: string | null) {
  if (febboxKey) {
    const status: Status = await testFebboxKey(febboxKey);
    return status;
  }
  return "unset";
}

export function FEDAPISetup() {
  const { t } = useTranslation();
  const febboxKey = usePreferencesStore((s) => s.febboxKey);
  const setFebboxKey = usePreferencesStore((s) => s.setFebboxKey);
  const exampleModal = useModal("febbox-example");

  // Initialize isExpanded based on whether febboxKey has a value
  const [isExpanded, setIsExpanded] = useState(
    febboxKey !== null && febboxKey !== "",
  );

  // Add a separate effect to set the initial state
  useEffect(() => {
    // If we have a valid key, make sure the section is expanded
    if (febboxKey && febboxKey.length > 0) {
      setIsExpanded(true);
    }
  }, [febboxKey]);

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

  // Toggle handler that preserves the key
  const toggleExpanded = () => {
    if (isExpanded) {
      // Store the key temporarily instead of setting to null
      setFebboxKey("");
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const [showVideo, setShowVideo] = useState(false);

  if (conf().ALLOW_FEBBOX_KEY) {
    return (
      <>
        <div className="mt-6">
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
                <Toggle onClick={toggleExpanded} enabled={isExpanded} />
              </div>
            </div>
            {isExpanded ? (
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
                            title="film.kace.dev FED API Setup Tutorial"
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
                <p className="text-white font-bold mb-3">
                  {t("fedapi.setup.tokenLabel")}
                </p>
                <div className="flex items-center w-full gap-4">
                  <StatusCircle type={statusMap[status]} className="mx-2" />
                  <AuthInputBox
                    onChange={(newToken) => {
                      setFebboxKey(newToken);
                    }}
                    value={febboxKey ?? ""}
                    placeholder="eyJ0eXAi..."
                    passwordToggleable
                    className="flex-grow"
                  />
                  <RegionSelectorPart />
                </div>
                {status === "error" && (
                  <p className="text-type-danger mt-4">
                    {t("fedapi.status.failure")}
                  </p>
                )}
                {status === "api_down" && (
                  <p className="text-type-danger mt-4">
                    {t(
                      "fedapi.status.api_down",
                      "Febbox API is currently unavailable. Please try again later.",
                    )}
                  </p>
                )}
                {status === "invalid_token" && (
                  <p className="text-type-danger mt-4">
                    {t(
                      "fedapi.status.invalid_token",
                      "Invalid token. Please check your Febbox UI token.",
                    )}
                  </p>
                )}
              </>
            ) : null}
          </SettingsCard>
        </div>
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

export function RealDebridSetup() {
  const { t } = useTranslation();
  const realDebridKey = usePreferencesStore((s) => s.realDebridKey);
  const setRealDebridKey = usePreferencesStore((s) => s.setRealDebridKey);

  // Initialize isExpanded based on whether realDebridKey has a value
  const [isExpanded, setIsExpanded] = useState(
    realDebridKey !== null && realDebridKey !== "",
  );

  // Add a separate effect to set the initial state
  useEffect(() => {
    // If we have a valid key, make sure the section is expanded
    if (realDebridKey && realDebridKey.length > 0) {
      setIsExpanded(true);
    }
  }, [realDebridKey]);

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

  // Toggle handler that preserves the key
  const toggleExpanded = () => {
    if (isExpanded) {
      // Store the key temporarily instead of setting to null
      setRealDebridKey("");
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  if (conf().ALLOW_REAL_DEBRID_KEY) {
    return (
      <div className="mt-6">
        <SettingsCard>
          <div className="flex justify-between items-center gap-4">
            <div className="my-3">
              <p className="text-white font-bold mb-3">
                {t("settings.connections.realdebrid.title", "Real Debrid API")}
              </p>
              <p className="max-w-[30rem] font-medium">
                {t(
                  "settings.connections.realdebrid.description",
                  "Enter your Real Debrid API key to access premium sources.",
                )}
              </p>
            </div>
            <div>
              <Toggle onClick={toggleExpanded} enabled={isExpanded} />
            </div>
          </div>
          {isExpanded ? (
            <>
              <Divider marginClass="my-6 px-8 box-content -mx-8" />
              <p className="text-white font-bold mb-3">
                {t("settings.connections.realdebrid.tokenLabel", "API Key")}
              </p>
              <div className="flex items-center w-full">
                <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
                <AuthInputBox
                  onChange={(newToken) => {
                    setRealDebridKey(newToken);
                  }}
                  value={realDebridKey ?? ""}
                  placeholder="API Key"
                  passwordToggleable
                  className="flex-grow"
                />
              </div>
              {status === "error" && (
                <p className="text-type-danger mt-4">
                  {t(
                    "settings.connections.realdebrid.status.failure",
                    "Failed to connect to Real Debrid. Please check your API key.",
                  )}
                </p>
              )}
              {status === "api_down" && (
                <p className="text-type-danger mt-4">
                  {t(
                    "settings.connections.realdebrid.status.api_down",
                    "Real Debrid API is currently unavailable. Please try again later.",
                  )}
                </p>
              )}
              {status === "invalid_token" && (
                <p className="text-type-danger mt-4">
                  {t(
                    "settings.connections.realdebrid.status.invalid_token",
                    "Invalid API key or non-premium account. Real Debrid requires a premium account.",
                  )}
                </p>
              )}
            </>
          ) : null}
        </SettingsCard>
      </div>
    );
  }
  return null;
}

function Item(props: { title: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-white mb-2 font-medium">{props.title}</p>
      <div className="text-type-text">{props.children}</div>
    </>
  );
}

export function OnboardingPage() {
  const navigate = useNavigateOnboarding();
  const skipModal = useModal("skip");
  const infoModal = useModal("info");
  const { completeAndRedirect } = useRedirectBack();
  const { t } = useTranslation();
  const noProxies = getProxyUrls().length === 0;

  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent) &&
    !/Edg/.test(navigator.userAgent);

  return (
    <MinimalPageLayout>
      <PageTitle subpage k="global.pages.onboarding" />
      <Modal id={skipModal.id}>
        <ModalCard>
          <Heading1 className="!mt-0 !mb-4 !text-2xl">
            {t("onboarding.defaultConfirm.title")}
          </Heading1>
          <Paragraph className="!mt-1 !mb-12">
            {t("onboarding.defaultConfirm.description")}
          </Paragraph>
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between">
            <Button theme="secondary" onClick={skipModal.hide}>
              {t("onboarding.defaultConfirm.cancel")}
            </Button>
            <Button theme="purple" onClick={() => completeAndRedirect()}>
              {t("onboarding.defaultConfirm.confirm")}
            </Button>
          </div>
        </ModalCard>
      </Modal>
      <FancyModal
        id={infoModal.id}
        title={t("onboarding.start.moreInfo.title")}
        size="xl"
      >
        <Trans
          i18nKey="onboarding.start.moreInfo.explainer.intro"
          className="pb-4"
        />
        <div className="flex flex-col gap-4 md:flex-row py-8">
          <div className="md:w-1/2">
            <Heading3 className="font-normal">
              <Trans i18nKey="onboarding.start.moreInfo.recommended.title" />
            </Heading3>
            <Trans i18nKey="onboarding.start.moreInfo.recommended.subtitle" />
            <div className="space-y-4 pt-8 bg-mediaCard-hoverAccent/10 rounded-xl p-10 mt-6 mr-2 min-w-[20rem]">
              <Item
                title={t("onboarding.start.moreInfo.recommended.desktop.title")}
              >
                <Trans i18nKey="onboarding.start.moreInfo.recommended.desktop.description" />
              </Item>
              <Item
                title={t("onboarding.start.moreInfo.recommended.iOS.title")}
              >
                <Trans i18nKey="onboarding.start.moreInfo.recommended.iOS.description" />
              </Item>
              <Item
                title={t("onboarding.start.moreInfo.recommended.android.title")}
              >
                <Trans i18nKey="onboarding.start.moreInfo.recommended.android.description" />
              </Item>
            </div>
          </div>
          <div className="inline md:hidden">
            <Divider />
          </div>
          <div>
            <Ol
              items={[
                <Item
                  title={t("onboarding.start.moreInfo.explainer.extension")}
                >
                  {t(
                    "onboarding.start.moreInfo.explainer.extensionDescription",
                  )}
                </Item>,
                <Item title={t("onboarding.start.moreInfo.explainer.proxy")}>
                  {t("onboarding.start.moreInfo.explainer.proxyDescription")}
                </Item>,
                <Item title={t("onboarding.start.moreInfo.explainer.default")}>
                  {t("onboarding.start.moreInfo.explainer.defaultDescription")}
                </Item>,
              ].filter(Boolean)}
            />
            {conf().ALLOW_FEBBOX_KEY && (
              <div className="pt-12 pl-[3.2rem]">
                <Item
                  title={t("onboarding.start.moreInfo.explainer.fedapi.fedapi")}
                >
                  {t(
                    "onboarding.start.moreInfo.explainer.fedapi.fedapiDescription",
                  )}
                </Item>
              </div>
            )}
          </div>
        </div>
        <div>
          <Trans i18nKey="onboarding.start.moreInfo.explainer.outro">
            <a
              href="https://kace.dev/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-type-link"
            />
          </Trans>
        </div>
      </FancyModal>
      <BiggerCenterContainer>
        <Stepper steps={2} current={1} className="mb-12" />
        <Heading2 className="!mt-0 !text-3xl">
          {t("onboarding.start.title")}
        </Heading2>
        <Paragraph className="max-w-[360px]">
          {t("onboarding.start.explainer")}
          <div
            className="pt-4 flex cursor-pointer items-center text-type-link"
            onClick={() => infoModal.show()}
          >
            <Trans i18nKey="onboarding.start.moreInfo.button" />
            <Icon className="pl-2" icon={Icons.CIRCLE_QUESTION} />
          </div>
        </Paragraph>

        {/* Desktop Cards */}
        <div className="hidden md:flex w-full flex-col md:flex-row gap-3 pb-6">
          <Card
            onClick={() => navigate("/onboarding/extension")}
            className="md:w-1/3"
          >
            <CardContent
              colorClass="!text-onboarding-best"
              title={t("onboarding.start.options.extension.title")}
              subtitle={t("onboarding.start.options.extension.quality")}
              description={t("onboarding.start.options.extension.description")}
            >
              <Link className="!text-onboarding-best">
                {t("onboarding.start.options.extension.action")}
              </Link>
            </CardContent>
          </Card>
          <div className="hidden md:grid grid-rows-[1fr,auto,1fr] justify-center gap-4">
            <VerticalLine className="items-end" />
            <span className="text-xs uppercase font-bold">
              {t("onboarding.start.options.or")}
            </span>
            <VerticalLine />
          </div>
          <Card
            onClick={() => navigate("/onboarding/proxy")}
            className="md:w-1/3"
          >
            <CardContent
              colorClass="!text-onboarding-good"
              title={t("onboarding.start.options.proxy.title")}
              subtitle={t("onboarding.start.options.proxy.quality")}
              description={t("onboarding.start.options.proxy.description")}
            >
              <Link>{t("onboarding.start.options.proxy.action")}</Link>
            </CardContent>
          </Card>
          {noProxies ? null : (
            <>
              <div className="hidden md:grid grid-rows-[1fr,auto,1fr] justify-center gap-4">
                <VerticalLine className="items-end" />
                <span className="text-xs uppercase font-bold">
                  {t("onboarding.start.options.or")}
                </span>
                <VerticalLine />
              </div>
              <Card
                onClick={
                  isSafari
                    ? () => completeAndRedirect() // Skip modal on Safari
                    : skipModal.show // Show modal on other browsers
                }
                className="md:w-1/3"
              >
                <CardContent
                  colorClass="!text-onboarding-bad"
                  title={t("onboarding.defaultConfirm.confirm")}
                  subtitle=""
                  description={t("onboarding.defaultConfirm.description")}
                >
                  <Trans i18nKey="onboarding.start.options.default.text" />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex w-full flex-col md:flex-row gap-3 pb-6">
          <Card
            onClick={() => navigate("/onboarding/extension")}
            className="md:w-1/3 md:h-full"
          >
            <MiniCardContent
              colorClass="!text-onboarding-best"
              title={t("onboarding.start.options.extension.title")}
              subtitle={t("onboarding.start.options.extension.quality")}
              description={t("onboarding.start.options.extension.description")}
            />
          </Card>
          <Card
            onClick={() => navigate("/onboarding/proxy")}
            className="md:w-1/3"
          >
            <MiniCardContent
              colorClass="!text-onboarding-good"
              title={t("onboarding.start.options.proxy.title")}
              subtitle={t("onboarding.start.options.proxy.quality")}
              description={t("onboarding.start.options.proxy.description")}
            />
          </Card>
          {noProxies ? null : (
            <Card
              onClick={
                isSafari
                  ? () => completeAndRedirect() // Skip modal on Safari
                  : skipModal.show // Show modal on other browsers
              }
              className="md:w-1/3"
            >
              <MiniCardContent
                colorClass="!text-onboarding-bad"
                title={t("onboarding.defaultConfirm.confirm")}
                subtitle=""
                description={t("onboarding.defaultConfirm.description")}
              />
            </Card>
          )}
        </div>

        {/* <RealDebridSetup /> */}
        <FEDAPISetup />
      </BiggerCenterContainer>
    </MinimalPageLayout>
  );
}
