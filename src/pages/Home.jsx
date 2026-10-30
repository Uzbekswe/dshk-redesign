import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  Map as MapIcon,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import SearchCard from "../components/SearchCard.jsx";
import ObjectCard from "../components/ObjectCard.jsx";
import IllegalRow from "../components/IllegalRow.jsx";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import {
  constructionObjects,
  illegalObjects,
  stats
} from "../lib/data.js";
import {
  fmtInt,
  objectType,
  regionName,
  statusLabel
} from "../lib/format.js";

export default function Home() {
  const { t, lang } = useApp();
  const sample = constructionObjects.find((item) => item.reestr === "266389") || constructionObjects[0];
  const featured = constructionObjects.slice(0, 6);
  const featuredIllegal = [
    ...illegalObjects.filter((item) => item.id === 2155),
    ...illegalObjects.filter((item) => item.id !== 2155 && item.photos?.length)
  ].slice(0, 3);

  const focusSearch = () => {
    const input = document.getElementById("portal-search");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => input?.focus({ preventScroll: true }), 350);
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-grid container">
          <div className="hero-copy">
            <span className="eyebrow">
              <ShieldCheck size={15} aria-hidden="true" />
              {t("home.eyebrow")}
            </span>
            <h1>{t("home.title")}</h1>
            <p className="hero-subtitle">{t("home.subtitle")}</p>

            <div id="hero-search">
              <SearchCard />
            </div>

            <div className="hero-trust">
              <span>
                <CheckCircle2 size={16} aria-hidden="true" />
                {fmtInt(stats.objects, lang)} {t("stats.objects").toLocaleLowerCase()}
              </span>
              <span>
                <AlertTriangle size={16} aria-hidden="true" />
                {fmtInt(stats.illegal, lang)} {t("stats.illegal").toLocaleLowerCase()}
              </span>
              <span>
                <ShieldCheck size={16} aria-hidden="true" />
                {t("footer.source")}
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-label={t("home.sampleLabel")}>
            <span className="hero-visual-label">
              <Sparkles size={14} aria-hidden="true" />
              {t("home.sampleLabel")}
            </span>

            <a
              className="sample-card"
              href={`#/object/construction/${sample.id}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/object/construction/${sample.id}`);
              }}
            >
              <div className="sample-card-head">
                <span className="sample-place">
                  <MapPin size={14} aria-hidden="true" />
                  {sample.district.replace(" tumani", "")}
                </span>
                <span className="status-pill status-progress">{statusLabel(t, sample)}</span>
              </div>

              <div className="sample-verdict">
                <span className="sample-check">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </span>
                <div>
                  <strong>{t("result.registered")}</strong>
                  <span>{t("result.reestr")}: {sample.reestr}</span>
                </div>
              </div>

              <h3>{sample.shortName}</h3>
              <p className="sample-address">{sample.address}</p>

              <div className="sample-facts">
                <div>
                  <strong>{fmtInt(sample.floors, lang)}</strong>
                  <span>{t("result.floors")}</span>
                </div>
                <div>
                  <strong>{fmtInt(sample.apartments, lang)}</strong>
                  <span>{t("result.apartments")}</span>
                </div>
                <div>
                  <strong>{fmtInt(sample.blocks, lang)}</strong>
                  <span>{t("result.blocks")}</span>
                </div>
              </div>

              <div className="mini-map" aria-hidden="true">
                <span className="mini-road mini-road--one" />
                <span className="mini-road mini-road--two" />
                <span className="mini-road mini-road--three" />
                <span className="mini-pin mini-pin--one" />
                <span className="mini-pin mini-pin--two" />
                <span className="mini-pin mini-pin--three" />
                <span className="mini-map-label">
                  <MapIcon size={13} />
                  {t("nav.map")}
                </span>
              </div>

              <div className="sample-foot">
                <span>{t("home.sampleHint")}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="section tasks-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">{t("home.tasksTitle")}</span>
          </div>

          <div className="task-grid">
            <button type="button" className="task-card" onClick={focusSearch}>
              <span className="task-icon task-icon--blue">
                <Search size={22} aria-hidden="true" />
              </span>
              <span className="task-body">
                <strong>{t("home.task1Title")}</strong>
                <span>{t("home.task1Text")}</span>
              </span>
              <ArrowRight className="task-arrow" size={18} aria-hidden="true" />
            </button>

            <button type="button" className="task-card" onClick={() => navigate("/registry")}>
              <span className="task-icon task-icon--red">
                <AlertTriangle size={22} aria-hidden="true" />
              </span>
              <span className="task-body">
                <strong>{t("home.task2Title")}</strong>
                <span>{t("home.task2Text")}</span>
              </span>
              <ArrowRight className="task-arrow" size={18} aria-hidden="true" />
            </button>

            <button type="button" className="task-card" onClick={() => navigate("/map")}>
              <span className="task-icon task-icon--teal">
                <MapIcon size={22} aria-hidden="true" />
              </span>
              <span className="task-body">
                <strong>{t("home.task3Title")}</strong>
                <span>{t("home.task3Text")}</span>
              </span>
              <ArrowRight className="task-arrow" size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="section how-section">
        <div className="container">
          <div className="section-heading section-heading--center">
            <span className="eyebrow">{t("home.howTitle")}</span>
          </div>
          <div className="steps">
            {[
              ["home.step1Title", "home.step1Text"],
              ["home.step2Title", "home.step2Text"],
              ["home.step3Title", "home.step3Text"]
            ].map(([title, text], index) => (
              <div className="step" key={title}>
                <span className="step-number">{index + 1}</span>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t("home.featuredTitle")}</span>
              <h2>{t("nav.registry")}</h2>
              <p>{t("home.featuredText")}</p>
            </div>
            <a
              className="text-link"
              href="#/map"
              onClick={(event) => {
                event.preventDefault();
                navigate("/map");
              }}
            >
              {t("home.viewAll")}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="object-grid">
            {featured.map((object) => (
              <ObjectCard key={object.id} object={object} />
            ))}
          </div>
        </div>
      </section>

      <section className="section illegal-section">
        <div className="container">
          <div className="illegal-panel">
            <div className="illegal-panel-copy">
              <span className="eyebrow eyebrow--red">
                <AlertTriangle size={15} aria-hidden="true" />
                {fmtInt(stats.illegal, lang)} {t("stats.illegal").toLocaleLowerCase()}
              </span>
              <h2>{t("home.illegalTitle")}</h2>
              <p>{t("home.illegalText")}</p>
              <div className="illegal-panel-actions">
                <button type="button" className="button button-danger" onClick={() => navigate("/registry")}>
                  {t("home.openRegistry")}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button type="button" className="button button-ghost" onClick={() => navigate("/stats")}>
                  {t("stats.title")}
                </button>
              </div>
            </div>

            <div className="illegal-panel-list">
              {featuredIllegal.map((object) => (
                <IllegalRow key={object.id} object={object} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section map-cta-section">
        <div className="container">
          <div className="map-cta">
            <div className="map-cta-copy">
              <span className="eyebrow eyebrow--light">{t("nav.map")}</span>
              <h2>{t("home.exploreTitle")}</h2>
              <p>{t("home.exploreText")}</p>
              <button type="button" className="button button-white" onClick={() => navigate("/map")}>
                <MapIcon size={18} aria-hidden="true" />
                {t("home.exploreCta")}
              </button>
            </div>

            <div className="map-teaser" aria-hidden="true">
              <span className="teaser-grid" />
              <span className="teaser-road teaser-road--a" />
              <span className="teaser-road teaser-road--b" />
              <span className="teaser-road teaser-road--c" />
              <span className="teaser-pin teaser-pin--blue" />
              <span className="teaser-pin teaser-pin--blue teaser-pin--two" />
              <span className="teaser-pin teaser-pin--red" />
              <span className="teaser-pin teaser-pin--red teaser-pin--four" />
              <span className="teaser-card">
                <span className="teaser-card-dot" />
                <span>
                  <strong>{fmtInt(stats.inProgress, lang)}</strong>
                  <small>{t("stats.inProgress")}</small>
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section data-section">
        <div className="container">
          <div className="data-strip">
            <div className="data-strip-icon">
              <Info size={18} aria-hidden="true" />
            </div>
            <div>
              <strong>{t("home.latest")}</strong>
              <p>{t("home.dataNote")}</p>
            </div>
            <a
              href="https://dshk.shaffofqurilish.uz/"
              target="_blank"
              rel="noreferrer"
              className="text-link text-link--muted"
            >
              {t("footer.official")}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
