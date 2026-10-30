import { ArrowUpRight, Database, Send, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.svg";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a
            href="#/"
            className="footer-logo"
            onClick={(event) => {
              event.preventDefault();
              navigate("/");
            }}
          >
            <img src={logo} alt="ShaffofQurilish" />
          </a>
          <p>{t("footer.about")}</p>
          <div className="footer-source">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{t("footer.source")}</span>
          </div>
        </div>

        <div className="footer-column">
          <h2>{t("footer.portal")}</h2>
          <a href="#/">{t("nav.check")}</a>
          <a href="#/map">{t("nav.map")}</a>
          <a href="#/registry">{t("nav.registry")}</a>
          <a href="#/stats">{t("nav.stats")}</a>
          <a href="#/help">{t("nav.help")}</a>
        </div>

        <div className="footer-column">
          <h2>{t("footer.data")}</h2>
          <a href="#/registry">{t("home.openRegistry")}</a>
          <a href="#/stats">{t("stats.title")}</a>
          <a href="#/help">{t("help.sourceTitle")}</a>
          <div className="footer-meta">
            <Database size={15} aria-hidden="true" />
            <span>{t("footer.updated")}</span>
          </div>
        </div>

        <div className="footer-column">
          <h2>{t("footer.contact")}</h2>
          <a href="https://t.me/shaffof_qurilish" target="_blank" rel="noreferrer">
            <Send size={15} aria-hidden="true" />
            {t("footer.telegram")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href="https://dshk.shaffofqurilish.uz/" target="_blank" rel="noreferrer">
            {t("footer.official")}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <span className="footer-note">{t("footer.demo")}</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ShaffofQurilish</span>
        <span>{t("footer.demo")}</span>
        <span>{t("footer.updated")}</span>
      </div>
    </footer>
  );
}
