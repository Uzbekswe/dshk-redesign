import { useState } from "react";
import { AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import { fmtArea, fmtDate, fmtInt, objectType, regionName } from "../lib/format.js";

export default function IllegalRow({ object, compact = false }) {
  const { t, lang } = useApp();
  const area = fmtArea(object.area, lang);
  const photo = object.photos?.[0];
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <a
      className={compact ? "illegal-row illegal-row--compact" : "illegal-row"}
      href={`#/object/illegal/${object.id}`}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/object/illegal/${object.id}`);
      }}
    >
      {photo && !photoFailed ? (
        <img
          className="illegal-thumb"
          src={photo}
          alt=""
          loading={compact ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div className="illegal-thumb illegal-thumb--empty" aria-hidden="true">
          <AlertTriangle size={20} />
        </div>
      )}

      <div className="illegal-row-body">
        <div className="illegal-row-top">
          <span className="status-pill status-illegal">{t("result.illegal")}</span>
          <span className="illegal-id">ID {object.id}</span>
        </div>
        <h3>{object.address || `${object.district}, ${object.region}`}</h3>
        <p>
          <MapPin size={14} aria-hidden="true" />
          {object.district}, {regionName(t, object.region)}
        </p>
        <div className="illegal-row-meta">
          <span>{objectType(t, object.type)}</span>
          {area && <span>{area} {t("unit.m2")}</span>}
          {!compact && object.actDate && <span>{fmtDate(object.actDate, lang)}</span>}
        </div>
      </div>

      <ArrowRight className="illegal-row-arrow" size={18} aria-hidden="true" />
    </a>
  );
}

export function IllegalResultRow({ object }) {
  const { t, lang } = useApp();
  const area = fmtArea(object.area, lang);
  const photo = object.photos?.[0];
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <a
      className="result-row result-row--illegal"
      href={`#/object/illegal/${object.id}`}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/object/illegal/${object.id}`);
      }}
    >
      {photo && !photoFailed ? (
        <img
          className="result-row-photo"
          src={photo}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div className="result-row-icon result-row-icon--red">
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
      )}
      <div className="result-row-body">
        <div className="result-row-head">
          <h3>{object.address}</h3>
          <span className="status-pill status-illegal">{t("result.illegal")}</span>
        </div>
        <p className="result-row-address">
          <MapPin size={14} aria-hidden="true" />
          {object.district}, {regionName(t, object.region)}
        </p>
        <div className="result-row-meta">
          <span>ID {object.id}</span>
          <span>{objectType(t, object.type)}</span>
          {area && <span>{area} {t("unit.m2")}</span>}
          {object.actDate && <span>{fmtDate(object.actDate, lang)}</span>}
        </div>
      </div>
      <ArrowRight className="result-row-arrow" size={19} aria-hidden="true" />
    </a>
  );
}
