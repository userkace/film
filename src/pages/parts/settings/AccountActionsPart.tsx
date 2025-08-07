import { useTranslation } from "react-i18next";
import { useAsyncFn } from "react-use";

import { deleteUser } from "@/backend/accounts/user";
import { Button } from "@/components/buttons/Button";
import { SolidSettingsCard } from "@/components/layout/SettingsCard";
import { Modal, ModalCard, useModal } from "@/components/overlays/Modal";
import { Heading2, Heading3, Paragraph } from "@/components/utils/Text";
import { useAuthData } from "@/hooks/auth/useAuthData";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useAuthStore } from "@/stores/auth";

import { signOutAllDevices } from "./DeviceListPart";

export function AccountActionsPart() {
  const { t } = useTranslation();
  const url = useBackendUrl();
  const account = useAuthStore((s) => s.account);
  const { logout } = useAuthData();
  const deleteModal = useModal("account-delete");

  const [deleteResult, deleteExec] = useAsyncFn(async () => {
    if (!account || !url) return;
    await deleteUser(url, account);
    await logout();
    deleteModal.hide();
  }, [logout, account, url, deleteModal.hide]);

  if (!account) return null;

  return (
    <div>
      <Heading2 border>{t("settings.account.actions.title")}</Heading2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Migration Card */}
        <SolidSettingsCard
          paddingClass="px-6 py-8"
          className="flex flex-col h-full"
        >
          <div className="flex-grow">
            <Heading3>{t("settings.account.actions.migration.title")}</Heading3>
            <p className="text-type-text mt-3">
              {t("settings.account.actions.migration.text")}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              theme="purple"
              onClick={() => {
                window.location.href = "/migration";
              }}
            >
              {t("settings.account.actions.migration.button")}
            </Button>
          </div>
        </SolidSettingsCard>

        {/* Logout All Devices Card */}
        <SolidSettingsCard
          paddingClass="px-6 py-8"
          className="flex flex-col h-full"
        >
          <div className="flex-grow">
            <Heading3>
              {t("settings.account.actions.logoutAllDevices.title")}
            </Heading3>
            <p className="text-type-text mt-3">
              {t("settings.account.actions.logoutAllDevices.text")}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button theme="danger" onClick={signOutAllDevices}>
              {t("settings.account.actions.logoutAllDevices.button")}
            </Button>
          </div>
        </SolidSettingsCard>

        {/* Delete Account Card */}
        <SolidSettingsCard
          paddingClass="px-6 py-8"
          className="flex flex-col h-full"
        >
          <div className="flex-grow">
            <Heading3>{t("settings.account.actions.delete.title")}</Heading3>
            <p className="text-type-text mt-3">
              {t("settings.account.actions.delete.text")}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              theme="danger"
              loading={deleteResult.loading}
              onClick={deleteModal.show}
            >
              {t("settings.account.actions.delete.button")}
            </Button>
          </div>
        </SolidSettingsCard>
      </div>

      <Modal id={deleteModal.id}>
        <ModalCard>
          <Heading2 className="!mt-0">
            {t("settings.account.actions.delete.confirmTitle")}
          </Heading2>
          <Paragraph>
            {t("settings.account.actions.delete.confirmDescription")}
          </Paragraph>
          <div className="flex gap-4 mt-4 justify-between">
            <Button theme="secondary" onClick={deleteModal.hide}>
              {t("onboarding.defaultConfirm.cancel")}
            </Button>
            <Button
              theme="danger"
              loading={deleteResult.loading}
              onClick={deleteExec}
            >
              {t("settings.account.actions.delete.confirmButton")}
            </Button>
          </div>
        </ModalCard>
      </Modal>
    </div>
  );
}
