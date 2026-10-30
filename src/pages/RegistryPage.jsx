import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Download,
  FileWarning,
  MapPin,
  RefreshCw,
  Search,
  X
} from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import {
  allIllegalDistricts,
  allIllegalTypes,
  illegalObjects,
  regions
} from "../lib/data.js";
import {
  fmtArea,
  fmtDate,
  fmtInt,
  objectType,
  regionName,
  shortText
} from "../lib/format.js";
import { downloadCsv, todaySlug } from "../lib/csv.js";

const normalize = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("uz-UZ")
    .replace(/[’‘ʻʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export default function RegistryPage() {
  const { t, lang } = useApp();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const districts = useMemo(() => allIllegalDistricts(region), [region]);
  const types = useMemo(() => allIllegalTypes(), []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return illegalObjects
      .filter((item) => {
        if (region && item.region !== region) return false;
        if (district && item.district !== district) return false;
        if (type && item.type !== type) return false;
        if (!q) return true;
        const haystack = normalize(
          [
            item.id,
            item.danId,
            item.address,
            item.region,
            item.district,
            item.type,
            item.purpose,
            item.decision,
            item.protocol
          ].join(" ")
        );
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const dateA = a.actDate || "";
        const dateB = b.actDate || "";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.id - a.id;
      });
  }, [query, region, district, type]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const reset = () => {
    setQuery("");
    setRegion("");
    setDistrict("");
    setType("");
    setPage(1);
  };

  const changeRegion = (value) => {
    setRegion(value);
    setDistrict("");
    setPage(1);
  };

  const exportCsv = () => {
    const header = [
      t("reestr.id"),
      "DAN ID",
      t("reestr.region"),
      t("reestr.district"),
      t("reestr.address"),
      t("reestr.type"),
      t("result.purpose"),
      t("result.area"),
      t("result.decision"),
      t("result.protocol"),
      t("result.actDate"),
      "Lat",
      "Lon"
    ];
    const body = filtered.map((item) => [
      item.id,
      item.danId,
      item.region,
      item.district,
      item.address,
      objectType(t, item.type),
      item.purpose,
      item.area,
      item.decision,
      item.protocol,
      item.actDate,
      item.lat,
      item.lon
    ]);
    downloadCsv(`ruxsatsiz-qurilishlar-${todaySlug()}.csv`, [header, ...body]);
  };

  const pageItems = paginationItems(safePage, pages);

  return (
    <div className="page registry-page">
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
            <span className="eyebrow eyebrow--red">
              <FileWarning size={15} aria-hidden="true" />
              {t("nav.registry")}
            </span>
            <h1>{t("reestr.title")}</h1>
            <p>{t("reestr.subtitle")}</p>
          </div>
          <div className="head-stat">
            <strong>{fmtInt(illegalObjects.length, lang)}</strong>
            <span>{t("stats.illegal")}</span>
          </div>
        </div>

        <div className="registry-filters">
          <div className="filter-search">
            <Search size={19} aria-hidden="true" />
            <label className="sr-only" htmlFor="registry-search">
              {t("reestr.search")}
            </label>
            <input
              id="registry-search"
              type="search"
              value={query}
              placeholder={t("reestr.search")}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                aria-label={t("common.clear")}
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="filter-grid">
            <div className="field">
              <label htmlFor="registry-region">{t("reestr.region")}</label>
              <select id="registry-region" value={region} onChange={(event) => changeRegion(event.target.value)}>
                <option value="">{t("reestr.allRegions")}</option>
                {regions.map((item) => (
                  <option value={item} key={item}>
                    {regionName(t, item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="registry-district">{t("reestr.district")}</label>
              <select
                id="registry-district"
                value={district}
                onChange={(event) => {
                  setDistrict(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">{t("reestr.allDistricts")}</option>
                {districts.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="registry-type">{t("reestr.type")}</label>
              <select
                id="registry-type"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">{t("reestr.allTypes")}</option>
                {types.map((item) => (
                  <option value={item} key={item}>
                    {objectType(t, item)}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="button button-ghost reset-button" onClick={reset}>
              <RefreshCw size={16} aria-hidden="true" />
              {t("reestr.reset")}
            </button>
          </div>
        </div>

        <div className="registry-toolbar">
          <div className="registry-count">
            <strong>{fmtInt(filtered.length, lang)}</strong>
            <span>{t("reestr.total", { count: fmtInt(filtered.length, lang) }).replace(String(fmtInt(filtered.length, lang)), "").trim()}</span>
          </div>
          <div className="registry-toolbar-actions">
            <label className="page-size">
              <span>{t("reestr.pageSize")}</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[20, 50, 100].map((size) => (
                  <option value={size} key={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="button button-ghost button-small" onClick={exportCsv}>
              <Download size={16} aria-hidden="true" />
              {t("reestr.export")}
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="empty-state empty-state--small">
            <span className="empty-icon">
              <Search size={28} aria-hidden="true" />
            </span>
            <h2>{t("reestr.noResults")}</h2>
            <p>{t("reestr.noResultsText")}</p>
            <button type="button" className="button button-primary" onClick={reset}>
              <RefreshCw size={16} aria-hidden="true" />
              {t("reestr.reset")}
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrap registry-table-wrap">
              <table className="registry-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("reestr.address")}</th>
                    <th>{t("reestr.region")}</th>
                    <th>{t("reestr.type")}</th>
                    <th>{t("reestr.area")}</th>
                    <th>{t("reestr.decision")}</th>
                    <th>{t("result.actDate")}</th>
                    <th aria-label={t("reestr.action")} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const area = fmtArea(item.area, lang);
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="mono table-id">{item.id}</span>
                        </td>
                        <td className="table-address">
                          <a
                            href={`#/object/illegal/${item.id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              navigate(`/object/illegal/${item.id}`);
                            }}
                          >
                            {item.address}
                          </a>
                        </td>
                        <td>
                          <span className="table-region">{regionName(t, item.region)}</span>
                          <span className="table-district">{item.district}</span>
                        </td>
                        <td>
                          <span className="type-badge">{objectType(t, item.type)}</span>
                        </td>
                        <td className="table-area">{area ? `${area} ${t("unit.m2")}` : "—"}</td>
                        <td>
                          <span className="table-decision" title={item.decision || ""}>
                            {item.decision ? shortText(item.decision, 16) : "—"}
                          </span>
                        </td>
                        <td className="table-date">{fmtDate(item.actDate, lang) || "—"}</td>
                        <td className="table-action">
                          <a
                            href={`#/object/illegal/${item.id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              navigate(`/object/illegal/${item.id}`);
                            }}
                            aria-label={`${t("reestr.open")} ${item.address}`}
                          >
                            <ArrowRight size={17} aria-hidden="true" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="registry-cards">
              {rows.map((item) => {
                const area = fmtArea(item.area, lang);
                return (
                  <a
                    className="registry-card"
                    href={`#/object/illegal/${item.id}`}
                    key={item.id}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(`/object/illegal/${item.id}`);
                    }}
                  >
                    <div className="registry-card-top">
                      <span className="status-pill status-illegal">
                        <AlertTriangle size={12} aria-hidden="true" />
                        {t("result.illegal")}
                      </span>
                      <span className="mono">ID {item.id}</span>
                    </div>
                    <h3>{item.address}</h3>
                    <p>
                      <MapPin size={14} aria-hidden="true" />
                      {item.district}, {regionName(t, item.region)}
                    </p>
                    <div className="registry-card-meta">
                      <span>{objectType(t, item.type)}</span>
                      {area && <span>{area} {t("unit.m2")}</span>}
                      {item.actDate && <span>{fmtDate(item.actDate, lang)}</span>}
                    </div>
                    <div className="registry-card-foot">
                      <span className={item.decision ? undefined : "is-empty"} title={item.decision || undefined}>
                        {item.decision ? shortText(item.decision, 52) : t("reestr.noDecision")}
                      </span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="pagination">
              <button
                type="button"
                className="button button-ghost button-small"
                disabled={safePage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                {t("reestr.prev")}
              </button>

              <div className="pagination-pages">
                {pageItems.map((item, index) =>
                  item === "gap" ? (
                    <span className="pagination-gap" key={`gap-${index}`}>
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={item}
                      className={item === safePage ? "pagination-page is-active" : "pagination-page"}
                      onClick={() => setPage(item)}
                      aria-current={item === safePage ? "page" : undefined}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <span className="pagination-label">
                {t("reestr.page", { page: safePage, pages })}
              </span>

              <button
                type="button"
                className="button button-ghost button-small"
                disabled={safePage === pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
              >
                {t("reestr.next")}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        <p className="page-source-note">{t("reestr.note")}</p>
      </div>
    </div>
  );
}

function paginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items = [1];
  if (current > 3) items.push("gap");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) items.push(page);
  if (current < total - 2) items.push("gap");
  items.push(total);
  return items;
}
