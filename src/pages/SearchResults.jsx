import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Search,
  SearchX
} from "lucide-react";
import SearchCard from "../components/SearchCard.jsx";
import { ObjectListRow } from "../components/ObjectCard.jsx";
import { IllegalResultRow } from "../components/IllegalRow.jsx";
import { useApp } from "../lib/app-context.js";
import { navigate, routeQuery } from "../lib/router.js";
import { exactMatch, relaxedSearch, searchAll } from "../lib/data.js";

export default function SearchResults({ route }) {
  const { t } = useApp();
  const query = route.params.get("q") || "";
  const kind = route.params.get("kind") || "number";

  const results = useMemo(() => searchAll(query, kind), [query, kind]);
  const relaxed = useMemo(
    () => (results.total === 0 ? relaxedSearch(query) : null),
    [results.total, query]
  );

  const shown = results.total > 0 ? results : relaxed;
  const total = shown ? shown.construction.length + shown.illegal.length : 0;
  const fallback = results.total === 0 && total > 0;

  return (
    <div className="page search-page">
      <div className="container page-narrow">
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

        <div className="page-head search-results-head">
          <div>
            <span className="eyebrow">{t("search.title")}</span>
            <h1>{t("search.resultsFor", { query })}</h1>
            {total > 0 && <p>{t("search.resultCount", { count: total })}</p>}
          </div>
          <InlineSearch initialQuery={query} initialKind={kind} />
        </div>

        {fallback && (
          <div className="notice notice--amber">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>{t("search.fallback")}</p>
          </div>
        )}

        {total === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <SearchX size={30} aria-hidden="true" />
            </span>
            <h2>{t("search.noResults")}</h2>
            <p>{t("search.noResultsText")}</p>
            <div className="empty-actions">
              <button type="button" className="button button-primary" onClick={() => navigate("/map")}>
                {t("search.pickMap")}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button type="button" className="button button-ghost" onClick={() => navigate("/registry")}>
                {t("home.openRegistry")}
              </button>
            </div>
            <div className="empty-search">
              <SearchCard variant="page" initialKind={kind} />
            </div>
          </div>
        ) : (
          <div className="search-groups" aria-live="polite">
            {shown.construction.length > 0 && (
              <section className="search-group">
                <div className="search-group-head">
                  <h2>
                    <Building2 size={19} aria-hidden="true" />
                    {t("search.sectionConstruction")}
                  </h2>
                  <span>{shown.construction.length}</span>
                </div>
                <div className="result-list">
                  {shown.construction.map((object) => (
                    <ObjectListRow key={object.id} object={object} />
                  ))}
                </div>
              </section>
            )}

            {shown.illegal.length > 0 && (
              <section className="search-group">
                <div className="search-group-head search-group-head--red">
                  <h2>
                    <AlertTriangle size={19} aria-hidden="true" />
                    {t("search.sectionIllegal")}
                  </h2>
                  <span>{shown.illegal.length}</span>
                </div>
                <div className="result-list">
                  {shown.illegal.map((object) => (
                    <IllegalResultRow key={object.id} object={object} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InlineSearch({ initialQuery, initialKind }) {
  const { t } = useApp();
  const [value, setValue] = useState(initialQuery);

  const submit = (event) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    const direct = initialKind === "number" ? exactMatch(query) : null;
    if (direct) {
      navigate(`/object/${direct.kind}/${direct.id}`);
      return;
    }
    navigate(`/search${routeQuery({ q: query, kind: initialKind })}`);
  };

  return (
    <form className="inline-search" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor="results-search">
        {t("header.search")}
      </label>
      <Search size={18} aria-hidden="true" />
      <input
        id="results-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("search.placeholderNumber")}
        autoComplete="off"
      />
      <button type="submit" className="button button-primary button-small">
        {t("search.button")}
      </button>
    </form>
  );
}
