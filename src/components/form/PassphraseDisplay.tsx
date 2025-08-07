import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard, useMountedState } from "react-use";

import { Icon, Icons } from "../Icon";
import { AuthInputBox } from "../text-inputs/AuthInputBox";

export function PassphraseDisplay(props: {
  mnemonic: string;
  onCustomPassphrase?: (passphrase: string) => void;
}) {
  const { t } = useTranslation();
  const individualWords = props.mnemonic.split(" ");

  const [, copy] = useCopyToClipboard();

  const [hasCopied, setHasCopied] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPassphrase, setCustomPassphrase] = useState("");
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [validationError, setValidationError] = useState("");
  const isMounted = useMountedState();

  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const validPassphraseRegex =
    /^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=:;"'<>[\]{}|\\/`~]+$/;

  function copyMnemonic() {
    copy(props.mnemonic);
    setHasCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => isMounted() && setHasCopied(false), 500);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Shift") {
      setIsShiftHeld(true);
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === "Shift") {
      setIsShiftHeld(false);
    }
  }

  function validatePassphrase(passphrase: string): boolean {
    if (passphrase.length < 8) {
      setValidationError(t("auth.generate.passphraseTooShort"));
      return false;
    }
    if (!validPassphraseRegex.test(passphrase)) {
      setValidationError(t("auth.generate.invalidPassphraseCharacters"));
      return false;
    }
    setValidationError("");
    return true;
  }

  function handleCustomPassphraseChange(value: string) {
    setCustomPassphrase(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  }

  function handleCustomPassphraseSubmit() {
    if (customPassphrase.trim()) {
      if (validatePassphrase(customPassphrase.trim())) {
        props.onCustomPassphrase?.(customPassphrase.trim());
        setShowCustomInput(false);
        setCustomPassphrase("");
        setValidationError("");
      }
    }
  }

  function handleCancelCustomInput() {
    setShowCustomInput(false);
    setCustomPassphrase("");
    setValidationError("");
  }

  function handleShowCustomInput() {
    setShowCustomInput(true);
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (showCustomInput) {
    return (
      <div className="rounded-lg border border-authentication-border/50">
        <div className="px-4 py-2 flex justify-between border-b border-authentication-border/50">
          <p className="font-bold text-sm text-white">
            {t("auth.generate.customPassphraseLabel")}
          </p>
          <button
            type="button"
            className="text-authentication-copyText hover:text-authentication-copyTextHover transition-colors flex gap-2 items-center cursor-pointer"
            onClick={handleCancelCustomInput}
          >
            <Icon icon={Icons.X} className="text-xs" />
            <span className="text-sm">{t("actions.cancel")}</span>
          </button>
        </div>
        <div className="px-4 py-4">
          <AuthInputBox
            value={customPassphrase}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={handleCustomPassphraseChange}
            placeholder={t("auth.generate.customPassphrasePlaceholder")}
            passwordToggleable
            className="mb-4"
          />
          {validationError && (
            <p className="text-authentication-errorText text-sm mb-4">
              {validationError}
            </p>
          )}
          <button
            type="button"
            className="w-full bg-authentication-inputBg hover:bg-authentication-inputBg/80 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCustomPassphraseSubmit}
            disabled={!customPassphrase.trim() || !!validationError}
          >
            {t("auth.generate.useCustomPassphrase")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-authentication-border/50 relative">
      <div className="px-4 py-2 flex justify-between border-b border-authentication-border/50">
        <p className="font-bold text-sm text-white">
          {t("auth.generate.passphraseFrameLabel")}
        </p>
        <div className="flex gap-2 items-center">
          {/* Hidden custom passphrase button */}
          <button
            type="button"
            className={`text-authentication-copyText hover:text-authentication-copyTextHover transition-all duration-200 flex gap-2 pr-2 items-center cursor-pointer ${
              isShiftHeld
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            onClick={handleShowCustomInput}
            title={t("auth.generate.useCustomPassphrase")}
          >
            <Icon icon={Icons.EDIT} className="text-xs" />
            <span className="text-sm">{t("auth.generate.custom")}</span>
          </button>
          <button
            type="button"
            className="text-authentication-copyText hover:text-authentication-copyTextHover transition-colors flex gap-2 items-center cursor-pointer"
            onClick={copyMnemonic}
          >
            <Icon
              icon={hasCopied ? Icons.CHECKMARK : Icons.COPY}
              className={hasCopied ? "text-xs" : ""}
            />
            <span className="text-sm">{t("actions.copy")}</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-4 grid grid-cols-3 text-sm sm:text-base sm:grid-cols-4 gap-2">
        {individualWords.map((word, i) => (
          <div
            className="rounded-md py-2 bg-authentication-wordBackground text-white font-medium text-center"
            // this doesn't get rerendered nor does it have state so its fine
            // eslint-disable-next-line react/no-array-index-key
            key={i}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
