import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Database,
  ExternalLink,
  Info,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";

export default function HelpPage() {
  const { t } = useApp();

  const faqs = [
    ["help.q1", "help.a1"],
    ["help.q2", "help.a2"],
    ["help.q3", "help.a3"],
    ["help.q4", "help.a4"],
    ["help.q5", "help.a5"],
    ["help.q6", "help.a6"],
    ["help.q7", "help.a7"]
  ];

  return (
    <div className="page help-page">
      <div className="container">
        <a
          className="back-link"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            navigate("/");
          }}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          {t("common.backHome")}
        </a>

        <div className="page-head">
          <div>
            <span className="eyebrow">
              <Info size={15} aria-hidden="true" />
              {t("nav.help")}
            </span>
            <h1>{t("help.title")}</h1>
            <p>{t("help.subtitle")}</p>
          </div>
        </div>

        <div className="help-layout">
          <section className="faq-panel">
            <h2>{t("help.faqTitle")}</h2>
            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <details className="faq-item" key={question} open={index === 0}>
                  <summary>
                    <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                    <span>{t(question)}</span>
                    <ChevronDown size={19} aria-hidden="true" />
                  </summary>
                  <div className="faq-answer">
                    <p>{t(answer)}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="help-cta">
              <div>
                <h2>{t("stats.ctaTitle")}</h2>
                <p>{t("stats.ctaText")}</p>
              </div>
              <button type="button" className="button button-primary" onClick={() => navigate("/")}>
                {t("stats.check")}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </section>

          <aside className="help-aside">
            <div className="panel help-card help-card--telegram">
              <span className="panel-icon panel-icon--blue">
                <Send size={19} aria-hidden="true" />
              </span>
              <h2>{t("help.contactTitle")}</h2>
              <p>{t("help.contactText")}</p>
              <a href="https://t.me/shaffof_qurilish" target="_blank" rel="noreferrer" className="button button-primary button-block">
                {t("help.telegram")}
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="panel help-card">
              <span className="panel-icon">
                <Database size={19} aria-hidden="true" />
              </span>
              <h2>{t("help.sourceTitle")}</h2>
              <p>{t("help.sourceText")}</p>
              <a
                href="https://dshk.shaffofqurilish.uz/"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {t("help.official")}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>

            <div className="panel help-card">
              <span className="panel-icon">
                <Sparkles size={19} aria-hidden="true" />
              </span>
              <h2>{t("help.ai")}</h2>
              <p>{t("help.aiText")}</p>
            </div>

            <div className="panel help-card help-card--demo">
              <span className="panel-icon">
                <ShieldCheck size={19} aria-hidden="true" />
              </span>
              <h2>{t("help.demoTitle")}</h2>
              <p>{t("help.demoText")}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
