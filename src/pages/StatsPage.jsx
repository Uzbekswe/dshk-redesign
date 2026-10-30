import {
  AlertTriangle,
  ArrowRight,
  Ban,
  BarChart3,
  Building2,
  Clock,
  Download,
  Home as HomeIcon,
  Info,
  Layers,
  Map as MapIcon
} from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import {
  illegalRegionStats,
  regionStats,
  stats
} from "../lib/data.js";
import { fmtInt, regionName } from "../lib/format.js";
import { downloadCsv, todaySlug } from "../lib/csv.js";

export default function StatsPage() {
  const { t, lang } = useApp();

  const statusTotal = stats.inProgress + stats.frozen + stats.stopped;
  const floorTotal = stats.floor1to5 + stats.floor6to12 + stats.floor13plus;
  const maxRegion = Math.max(...regionStats.map((item) => item.count));
  const maxIllegal = Math.max(...illegalRegionStats.map((item) => item.count));

  const cards = [
    { key: "stats.objects", value: stats.objects, icon: Building2, tone: "blue" },
    { key: "stats.inProgress", value: stats.inProgress, icon: Clock, tone: "green" },
    { key: "stats.illegal", value: stats.illegal, icon: AlertTriangle, tone: "red" },
    { key: "stats.apartments", value: stats.apartments, icon: HomeIcon, tone: "slate" },
    { key: "stats.blocks", value: stats.blocks, icon: Layers, tone: "slate" },
    { key: "stats.stopped", value: stats.stopped, icon: Ban, tone: "amber" },
    { key: "stats.frozen", value: stats.frozen, icon: Info, tone: "amber" },
    { key: "stats.floor13plus", value: stats.floor13plus, icon: BarChart3, tone: "blue" }
  ];

  const exportStats = () => {
    const rows = [
      [t("stats.title"), ""],
      [t("stats.dataNote"), ""],
      [],
      [t("stats.objects"), stats.objects],
      [t("stats.inProgress"), stats.inProgress],
      [t("stats.stopped"), stats.stopped],
      [t("stats.frozen"), stats.frozen],
      [t("stats.apartments"), stats.apartments],
      [t("stats.blocks"), stats.blocks],
      [t("stats.illegal"), stats.illegal],
      [],
      [t("stats.byRegion"), t("stats.objects")],
      ...regionStats.map((item) => [regionName(t, item.name), item.count]),
      [],
      [t("stats.illegalByRegion"), t("stats.illegal")],
      ...illegalRegionStats.map((item) => [regionName(t, item.name), item.count]),
      [],
      [t("stats.byFloors"), t("stats.objects")],
      [t("stats.floor1to5"), stats.floor1to5],
      [t("stats.floor6to12"), stats.floor6to12],
      [t("stats.floor13plus"), stats.floor13plus]
    ];
    downloadCsv(`shaffof-statistika-${todaySlug()}.csv`, rows);
  };

  const goCheck = () => {
    navigate("/");
    window.setTimeout(() => {
      document.getElementById("portal-search")?.focus();
    }, 350);
  };

  return (
    <div className="page stats-page">
      <div className="container">
        <div className="page-head">
          <div>
            <span className="eyebrow">
              <BarChart3 size={15} aria-hidden="true" />
              {t("nav.stats")}
            </span>
            <h1>{t("stats.title")}</h1>
            <p>{t("stats.subtitle")}</p>
          </div>
          <button type="button" className="button button-ghost" onClick={exportStats}>
            <Download size={17} aria-hidden="true" />
            {t("stats.download")}
          </button>
        </div>

        <div className="stat-card-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div className={`stat-card stat-card--${card.tone}`} key={card.key}>
                <span className="stat-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <strong>{fmtInt(card.value, lang)}</strong>
                <span className="stat-label">{t(card.key)}</span>
              </div>
            );
          })}
        </div>

        <div className="stats-grid">
          <section className="panel stats-panel">
            <div className="panel-head">
              <h2>
                <BarChart3 size={19} aria-hidden="true" />
                {t("stats.byStatus")}
              </h2>
              <span className="panel-tag">{fmtInt(statusTotal, lang)}</span>
            </div>

            <div className="stacked-bar" aria-hidden="true">
              <span
                className="stacked-segment stacked-segment--blue"
                style={{ width: `${(stats.inProgress / statusTotal) * 100}%` }}
              />
              <span
                className="stacked-segment stacked-segment--amber"
                style={{ width: `${(stats.stopped / statusTotal) * 100}%` }}
              />
              <span
                className="stacked-segment stacked-segment--slate"
                style={{ width: `${(stats.frozen / statusTotal) * 100}%` }}
              />
            </div>

            <div className="status-legend">
              <div>
                <span className="legend-dot legend-dot--blue" />
                <span>{t("stats.inProgress")}</span>
                <strong>{fmtInt(stats.inProgress, lang)}</strong>
                <small>{t("stats.percent", { value: ((stats.inProgress / statusTotal) * 100).toFixed(1) })}</small>
              </div>
              <div>
                <span className="legend-dot legend-dot--amber" />
                <span>{t("stats.stopped")}</span>
                <strong>{fmtInt(stats.stopped, lang)}</strong>
                <small>{t("stats.percent", { value: ((stats.stopped / statusTotal) * 100).toFixed(1) })}</small>
              </div>
              <div>
                <span className="legend-dot legend-dot--slate" />
                <span>{t("stats.frozen")}</span>
                <strong>{fmtInt(stats.frozen, lang)}</strong>
                <small>{t("stats.percent", { value: ((stats.frozen / statusTotal) * 100).toFixed(1) })}</small>
              </div>
            </div>
          </section>

          <section className="panel stats-panel">
            <div className="panel-head">
              <h2>
                <Building2 size={19} aria-hidden="true" />
                {t("stats.byFloors")}
              </h2>
              <span className="panel-tag">{fmtInt(floorTotal, lang)}</span>
            </div>

            <div className="floor-bars">
              <FloorBar
                label={t("stats.floor1to5")}
                value={stats.floor1to5}
                total={floorTotal}
                lang={lang}
                tone="blue"
              />
              <FloorBar
                label={t("stats.floor6to12")}
                value={stats.floor6to12}
                total={floorTotal}
                lang={lang}
                tone="teal"
              />
              <FloorBar
                label={t("stats.floor13plus")}
                value={stats.floor13plus}
                total={floorTotal}
                lang={lang}
                tone="amber"
              />
            </div>
          </section>
        </div>

        <div className="stats-grid stats-grid--regions">
          <RegionPanel
            title={t("stats.byRegion")}
            items={regionStats}
            max={maxRegion}
            total={stats.objects}
            lang={lang}
            t={t}
            tone="blue"
          />
          <RegionPanel
            title={t("stats.illegalByRegion")}
            items={illegalRegionStats}
            max={maxIllegal}
            total={stats.illegal}
            lang={lang}
            t={t}
            tone="red"
            action={() => navigate("/registry")}
            actionLabel={t("stats.viewRegistry")}
          />
        </div>

        <div className="stats-cta">
          <div>
            <span className="eyebrow eyebrow--light">{t("nav.check")}</span>
            <h2>{t("stats.ctaTitle")}</h2>
            <p>{t("stats.ctaText")}</p>
          </div>
          <div className="stats-cta-actions">
            <button type="button" className="button button-white" onClick={goCheck}>
              {t("stats.check")}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="button button-ghost-light" onClick={() => navigate("/map")}>
              <MapIcon size={17} aria-hidden="true" />
              {t("stats.viewMap")}
            </button>
          </div>
        </div>

        <p className="page-source-note">
          {t("stats.note")} · {t("stats.dataNote")}
        </p>
      </div>
    </div>
  );
}

