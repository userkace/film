if (!self.define) {
     let t, e = {};
     const s = (s, n) => (s = new URL(s + ".js", n).href, e[s] || new Promise((e => {
          if ("document" in self) {
               const t = document.createElement("script");
               t.src = s, t.onload = e, document.head.appendChild(t)
          } else t = s, importScripts(s), e()
     })).then((() => {
          let t = e[s];
          if (!t) throw new Error(`Module ${s} didn’t register its module`);
          return t
     })));
     self.define = (n, i) => {
          const r = t || ("document" in self ? document.currentScript.src : "") || location.href;
          if (e[r]) return;
          let o = {};
          const a = t => s(t, r),
               c = {
                    module: {
                         uri: r
                    },
                    exports: o,
                    require: a
               };
          e[r] = Promise.all(n.map((t => c[t] || a(t)))).then((t => (i(...t), o)))
     }
}
define([], (function () {
     "use strict";
     try {
          self["workbox:core:7.0.0"] && _()
     } catch (t) {}
     const t = (t, ...e) => {
          let s = t;
          return e.length > 0 && (s += ` :: ${JSON.stringify(e)}`), s
     };
     class e extends Error {
          constructor(e, s) {
               super(t(e, s)), this.name = e, this.details = s
          }
     }
     try {
          self["workbox:routing:7.0.0"] && _()
     } catch (t) {}
     const s = t => t && "object" == typeof t ? t : {
          handle: t
     };
     class n {
          constructor(t, e, n = "GET") {
               this.handler = s(e), this.match = t, this.method = n
          }
          setCatchHandler(t) {
               this.catchHandler = s(t)
          }
     }
     class i extends n {
          constructor(t, e, s) {
               super((({
                    url: e
               }) => {
                    const s = t.exec(e.href);
                    if (s && (e.origin === location.origin || 0 === s.index)) return s.slice(1)
               }), e, s)
          }
     }
     class r {
          constructor() {
               this.t = new Map, this.i = new Map
          }
          get routes() {
               return this.t
          }
          addFetchListener() {
               self.addEventListener("fetch", (t => {
                    const {
                         request: e
                    } = t, s = this.handleRequest({
                         request: e,
                         event: t
                    });
                    s && t.respondWith(s)
               }))
          }
          addCacheListener() {
               self.addEventListener("message", (t => {
                    if (t.data && "CACHE_URLS" === t.data.type) {
                         const {
                              payload: e
                         } = t.data, s = Promise.all(e.urlsToCache.map((e => {
                              "string" == typeof e && (e = [e]);
                              const s = new Request(...e);
                              return this.handleRequest({
                                   request: s,
                                   event: t
                              })
                         })));
                         t.waitUntil(s), t.ports && t.ports[0] && s.then((() => t.ports[0].postMessage(!0)))
                    }
               }))
          }
          handleRequest({
               request: t,
               event: e
          }) {
               const s = new URL(t.url, location.href);
               if (!s.protocol.startsWith("http")) return;
               const n = s.origin === location.origin,
                    {
                         params: i,
                         route: r
                    } = this.findMatchingRoute({
                         event: e,
                         request: t,
                         sameOrigin: n,
                         url: s
                    });
               let o = r && r.handler;
               const a = t.method;
               if (!o && this.i.has(a) && (o = this.i.get(a)), !o) return;
               let c;
               try {
                    c = o.handle({
                         url: s,
                         request: t,
                         event: e,
                         params: i
                    })
               } catch (t) {
                    c = Promise.reject(t)
               }
               const l = r && r.catchHandler;
               return c instanceof Promise && (this.o || l) && (c = c.catch((async n => {
                    if (l) try {
                         return await l.handle({
                              url: s,
                              request: t,
                              event: e,
                              params: i
                         })
                    } catch (t) {
                         t instanceof Error && (n = t)
                    }
                    if (this.o) return this.o.handle({
                         url: s,
                         request: t,
                         event: e
                    });
                    throw n
               }))), c
          }
          findMatchingRoute({
               url: t,
               sameOrigin: e,
               request: s,
               event: n
          }) {
               const i = this.t.get(s.method) || [];
               for (const r of i) {
                    let i;
                    const o = r.match({
                         url: t,
                         sameOrigin: e,
                         request: s,
                         event: n
                    });
                    if (o) return i = o, (Array.isArray(i) && 0 === i.length || o.constructor === Object && 0 === Object.keys(o).length || "boolean" == typeof o) && (i = void 0), {
                         route: r,
                         params: i
                    }
               }
               return {}
          }
          setDefaultHandler(t, e = "GET") {
               this.i.set(e, s(t))
          }
          setCatchHandler(t) {
               this.o = s(t)
          }
          registerRoute(t) {
               this.t.has(t.method) || this.t.set(t.method, []), this.t.get(t.method).push(t)
          }
          unregisterRoute(t) {
               if (!this.t.has(t.method)) throw new e("unregister-route-but-not-found-with-method", {
                    method: t.method
               });
               const s = this.t.get(t.method).indexOf(t);
               if (!(s > -1)) throw new e("unregister-route-route-not-registered");
               this.t.get(t.method).splice(s, 1)
          }
     }
     let o;
     const a = () => (o || (o = new r, o.addFetchListener(), o.addCacheListener()), o);

     function c(t, s, r) {
          let o;
          if ("string" == typeof t) {
               const e = new URL(t, location.href);
               o = new n((({
                    url: t
               }) => t.href === e.href), s, r)
          } else if (t instanceof RegExp) o = new i(t, s, r);
          else if ("function" == typeof t) o = new n(t, s, r);
          else {
               if (!(t instanceof n)) throw new e("unsupported-route-type", {
                    moduleName: "workbox-routing",
                    funcName: "registerRoute",
                    paramName: "capture"
               });
               o = t
          }
          return a().registerRoute(o), o
     }
     const l = {
               googleAnalytics: "googleAnalytics",
               precache: "precache-v2",
               prefix: "workbox",
               runtime: "runtime",
               suffix: "undefined" != typeof registration ? registration.scope : ""
          },
          h = t => [l.prefix, t, l.suffix].filter((t => t && t.length > 0)).join("-"),
          u = t => t || h(l.precache),
          f = t => t || h(l.runtime);

     function d(t, e) {
          const s = e();
          return t.waitUntil(s), s
     }
     try {
          self["workbox:precaching:7.0.0"] && _()
     } catch (t) {}

     function w(t) {
          if (!t) throw new e("add-to-cache-list-unexpected-type", {
               entry: t
          });
          if ("string" == typeof t) {
               const e = new URL(t, location.href);
               return {
                    cacheKey: e.href,
                    url: e.href
               }
          }
          const {
               revision: s,
               url: n
          } = t;
          if (!n) throw new e("add-to-cache-list-unexpected-type", {
               entry: t
          });
          if (!s) {
               const t = new URL(n, location.href);
               return {
                    cacheKey: t.href,
                    url: t.href
               }
          }
          const i = new URL(n, location.href),
               r = new URL(n, location.href);
          return i.searchParams.set("__WB_REVISION__", s), {
               cacheKey: i.href,
               url: r.href
          }
     }
     class p {
          constructor() {
               this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({
                    request: t,
                    state: e
               }) => {
                    e && (e.originalRequest = t)
               }, this.cachedResponseWillBeUsed = async ({
                    event: t,
                    state: e,
                    cachedResponse: s
               }) => {
                    if ("install" === t.type && e && e.originalRequest && e.originalRequest instanceof Request) {
                         const t = e.originalRequest.url;
                         s ? this.notUpdatedURLs.push(t) : this.updatedURLs.push(t)
                    }
                    return s
               }
          }
     }
     class y {
          constructor({
               precacheController: t
          }) {
               this.cacheKeyWillBeUsed = async ({
                    request: t,
                    params: e
               }) => {
                    const s = (null == e ? void 0 : e.cacheKey) || this.l.getCacheKeyForURL(t.url);
                    return s ? new Request(s, {
                         headers: t.headers
                    }) : t
               }, this.l = t
          }
     }
     let v;
     async function g(t, s) {
          let n = null;
          if (t.url) {
               n = new URL(t.url).origin
          }
          if (n !== self.location.origin) throw new e("cross-origin-copy-response", {
               origin: n
          });
          const i = t.clone(),
               r = {
                    headers: new Headers(i.headers),
                    status: i.status,
                    statusText: i.statusText
               },
               o = s ? s(r) : r,
               a = function () {
                    if (void 0 === v) {
                         const t = new Response("");
                         if ("body" in t) try {
                              new Response(t.body), v = !0
                         } catch (t) {
                              v = !1
                         }
                         v = !1
                    }
                    return v
               }() ? i.body : await i.blob();
          return new Response(a, o)
     }

     function m(t, e) {
          const s = new URL(t);
          for (const t of e) s.searchParams.delete(t);
          return s.href
     }
     class R {
          constructor() {
               this.promise = new Promise(((t, e) => {
                    this.resolve = t, this.reject = e
               }))
          }
     }
     const b = new Set;
     try {
          self["workbox:strategies:7.0.0"] && _()
     } catch (t) {}

     function q(t) {
          return "string" == typeof t ? new Request(t) : t
     }
     class U {
          constructor(t, e) {
               this.h = {}, Object.assign(this, e), this.event = e.event, this.u = t, this.p = new R, this.v = [], this.m = [...t.plugins], this.R = new Map;
               for (const t of this.m) this.R.set(t, {});
               this.event.waitUntil(this.p.promise)
          }
          async fetch(t) {
               const {
                    event: s
               } = this;
               let n = q(t);
               if ("navigate" === n.mode && s instanceof FetchEvent && s.preloadResponse) {
                    const t = await s.preloadResponse;
                    if (t) return t
               }
               const i = this.hasCallback("fetchDidFail") ? n.clone() : null;
               try {
                    for (const t of this.iterateCallbacks("requestWillFetch")) n = await t({
                         request: n.clone(),
                         event: s
                    })
               } catch (t) {
                    if (t instanceof Error) throw new e("plugin-error-request-will-fetch", {
                         thrownErrorMessage: t.message
                    })
               }
               const r = n.clone();
               try {
                    let t;
                    t = await fetch(n, "navigate" === n.mode ? void 0 : this.u.fetchOptions);
                    for (const e of this.iterateCallbacks("fetchDidSucceed")) t = await e({
                         event: s,
                         request: r,
                         response: t
                    });
                    return t
               } catch (t) {
                    throw i && await this.runCallbacks("fetchDidFail", {
                         error: t,
                         event: s,
                         originalRequest: i.clone(),
                         request: r.clone()
                    }), t
               }
          }
          async fetchAndCachePut(t) {
               const e = await this.fetch(t),
                    s = e.clone();
               return this.waitUntil(this.cachePut(t, s)), e
          }
          async cacheMatch(t) {
               const e = q(t);
               let s;
               const {
                    cacheName: n,
                    matchOptions: i
               } = this.u, r = await this.getCacheKey(e, "read"), o = Object.assign(Object.assign({}, i), {
                    cacheName: n
               });
               s = await caches.match(r, o);
               for (const t of this.iterateCallbacks("cachedResponseWillBeUsed")) s = await t({
                    cacheName: n,
                    matchOptions: i,
                    cachedResponse: s,
                    request: r,
                    event: this.event
               }) || void 0;
               return s
          }
          async cachePut(t, s) {
               const n = q(t);
               var i;
               await (i = 0, new Promise((t => setTimeout(t, i))));
               const r = await this.getCacheKey(n, "write");
               if (!s) throw new e("cache-put-with-no-response", {
                    url: (o = r.url, new URL(String(o), location.href).href.replace(new RegExp(`^${location.origin}`), ""))
               });
               var o;
               const a = await this.q(s);
               if (!a) return !1;
               const {
                    cacheName: c,
                    matchOptions: l
               } = this.u, h = await self.caches.open(c), u = this.hasCallback("cacheDidUpdate"), f = u ? await async function (t, e, s, n) {
                    const i = m(e.url, s);
                    if (e.url === i) return t.match(e, n);
                    const r = Object.assign(Object.assign({}, n), {
                              ignoreSearch: !0
                         }),
                         o = await t.keys(e, r);
                    for (const e of o)
                         if (i === m(e.url, s)) return t.match(e, n)
               }(h, r.clone(), ["__WB_REVISION__"], l): null;
               try {
                    await h.put(r, u ? a.clone() : a)
               } catch (t) {
                    if (t instanceof Error) throw "QuotaExceededError" === t.name && await async function () {
                         for (const t of b) await t()
                    }(), t
               }
               for (const t of this.iterateCallbacks("cacheDidUpdate")) await t({
                    cacheName: c,
                    oldResponse: f,
                    newResponse: a.clone(),
                    request: r,
                    event: this.event
               });
               return !0
          }
          async getCacheKey(t, e) {
               const s = `${t.url} | ${e}`;
               if (!this.h[s]) {
                    let n = t;
                    for (const t of this.iterateCallbacks("cacheKeyWillBeUsed")) n = q(await t({
                         mode: e,
                         request: n,
                         event: this.event,
                         params: this.params
                    }));
                    this.h[s] = n
               }
               return this.h[s]
          }
          hasCallback(t) {
               for (const e of this.u.plugins)
                    if (t in e) return !0;
               return !1
          }
          async runCallbacks(t, e) {
               for (const s of this.iterateCallbacks(t)) await s(e)
          }* iterateCallbacks(t) {
               for (const e of this.u.plugins)
                    if ("function" == typeof e[t]) {
                         const s = this.R.get(e),
                              n = n => {
                                   const i = Object.assign(Object.assign({}, n), {
                                        state: s
                                   });
                                   return e[t](i)
                              };
                         yield n
                    }
          }
          waitUntil(t) {
               return this.v.push(t), t
          }
          async doneWaiting() {
               let t;
               for (; t = this.v.shift();) await t
          }
          destroy() {
               this.p.resolve(null)
          }
          async q(t) {
               let e = t,
                    s = !1;
               for (const t of this.iterateCallbacks("cacheWillUpdate"))
                    if (e = await t({
                              request: this.request,
                              response: e,
                              event: this.event
                         }) || void 0, s = !0, !e) break;
               return s || e && 200 !== e.status && (e = void 0), e
          }
     }
     class L {
          constructor(t = {}) {
               this.cacheName = f(t.cacheName), this.plugins = t.plugins || [], this.fetchOptions = t.fetchOptions, this.matchOptions = t.matchOptions
          }
          handle(t) {
               const [e] = this.handleAll(t);
               return e
          }
          handleAll(t) {
               t instanceof FetchEvent && (t = {
                    event: t,
                    request: t.request
               });
               const e = t.event,
                    s = "string" == typeof t.request ? new Request(t.request) : t.request,
                    n = "params" in t ? t.params : void 0,
                    i = new U(this, {
                         event: e,
                         request: s,
                         params: n
                    }),
                    r = this.U(i, s, e);
               return [r, this.L(r, i, s, e)]
          }
          async U(t, s, n) {
               let i;
               await t.runCallbacks("handlerWillStart", {
                    event: n,
                    request: s
               });
               try {
                    if (i = await this.j(s, t), !i || "error" === i.type) throw new e("no-response", {
                         url: s.url
                    })
               } catch (e) {
                    if (e instanceof Error)
                         for (const r of t.iterateCallbacks("handlerDidError"))
                              if (i = await r({
                                        error: e,
                                        event: n,
                                        request: s
                                   }), i) break;
                    if (!i) throw e
               }
               for (const e of t.iterateCallbacks("handlerWillRespond")) i = await e({
                    event: n,
                    request: s,
                    response: i
               });
               return i
          }
          async L(t, e, s, n) {
               let i, r;
               try {
                    i = await t
               } catch (r) {}
               try {
                    await e.runCallbacks("handlerDidRespond", {
                         event: n,
                         request: s,
                         response: i
                    }), await e.doneWaiting()
               } catch (t) {
                    t instanceof Error && (r = t)
               }
               if (await e.runCallbacks("handlerDidComplete", {
                         event: n,
                         request: s,
                         response: i,
                         error: r
                    }), e.destroy(), r) throw r
          }
     }
     class j extends L {
          constructor(t = {}) {
               t.cacheName = u(t.cacheName), super(t), this.C = !1 !== t.fallbackToNetwork, this.plugins.push(j.copyRedirectedCacheableResponsesPlugin)
          }
          async j(t, e) {
               const s = await e.cacheMatch(t);
               return s || (e.event && "install" === e.event.type ? await this._(t, e) : await this.N(t, e))
          }
          async N(t, s) {
               let n;
               const i = s.params || {};
               if (!this.C) throw new e("missing-precache-entry", {
                    cacheName: this.cacheName,
                    url: t.url
               }); {
                    const e = i.integrity,
                         r = t.integrity,
                         o = !r || r === e;
                    n = await s.fetch(new Request(t, {
                         integrity: "no-cors" !== t.mode ? r || e : void 0
                    })), e && o && "no-cors" !== t.mode && (this.O(), await s.cachePut(t, n.clone()))
               }
               return n
          }
          async _(t, s) {
               this.O();
               const n = await s.fetch(t);
               if (!await s.cachePut(t, n.clone())) throw new e("bad-precaching-response", {
                    url: t.url,
                    status: n.status
               });
               return n
          }
          O() {
               let t = null,
                    e = 0;
               for (const [s, n] of this.plugins.entries()) n !== j.copyRedirectedCacheableResponsesPlugin && (n === j.defaultPrecacheCacheabilityPlugin && (t = s), n.cacheWillUpdate && e++);
               0 === e ? this.plugins.push(j.defaultPrecacheCacheabilityPlugin) : e > 1 && null !== t && this.plugins.splice(t, 1)
          }
     }
     j.defaultPrecacheCacheabilityPlugin = {
          cacheWillUpdate: async ({
               response: t
          }) => !t || t.status >= 400 ? null : t
     }, j.copyRedirectedCacheableResponsesPlugin = {
          cacheWillUpdate: async ({
               response: t
          }) => t.redirected ? await g(t) : t
     };
     class C {
          constructor({
               cacheName: t,
               plugins: e = [],
               fallbackToNetwork: s = !0
          } = {}) {
               this.D = new Map, this.P = new Map, this.k = new Map, this.u = new j({
                    cacheName: u(t),
                    plugins: [...e, new y({
                         precacheController: this
                    })],
                    fallbackToNetwork: s
               }), this.install = this.install.bind(this), this.activate = this.activate.bind(this)
          }
          get strategy() {
               return this.u
          }
          precache(t) {
               this.addToCacheList(t), this.S || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this.S = !0)
          }
          addToCacheList(t) {
               const s = [];
               for (const n of t) {
                    "string" == typeof n ? s.push(n) : n && void 0 === n.revision && s.push(n.url);
                    const {
                         cacheKey: t,
                         url: i
                    } = w(n), r = "string" != typeof n && n.revision ? "reload" : "default";
                    if (this.D.has(i) && this.D.get(i) !== t) throw new e("add-to-cache-list-conflicting-entries", {
                         firstEntry: this.D.get(i),
                         secondEntry: t
                    });
                    if ("string" != typeof n && n.integrity) {
                         if (this.k.has(t) && this.k.get(t) !== n.integrity) throw new e("add-to-cache-list-conflicting-integrities", {
                              url: i
                         });
                         this.k.set(t, n.integrity)
                    }
                    if (this.D.set(i, t), this.P.set(i, r), s.length > 0) {
                         const t = `Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
                         console.warn(t)
                    }
               }
          }
          install(t) {
               return d(t, (async () => {
                    const e = new p;
                    this.strategy.plugins.push(e);
                    for (const [e, s] of this.D) {
                         const n = this.k.get(s),
                              i = this.P.get(e),
                              r = new Request(e, {
                                   integrity: n,
                                   cache: i,
                                   credentials: "same-origin"
                              });
                         await Promise.all(this.strategy.handleAll({
                              params: {
                                   cacheKey: s
                              },
                              request: r,
                              event: t
                         }))
                    }
                    const {
                         updatedURLs: s,
                         notUpdatedURLs: n
                    } = e;
                    return {
                         updatedURLs: s,
                         notUpdatedURLs: n
                    }
               }))
          }
          activate(t) {
               return d(t, (async () => {
                    const t = await self.caches.open(this.strategy.cacheName),
                         e = await t.keys(),
                         s = new Set(this.D.values()),
                         n = [];
                    for (const i of e) s.has(i.url) || (await t.delete(i), n.push(i.url));
                    return {
                         deletedURLs: n
                    }
               }))
          }
          getURLsToCacheKeys() {
               return this.D
          }
          getCachedURLs() {
               return [...this.D.keys()]
          }
          getCacheKeyForURL(t) {
               const e = new URL(t, location.href);
               return this.D.get(e.href)
          }
          getIntegrityForCacheKey(t) {
               return this.k.get(t)
          }
          async matchPrecache(t) {
               const e = t instanceof Request ? t.url : t,
                    s = this.getCacheKeyForURL(e);
               if (s) {
                    return (await self.caches.open(this.strategy.cacheName)).match(s)
               }
          }
          createHandlerBoundToURL(t) {
               const s = this.getCacheKeyForURL(t);
               if (!s) throw new e("non-precached-url", {
                    url: t
               });
               return e => (e.request = new Request(t), e.params = Object.assign({
                    cacheKey: s
               }, e.params), this.strategy.handle(e))
          }
     }
     let x;
     const E = () => (x || (x = new C), x);
     class N extends n {
          constructor(t, e) {
               super((({
                    request: s
               }) => {
                    const n = t.getURLsToCacheKeys();
                    for (const i of function* (t, {
                              ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/],
                              directoryIndex: s = "index.html",
                              cleanURLs: n = !0,
                              urlManipulation: i
                         } = {}) {
                              const r = new URL(t, location.href);
                              r.hash = "", yield r.href;
                              const o = function (t, e = []) {
                                   for (const s of [...t.searchParams.keys()]) e.some((t => t.test(s))) && t.searchParams.delete(s);
                                   return t
                              }(r, e);
                              if (yield o.href, s && o.pathname.endsWith("/")) {
                                   const t = new URL(o.href);
                                   t.pathname += s, yield t.href
                              }
                              if (n) {
                                   const t = new URL(o.href);
                                   t.pathname += ".html", yield t.href
                              }
                              if (i) {
                                   const t = i({
                                        url: r
                                   });
                                   for (const e of t) yield e.href
                              }
                         }(s.url, e)) {
                         const e = n.get(i);
                         if (e) {
                              return {
                                   cacheKey: e,
                                   integrity: t.getIntegrityForCacheKey(e)
                              }
                         }
                    }
               }), t.strategy)
          }
     }
     var O, D;
     self.skipWaiting(), self.addEventListener("activate", (() => self.clients.claim())), O = {},
          function (t) {
               E().precache(t)
          }([{
               url: "assets/auth-72H9TcpW.js",
               revision: null
          }, {
               url: "assets/caption-parsing-BABN6jyO.js",
               revision: null
          }, {
               url: "assets/DeveloperPage--1rV1y1n.js",
               revision: null
          }, {
               url: "assets/hls-2_Gpnevg.js",
               revision: null
          }, {
               url: "assets/Icons-7LetCtYR.css",
               revision: null
          }, {
               url: "assets/Icons-Ct84pi7p.js",
               revision: null
          }, {
               url: "assets/index-DNeM3t3R.css",
               revision: null
          }, {
               url: "assets/index-DYBNcHgS.js",
               revision: null
          }, {
               url: "assets/language-db-DxKZVAm4.js",
               revision: null
          }, {
               url: "assets/locales-BXkJCeK5.js",
               revision: null
          }, {
               url: "assets/PlayerView-CHau_TOb.js",
               revision: null
          }, {
               url: "assets/react-dom-DpNJ2UNC.js",
               revision: null
          }, {
               url: "assets/Settings-CEKoIO_M.js",
               revision: null
          }, {
               url: "assets/StatusCircle-D7h8AcdR.js",
               revision: null
          }, {
               url: "assets/TestView-C1rlAP4k.js",
               revision: null
          }, {
               url: "assets/vendor-Dkz3gcSC.js",
               revision: null
          }, {
               url: "assets/workbox-window.prod.es5-DFjpnwFp.js",
               revision: null
          }, {
               url: "config.js",
               revision: "70a21569bcb8d92e1b7c0352dcb5820f"
          }, {
               url: "index.html",
               revision: "9d623fa51f6753e5b6892af7720b7053"
          }, {
               url: "favicon.ico",
               revision: "de7674bb092bad4dc08dd526e8464697"
          }, {
               url: "apple-touch-icon.png",
               revision: "b60ebd8f605217c49609bbd64a43144d"
          }, {
               url: "safari-pinned-tab.svg",
               revision: "ab788f7c1cf43874ad6f349c2f2eb5a7"
          }, {
               url: "android-chrome-192x192.png",
               revision: "3b297bf83c4090744f9a3844a8706c61"
          }, {
               url: "android-chrome-512x512.png",
               revision: "766db16752630f76103e71333d61636f"
          }, {
               url: "manifest.webmanifest",
               revision: "31b651545b2cf072f732b7c1609d61c5"
          }]),
          function (t) {
               const e = E();
               c(new N(e, t))
          }(O), self.addEventListener("activate", (t => {
               const e = u();
               t.waitUntil((async (t, e = "-precache-") => {
                    const s = (await self.caches.keys()).filter((s => s.includes(e) && s.includes(self.registration.scope) && s !== t));
                    return await Promise.all(s.map((t => self.caches.delete(t)))), s
               })(e).then((t => {})))
          })), c(new class extends n {
               constructor(t, {
                    allowlist: e = [/./],
                    denylist: s = []
               } = {}) {
                    super((t => this.K(t)), t), this.T = e, this.M = s
               }
               K({
                    url: t,
                    request: e
               }) {
                    if (e && "navigate" !== e.mode) return !1;
                    const s = t.pathname + t.search;
                    for (const t of this.M)
                         if (t.test(s)) return !1;
                    return !!this.T.some((t => t.test(s)))
               }
          }((D = "index.html", E().createHandlerBoundToURL(D))))
}));
//# sourceMappingURL=sw.js.map
//# sourceMappingURL=sw.js.map