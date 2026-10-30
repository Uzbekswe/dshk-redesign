import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import SearchCard from "./SearchCard.jsx";
import { useApp } from "../lib/app-context.js";

export default function SearchOverlay({ open, onClose }) {
  const { t } = useApp();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="search-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("header.search")}
        ref={panelRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="overlay-head">
          <div>
            <span className="overlay-eyebrow">{t("app.name")}</span>
            <h2>{t("header.search")}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t("search.close")}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <SearchCard variant="overlay" autoFocus onSubmitted={onClose} />
        <p className="overlay-hint">{t("app.tagline")}</p>
      </div>
    </div>
  );
}
