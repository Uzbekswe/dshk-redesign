import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SearchOverlay from "./components/SearchOverlay.jsx";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import RegistryPage from "./pages/RegistryPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import { AppContext, useApp } from "./lib/app-context.js";
import { useRoute, navigate } from "./lib/router.js";
import { translate } from "./i18n.js";
import { examples } from "./lib/data.js";

const supported = ["uz", "ru", "en"];
const MapPage = lazy(() => import("./pages/MapPage.jsx"));

function getInitialLang() {
  try {
    const stored = window.localStorage.getItem("dshk-lang");
    if (supported.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "uz";
}

export default function App() {
  const [lang, setLangState] = useState(getInitialLang);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastState, setToastState] = useState(null);
  const toastTimer = useRef(null);
  const route = useRoute();

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem("dshk-lang", next);
    } catch {
      /* ignore */
    }
  }, []);

  const toast = useCallback((text) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToastState({ text, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToastState(null), 2800);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (!typing && event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route.path]);

  useEffect(() => {
    if (route.path.startsWith("/object/")) return;
    const titles = {
      "/": "home.title",
      "/map": "map.title",
      "/registry": "reestr.title",
      "/stats": "stats.title",
      "/help": "help.title",
      "/search": "search.title"
    };
    const key = titles[route.path];
    document.title = key
      ? `${t(key)} — ShaffofQurilish`
      : "ShaffofQurilish — Ochiq qurilish ma’lumotlari";
  }, [route.path, t]);

  const contextValue = useMemo(
    () => ({ lang, setLang, t, route, toast, examples }),
    [lang, setLang, t, route, toast]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        {t("common.skipToContent")}
      </a>
      <Header onOpenSearch={() => setSearchOpen(true)} />

      <main id="main-content" tabIndex={-1}>
        {route.path === "/" && <Home />}
        {route.path === "/search" && <SearchResults route={route} />}
        {route.path === "/map" && (
          <Suspense fallback={<MapFallback />}>
            <MapPage route={route} />
          </Suspense>
        )}
        {route.path === "/registry" && <RegistryPage />}
        {route.path === "/stats" && <StatsPage />}
        {route.path === "/help" && <HelpPage />}
        {route.path.startsWith("/object/") && <ResultPage route={route} />}
        {!["/", "/search", "/map", "/registry", "/stats", "/help"].includes(route.path) &&
          !route.path.startsWith("/object/") && <NotFound />}
      </main>

      {route.path !== "/map" && <Footer />}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {toastState && (
        <div className="toast" role="status" aria-live="polite" key={toastState.id}>
          {toastState.text}
        </div>
      )}
    </AppContext.Provider>
  );
}

function MapFallback() {
  const { t } = useApp();
  return (
    <div className="map-page">
      <div className="map-lazy" role="status">
        <span className="spinner" />
        <span>{t("map.loading")}</span>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useApp();
  return (
    <div className="page">
      <div className="container page-narrow">
        <div className="empty-state">
          <span className="empty-code">404</span>
          <h1>{t("error.notFound")}</h1>
          <p>{t("error.notFoundText")}</p>
          <button type="button" className="button button-primary" onClick={() => navigate("/")}>
            {t("common.backHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
