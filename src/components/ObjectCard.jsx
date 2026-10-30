import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import {
  fmtArea,
  fmtInt,
  objectType,
  regionName,
  shortText,
  statusKey,
  statusLabel
} from "../lib/format.js";

export default function ObjectCard({ object }) {
  const { t, lang } = useApp();
  const tone = statusKey(object);
  const area = fmtArea(object.area, lang);

  return (
    <a
      className="object-card"
      href={`#/object/construction/${object.id}`}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/object/construction/${object.id}`);
      }}
    >
      <div className="object-card-top">
        <span className={`status-pill status-${tone}`}>{statusLabel(t, object)}</span>
        <span className="type-badge">{objectType(t, object.type)}</span>
      </div>

      <h3>{object.shortName || shortText(object.name, 70)}</h3>
      <p className="object-address">
        <MapPin size={15} aria-hidden="true" />
        <span>{object.address}</span>
      </p>
      <p className="object-name">{shortText(object.name, 110)}</p>

      <div className="object-facts">
        <span>
          <strong>{fmtInt(object.floors, lang)}</strong> {t("result.floors").toLocaleLowerCase()}
        </span>
        {object.apartments > 0 && (
          <span>
            <strong>{fmtInt(object.apartments, lang)}</strong> {t("unit.aptShort")}
          </span>
        )}
        {area && (
          <span>
            <strong>{area}</strong> {t("unit.m2")}
          </span>
        )}
      </div>

      <div className="object-card-foot">
        <span className="reestr-number">
          <Building2 size={14} aria-hidden="true" />
          {t("result.reestr")}: {object.reestr}
        </span>
        <span className="arrow-link">
          {t("common.open")}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

export function ObjectListRow({ object }) {
  const { t, lang } = useApp();
  const tone = statusKey(object);

  return (
    <a
      className="result-row"
      href={`#/object/construction/${object.id}`}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/object/construction/${object.id}`);
      }}
    >
      <div className="result-row-icon result-row-icon--green">
        <Building2 size={20} aria-hidden="true" />
      </div>
      <div className="result-row-body">
        <div className="result-row-head">
          <h3>{object.shortName || shortText(object.name, 80)}</h3>
          <span className={`status-pill status-${tone}`}>{statusLabel(t, object)}</span>
        </div>
        <p className="result-row-address">
          <MapPin size={14} aria-hidden="true" />
          {object.address}, {regionName(t, object.region)}
        </p>
        <div className="result-row-meta">
          <span>{t("result.reestr")}: {object.reestr}</span>
          <span>{objectType(t, object.type)}</span>
          <span>{fmtInt(object.floors, lang)} {t("unit.floorsShort")}</span>
          {object.apartments > 0 && <span>{fmtInt(object.apartments, lang)} {t("unit.aptShort")}</span>}
        </div>
      </div>
      <ArrowRight className="result-row-arrow" size={19} aria-hidden="true" />
    </a>
  );
}
