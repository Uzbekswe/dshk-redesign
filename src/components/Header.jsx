import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  X,
  CheckCircle2,
  Map as MapIcon,
  BarChart3,
  CircleHelp,
  Building2
} from "lucide-react";
import logo from "../assets/logo.svg";
import { useApp } from "../lib/app-context.js";
import { languages } from "../i18n.js";
import { navigate } from "../lib/router.js";

const navItems = [
  { path: "/", label: "nav.check", icon: Search },
  { path: "/map", label: "nav.map", icon: MapIcon },
  { path: "/registry", label: "nav.registry", icon: Building2 },
  { path: "/stats", label: "nav.stats", icon: BarChart3 },
  { path: "/help", label: "nav.help", icon: CircleHelp }
];

export default function Header({ onOpenSearch }) {
  const { t, lang, setLang, route } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [route.path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  const isActive = (path) => {
    if (path === "/") return route.path === "/" || route.path === "/search";
    return route.path === path || route.path.startsWith(`${path}/`);
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            go("/");
          }}
          aria-label={t("header.home")}
        >
          <img src={logo} alt="ShaffofQurilish" />
          <span className="brand-badge">{t("result.demoTag")}</span>
        </a>

        <nav className="main-nav" aria-label={t("header.menu")}>
          {navItems.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={isActive(item.path) ? "nav-link is-active" : "nav-link"}
              aria-current={isActive(item.path) ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(item.path);
              }}
            >
              {t(item.label)}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="search-trigger" onClick={onOpenSearch}>
            <Search size={17} aria-hidden="true" />
            <span>{t("header.search")}</span>
            <kbd aria-hidden="true">⌘K</kbd>
          </button>

          <div className="lang-switch" role="group" aria-label={t("header.language")}>
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                lang={language.code}
                aria-pressed={lang === language.code}
                className={lang === language.code ? "is-active" : ""}
                onClick={() => setLang(language.code)}
                title={language.full}
              >
                {language.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? t("header.close") : t("header.menu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label={t("header.menu")}>
          <nav aria-label={t("header.menu")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={`#${item.path}`}
                  className={isActive(item.path) ? "mobile-nav-link is-active" : "mobile-nav-link"}
                  onClick={(event) => {
                    event.preventDefault();
                    go(item.path);
                  }}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{t(item.label)}</span>
                  {isActive(item.path) && <CheckCircle2 size={17} aria-hidden="true" />}
                </a>
              );
            })}
          </nav>
          <button
            type="button"
            className="mobile-search-button"
            onClick={() => {
              setMenuOpen(false);
              onOpenSearch();
            }}
          >
            <Search size={19} aria-hidden="true" />
            {t("header.search")}
          </button>
          <div className="mobile-lang">
            <span>{t("header.language")}</span>
            <div className="lang-switch" role="group" aria-label={t("header.language")}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  lang={language.code}
                  aria-pressed={lang === language.code}
                  className={lang === language.code ? "is-active" : ""}
                  onClick={() => setLang(language.code)}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
