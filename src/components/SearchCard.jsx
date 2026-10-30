import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, MapPin, Search, Sparkles, X } from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate, routeQuery } from "../lib/router.js";
import { exactMatch } from "../lib/data.js";

const tabs = [
  { id: "number", label: "search.tabNumber", placeholder: "search.placeholderNumber", helper: "search.helperNumber" },
  { id: "address", label: "search.tabAddress", placeholder: "search.placeholderAddress", helper: "search.helperAddress" },
  { id: "name", label: "search.tabName", placeholder: "search.placeholderName", helper: "search.helperName" }
];

export default function SearchCard({ variant = "hero", initialKind = "number", autoFocus = false, onSubmitted }) {
  const { t, examples } = useApp();
  const [tab, setTab] = useState(initialKind);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const uid = useId();
  const inputId = `portal-search-${uid}`;
  const helperId = `search-helper-${uid}`;
  const errorId = `search-error-${uid}`;
  const panelId = `search-panel-${uid}`;
  const tabId = (id) => `search-tab-${uid}-${id}`;

  useEffect(() => {
    if (autoFocus) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
  }, [autoFocus]);

  const changeTab = (next) => {
    setTab(next);
    setError("");
    inputRef.current?.focus();
  };

  const onTabKeyDown = (event, current) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex((item) => item.id === current.id);
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    const next = tabs[nextIndex];
    changeTab(next.id);
    window.requestAnimationFrame(() => {
      document.getElementById(tabId(next.id))?.focus();
    });
  };

  const submitValue = (raw) => {
    const query = String(raw ?? "").trim();
    if (!query) {
      setError(t("search.errorEmpty"));
      inputRef.current?.focus();
      return;
    }
    if (query.length < 2) {
      setError(t("search.errorShort"));
      inputRef.current?.focus();
      return;
    }

    const direct = tab === "number" ? exactMatch(query) : null;
    if (direct) {
      navigate(`/object/${direct.kind}/${direct.id}`);
    } else {
      navigate(`/search${routeQuery({ q: query, kind: tab })}`);
    }
    setValue("");
    setError("");
    onSubmitted?.();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    submitValue(value);
  };

  const pickExample = (kind, example) => {
    setTab(kind);
    setValue(example);
    setError("");
    const direct = kind === "number" ? exactMatch(example) : null;
    if (direct) {
      navigate(`/object/${direct.kind}/${direct.id}`);
      onSubmitted?.();
    } else {
      inputRef.current?.focus();
    }
  };

  const helper = tabs.find((item) => item.id === tab);

  return (
    <div className={`search-card search-card--${variant}`}>
      <div className="search-tabs" role="tablist" aria-label={t("header.search")}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={tabId(item.id)}
            aria-selected={tab === item.id}
            aria-controls={panelId}
            tabIndex={tab === item.id ? 0 : -1}
            className={tab === item.id ? "search-tab is-active" : "search-tab"}
            onClick={() => changeTab(item.id)}
            onKeyDown={(event) => onTabKeyDown(event, item)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <form
        className="search-form"
        id={panelId}
        role="search"
        aria-label={t("header.search")}
        onSubmit={onSubmit}
        noValidate
      >
        <div className={`search-input-wrap${error ? " has-error" : ""}`}>
          <Search size={21} aria-hidden="true" />
          <label className="sr-only" htmlFor={inputId}>
            {t(helper.placeholder)}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError("");
            }}
            placeholder={t(helper.placeholder)}
            autoComplete="off"
            spellCheck="false"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperId}
          />
          {value && (
            <button
              type="button"
              className="search-clear"
              aria-label={t("common.clear")}
              onClick={() => {
                setValue("");
                setError("");
                inputRef.current?.focus();
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        <button type="submit" className="button button-primary search-submit">
          <span>{t("search.button")}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      <div id={helperId} className="search-below">
        <span>{t(helper.helper)}</span>
        <div className="search-links">
          <a
            href="#/help"
            onClick={(event) => {
              event.preventDefault();
              navigate("/help");
              onSubmitted?.();
            }}
          >
            {t("search.where")}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#/map"
            onClick={(event) => {
              event.preventDefault();
              navigate("/map");
              onSubmitted?.();
            }}
          >
            <MapPin size={14} aria-hidden="true" />
            {t("search.pickMap")}
          </a>
        </div>
      </div>

      <div className="search-error" id={errorId} role="alert" aria-live="polite">
        {error}
      </div>

      <div className="search-examples">
        <span className="examples-label">
          <Sparkles size={14} aria-hidden="true" />
          {t("home.quickExamples")}:
        </span>
        <div className="example-chips">
          <button type="button" className="chip" onClick={() => pickExample("number", examples.reestr)}>
            {examples.reestr}
          </button>
          <button type="button" className="chip" onClick={() => pickExample("number", examples.cadastral)}>
            {examples.cadastral}
          </button>
          <button type="button" className="chip" onClick={() => pickExample("number", examples.illegalId)}>
            ID {examples.illegalId}
          </button>
          <button type="button" className="chip" onClick={() => pickExample("address", examples.address)}>
            {t("search.tabAddress")}
          </button>
        </div>
      </div>
    </div>
  );
}
