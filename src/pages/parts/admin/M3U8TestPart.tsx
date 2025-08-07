import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useAsyncFn } from "react-use";

import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { Box } from "@/components/layout/Box";
import { Divider } from "@/components/utils/Divider";
import { Heading2 } from "@/components/utils/Text";
import { getM3U8ProxyUrls } from "@/utils/proxyUrls";

export function M3U8ProxyItem(props: {
  name: string;
  errored?: boolean;
  success?: boolean;
  questionable?: boolean;
  errorText?: string;
  url?: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}) {
  const urlWithoutProtocol = props.url ? new URL(props.url).host : null;

  return (
    <div className="flex mb-2">
      <Toggle
        enabled={props.enabled}
        onClick={() => props.onToggle?.(!props.enabled)}
      />
      <Icon
        icon={
          props.errored
            ? Icons.X
            : props.success
              ? Icons.CIRCLE_CHECK
              : props.questionable
                ? Icons.CIRCLE_QUESTION
                : Icons.EYE_SLASH
        }
        className={classNames({
          "text-xl mr-2 mt-0.5 ml-3": true,
          "text-video-scraping-error": props.errored,
          "text-video-scraping-noresult":
            !props.errored && !props.success && !props.questionable,
          "text-video-scraping-success": props.success,
          "text-yellow-400": props.questionable,
        })}
      />
      <div className="flex-1">
        <p className="text-white font-bold">{props.name}</p>
        {props.errorText ? <p>{props.errorText}</p> : null}
        {urlWithoutProtocol ? <p>{urlWithoutProtocol}</p> : null}{" "}
      </div>
    </div>
  );
}

