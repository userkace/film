const CHROMECAST_SENDER_SDK =
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";

const callbacks: ((available: boolean) => void)[] = [];
let _available: boolean | null = null;
let _initialized = false;

function init(available: boolean) {
  _available = available;
  callbacks.forEach((cb) => cb(available));
  // Clear callbacks after first resolution to avoid leaks/repeated calls
  callbacks.length = 0;
}

export function isChromecastAvailable(cb: (available: boolean) => void) {
  if (_available !== null) return cb(_available);
  callbacks.push(cb);
}

export function initializeChromecast() {
  if (_initialized) return;
  _initialized = true;

  const w = window as any;
  // Only set the global callback if not already present
  if (!w.__onGCastApiAvailable) {
    w.__onGCastApiAvailable = (isAvailable: boolean) => {
      try {
        if (isAvailable && w.cast?.framework) {
          const context = w.cast.framework.CastContext.getInstance();
          context.setOptions({
            receiverApplicationId:
              w.chrome?.cast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: w.cast.framework.AutoJoinPolicy.ORIGIN_SCOPED,
          });
        }
      } catch {
        // Swallow errors; availability will still be reported below
      } finally {
        init(!!isAvailable);
      }
    };
  }

  // add script if doesnt exist yet
  const exists = !!document.getElementById("chromecast-script");
  if (!exists) {
    const script = document.createElement("script");
    script.setAttribute("src", CHROMECAST_SENDER_SDK);
    script.setAttribute("id", "chromecast-script");
    document.body.appendChild(script);
  }
}