function FloorBar({ label, value, total, lang, tone }) {
  const percent = (value / total) * 100;
  return (
    <div className="floor-bar">
      <div className="floor-bar-head">
        <span>{label}</span>
        <strong>{fmtInt(value, lang)}</strong>
      </div>
      <div className="bar-track">
        <span className={`bar-fill bar-fill--${tone}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="floor-percent">{percent.toFixed(1)}%</span>
    </div>
  );
}

function RegionPanel({ title, items, max, total, lang, t, tone, action, actionLabel }) {
  return (
    <section className={`panel stats-panel region-panel region-panel--${tone}`}>
      <div className="panel-head">
        <h2>
          <Layers size={19} aria-hidden="true" />
          {title}
        </h2>
        <span className="panel-tag">{fmtInt(total, lang)}</span>
      </div>

      <div className="bar-list">
        {items.map((item) => {
          const percent = (item.count / total) * 100;
          return (
            <div className="bar-row" key={item.name}>
              <span className="bar-label" title={regionName(t, item.name)}>
                {regionName(t, item.name)}
              </span>
              <div className="bar-track">
                <span
                  className={`bar-fill bar-fill--${tone}`}
                  style={{ width: `${Math.max(2, (item.count / max) * 100)}%` }}
                />
              </div>
              <span className="bar-value">{fmtInt(item.count, lang)}</span>
              <span className="bar-percent">{percent.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      {action && (
        <button type="button" className="text-link region-panel-action" onClick={action}>
          {actionLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