export function M3U8TestPart() {
  const m3u8ProxyList = useMemo(() => {
    return getM3U8ProxyUrls().map((v, ind) => ({
      id: ind.toString(),
      url: v,
    }));
  }, []);

  // Load enabled proxies from localStorage
  const [enabledProxies, setEnabledProxies] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem("m3u8-proxy-enabled");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return {};
        }
      }
      // Default: all enabled
      return Object.fromEntries(m3u8ProxyList.map((proxy) => [proxy.id, true]));
    },
  );

  // Save enabled proxies to localStorage
  useEffect(() => {
    localStorage.setItem("m3u8-proxy-enabled", JSON.stringify(enabledProxies));
  }, [enabledProxies]);

  const [proxyState, setProxyState] = useState<
    {
      id: string;
      status: "error" | "success" | "questionable";
      error?: Error;
    }[]
  >([]);

  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [testState, runTests] = useAsyncFn(async () => {
    setButtonDisabled(true);
    function updateProxy(id: string, data: (typeof proxyState)[number]) {
      setProxyState((s) => {
        return [...s.filter((v) => v.id !== id), data];
      });
    }
    setProxyState([]);

    const activeProxies = m3u8ProxyList.filter(
      (proxy) => enabledProxies[proxy.id],
    );
    const proxyPromises = activeProxies.map(async (proxy) => {
      try {
        if (proxy.url.endsWith("/")) {
          updateProxy(proxy.id, {
            id: proxy.id,
            status: "error",
            error: new Error("URL ends with slash"),
          });
          return;
        }

        // Test if it can do the same destination fetch as CORS proxy
        const testUrl = `${proxy.url}/?destination=${encodeURIComponent(
          "https://postman-echo.com/get",
        )}`;
        const response = await fetch(testUrl);

        if (response.ok) {
          updateProxy(proxy.id, {
            id: proxy.id,
            status: "success",
          });
        }
      } catch (err) {
        const error = err as Error;
        error.message = error.message.replace(proxy.url, "M3U8_PROXY_URL");
        updateProxy(proxy.id, {
          id: proxy.id,
          status: "questionable",
          error,
        });
      }
    });

    await Promise.all(proxyPromises);
    setTimeout(() => setButtonDisabled(false), 5000);
  }, [m3u8ProxyList, enabledProxies]);

  const handleToggleProxy = (proxyId: string, enabled: boolean) => {
    setEnabledProxies((prev) => ({
      ...prev,
      [proxyId]: enabled,
    }));
  };

  const allEnabled = m3u8ProxyList.every((proxy) => enabledProxies[proxy.id]);
  const noneEnabled = m3u8ProxyList.every((proxy) => !enabledProxies[proxy.id]);

  const handleToggleAll = () => {
    if (allEnabled) {
      // Disable all
      setEnabledProxies(
        Object.fromEntries(m3u8ProxyList.map((proxy) => [proxy.id, false])),
      );
    } else {
      // Enable all
      setEnabledProxies(
        Object.fromEntries(m3u8ProxyList.map((proxy) => [proxy.id, true])),
      );
    }
  };

  const enabledCount = m3u8ProxyList.filter(
    (proxy) => enabledProxies[proxy.id],
  ).length;

  return (
    <>
      <Heading2 className="!mb-0 mt-12">M3U8 Proxy tests</Heading2>
      <div className="flex items-center justify-between mb-8 mt-2">
        <p>
          {m3u8ProxyList.length} M3U8 proxy(s) registered ({enabledCount}{" "}
          enabled)
        </p>
        <Button
          theme="secondary"
          onClick={handleToggleAll}
          disabled={m3u8ProxyList.length === 0}
        >
          {allEnabled ? "Disable All" : "Enable All"}
        </Button>
      </div>
      <Box>
        {m3u8ProxyList.map((v, i) => {
          const s = proxyState.find((segment) => segment.id === v.id);
          const name = `M3U8 Proxy ${i + 1}`;
          const enabled = enabledProxies[v.id];

          if (!s) {
            return (
              <M3U8ProxyItem
                name={name}
                key={v.id}
                enabled={enabled}
                onToggle={(isEnabled) => handleToggleProxy(v.id, isEnabled)}
              />
            );
          }

          if (s.status === "error") {
            return (
              <M3U8ProxyItem
                name={name}
                errored
                key={v.id}
                errorText={s.error?.toString()}
                enabled={enabled}
                onToggle={(isEnabled) => handleToggleProxy(v.id, isEnabled)}
              />
            );
          }

          if (s.status === "success") {
            return (
              <M3U8ProxyItem
                name={name}
                url={v.url}
                success
                key={v.id}
                enabled={enabled}
                onToggle={(isEnabled) => handleToggleProxy(v.id, isEnabled)}
              />
            );
          }

          if (s.status === "questionable") {
            return (
              <M3U8ProxyItem
                name={name}
                questionable
                key={v.id}
                url={v.url}
                // errorText={s.error?.toString()}
                enabled={enabled}
                onToggle={(isEnabled) => handleToggleProxy(v.id, isEnabled)}
              />
            );
          }

          return (
            <M3U8ProxyItem
              name={name}
              key={v.id}
              enabled={enabled}
              onToggle={(isEnabled) => handleToggleProxy(v.id, isEnabled)}
            />
          );
        })}
        <Divider />
        <div className="flex justify-end">
          {buttonClicked ? (
            proxyState
              .filter((p) => enabledProxies[p.id])
              .every((proxy) => proxy.status === "success") ? (
              <p>
                All enabled M3U8 proxies have passed the test!{" "}
                <span className="font-bold">٩(ˊᗜˋ*)و♡</span>
              </p>
            ) : (
              <div>
                <div className="text-right">
                  <p className="pb-4">
                    Some M3U8 proxies have failed the test...{" "}
                    <span className="font-bold">(•᷄∩•᷅ )</span>
                  </p>
                  <div className="flex justify-end">
                    <Button
                      theme="purple"
                      loading={testState.loading}
                      onClick={async (event) => {
                        event.preventDefault();
                        setButtonDisabled(true);
                        await runTests();
                        setButtonClicked(true);
                        setTimeout(() => setButtonDisabled(false), 250);
                      }}
                      disabled={buttonDisabled || noneEnabled}
                    >
                      Test M3U8 proxies
                    </Button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <Button
              theme="purple"
              loading={testState.loading}
              onClick={async (event) => {
                event.preventDefault();
                setButtonDisabled(true);
                await runTests();
                setButtonClicked(true);
                setTimeout(() => setButtonDisabled(false), 5000);
              }}
              disabled={buttonDisabled || noneEnabled}
            >
              Test M3U8 proxies
            </Button>
          )}
        </div>
      </Box>
    </>
  );
}
