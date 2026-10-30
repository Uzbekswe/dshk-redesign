import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Database,
  ExternalLink,
  FileText,
  Hash,
  Info,
  Layers,
  Map as MapIcon,
  MapPin,
  Printer,
  Ruler,
  SearchX,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import SearchCard from "../components/SearchCard.jsx";
import PhotoLightbox from "../components/PhotoLightbox.jsx";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import { getObject } from "../lib/data.js";
import {
  fmtArea,
  fmtDate,
  fmtDateTime,
  fmtInt,
  googleMapsUrl,
  objectType,
  regionName,
  shortText,
  statusKey,
  statusLabel
} from "../lib/format.js";

export default function ResultPage({ route }) {
  const { t, lang, toast } = useApp();
  const kind = route.segments[1];
  const id = route.segments[2];
  const object = getObject(kind, id);

  useEffect(() => {
    if (!object) return undefined;
    const title =
      object.verdict === "registered"
        ? `${object.shortName || object.reestr} — ShaffofQurilish`
        : `${object.address} — ShaffofQurilish`;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [object]);

  if (!object) {
    return <ObjectNotFound />;
  }

  const isConstruction = object.verdict === "registered";
  const tone = isConstruction ? "registered" : "illegal";

  const share = async () => {
    const shareData = {
      title: isConstruction ? object.shortName : object.address,
      text: isConstruction
        ? `${t("result.registered")} · ${t("result.reestr")}: ${object.reestr}`
        : `${t("result.illegal")} · ID ${object.id}`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast(t("toast.copied"));
      } else {
        toast(t("toast.copyError"));
      }
    } catch (error) {
      if (error?.name !== "AbortError") toast(t("toast.shareError"));
    }
  };

  const print = () => {
    toast(t("result.printHint"));
    window.setTimeout(() => window.print(), 300);
  };

  return (
    <div className={`page result-page result-page--${tone}`}>
      <div className="container">
        <a
          className="back-link"
          href={isConstruction ? "#/" : "#/registry"}
          onClick={(event) => {
            event.preventDefault();
            navigate(isConstruction ? "/" : "/registry");
          }}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          {isConstruction ? t("common.backHome") : t("home.openRegistry")}
        </a>

        <section className={`verdict-card verdict-card--${tone}`}>
          <div className="verdict-main">
            <span className="verdict-icon">
              {isConstruction ? <ShieldCheck size={32} aria-hidden="true" /> : <ShieldAlert size={32} aria-hidden="true" />}
            </span>
            <div>
              <span className="verdict-label">{t("result.verdict")}</span>
              <h1>{isConstruction ? t("result.registered") : t("result.illegal")}</h1>
              <p>{isConstruction ? t("result.registeredNote") : t("result.illegalNote")}</p>
            </div>
          </div>
          <div className="verdict-side">
            <span className="source-pill">
              <Database size={14} aria-hidden="true" />
              {t("result.verified")}
            </span>
            <span className="verdict-updated">
              {t("result.updated")}: {fmtDate(object.updatedAt || object.actDate, lang) || "26.10.2026"}
            </span>
            <span className="demo-pill">{t("common.demoData")}</span>
          </div>
        </section>

        <div className="object-head">
          <span className="eyebrow">{objectType(t, object.type)}</span>
          <h2>{isConstruction ? object.shortName : object.address}</h2>
          <p className="object-head-address">
            <MapPin size={17} aria-hidden="true" />
            {isConstruction
              ? `${object.address}, ${object.district}, ${regionName(t, object.region)}`
              : `${object.district}, ${regionName(t, object.region)}`}
          </p>
          <div className="object-head-tags">
            {isConstruction && (
              <span className={`status-pill status-${statusKey(object)}`}>{statusLabel(t, object)}</span>
            )}
            <span className="type-badge">{objectType(t, object.type)}</span>
            {isConstruction && object.cadastral && <span className="type-badge type-badge--demo">{t("result.demoTag")}</span>}
          </div>
        </div>

        <div className="result-layout">
          <div className="result-main">
            {isConstruction ? (
              <ConstructionContent object={object} />
            ) : (
              <IllegalContent object={object} />
            )}
          </div>

          <aside className="result-aside">
            <div className="panel action-panel">
              <h2>{t("nav.check")}</h2>
              <button
                type="button"
                className="button button-primary button-block"
                onClick={() => navigate(`/map?object=${isConstruction ? "construction" : "illegal"}:${object.id}`)}
              >
                <MapIcon size={18} aria-hidden="true" />
                {t("result.map")}
              </button>
              <div className="action-row">
                <button type="button" className="button button-ghost" onClick={share}>
                  <Share2 size={17} aria-hidden="true" />
                  {t("result.share")}
                </button>
                <button type="button" className="button button-ghost" onClick={print}>
                  <Printer size={17} aria-hidden="true" />
                  {t("result.pdf")}
                </button>
              </div>
              <a
                className="button button-danger-ghost button-block"
                href="https://t.me/shaffof_qurilish"
                target="_blank"
                rel="noreferrer"
              >
                <Send size={17} aria-hidden="true" />
                {t("result.complaint")}
              </a>

              {object.lat && object.lon && (
                <div className="action-location">
                  <span>{t("result.location")}</span>
                  <strong>
                    {object.lat.toFixed(5)}, {object.lon.toFixed(5)}
                  </strong>
                  <a href={googleMapsUrl(object.lat, object.lon)} target="_blank" rel="noreferrer">
                    {t("result.openInMaps")}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>

            <div className="panel source-panel">
              <span className="panel-icon">
                <Database size={19} aria-hidden="true" />
              </span>
              <div>
                <h2>{t("result.source")}</h2>
                <p>{isConstruction ? t("result.sourceConstruction") : t("result.sourceIllegal")}</p>
                <span className="source-date">
                  {t("footer.updated")}
                </span>
              </div>
            </div>

            <div className="panel contact-panel">
              <span className="panel-icon panel-icon--blue">
                <Send size={19} aria-hidden="true" />
              </span>
              <h2>{t("result.contactTitle")}</h2>
              <p>{t("result.contactText")}</p>
              <a href="https://t.me/shaffof_qurilish" target="_blank" rel="noreferrer" className="text-link">
                {t("footer.telegram")}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>

        <div className="result-demo-note">
          <Info size={17} aria-hidden="true" />
          <p>{t("result.demoNote")}</p>
        </div>
      </div>
    </div>
  );
}

function ConstructionContent({ object }) {
  const { t, lang } = useApp();
  const area = fmtArea(object.area, lang);
  const status = statusKey(object);
  const deadline = fmtDate(object.deadline, lang);
  const noteKey =
    status === "stopped"
      ? "result.statusNoteStopped"
      : status === "frozen"
        ? "result.statusNoteFrozen"
        : "result.statusNoteProgress";

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>
            <ClipboardList size={19} aria-hidden="true" />
            {t("result.about")}
          </h2>
          <span className="panel-tag">{object.reestr}</span>
        </div>

        <div className="facts-grid">
          <Fact label={t("result.reestr")} value={object.reestr} mono />
          <Fact
            label={t("result.cadastral")}
            value={object.cadastral || t("common.na")}
            meta={object.demoCadastral ? t("result.demoCadastral") : null}
            mono
          />
          <Fact label={t("result.type")} value={objectType(t, object.type)} />
          <Fact label={t("result.sphere")} value={object.sphere || t("common.na")} />
          <Fact label={t("result.region")} value={regionName(t, object.region)} />
          <Fact label={t("result.district")} value={object.district} />
          <Fact label={t("result.floors")} value={fmtInt(object.floors, lang)} />
          <Fact label={t("result.apartments")} value={object.apartments ? fmtInt(object.apartments, lang) : t("common.na")} />
          <Fact label={t("result.blocks")} value={object.blocks ? fmtInt(object.blocks, lang) : t("common.na")} />
          <Fact label={t("result.area")} value={area ? `${area} ${t("unit.m2")}` : t("result.areaUnknown")} />
          <Fact label={t("result.deadline")} value={deadline || t("common.na")} />
          <Fact label={t("result.updated")} value={fmtDateTime(object.updatedAt, lang) || t("common.na")} />
          <Fact label={t("result.organization")} value={object.organization || t("common.na")} wide />
          <Fact label={t("result.projectName")} value={shortText(object.name, 260)} wide />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>
            <CalendarDays size={19} aria-hidden="true" />
            {t("result.timeline")}
          </h2>
          <span className={`status-pill status-${status}`}>{statusLabel(t, object)}</span>
        </div>

        <Timeline
          steps={[
            {
              title: t("result.updated"),
              date: fmtDate(object.updatedAt, lang),
              state: "done"
            },
            {
              title: t("result.timelinePlanned"),
              date: deadline,
              state: "current",
              tone: status === "progress" ? "blue" : "amber"
            },
            {
              title: t("result.timelineCompleted"),
              date: null,
              state: "todo"
            }
          ]}
        />

        <div className={`status-note status-note--${status === "progress" ? "blue" : "amber"}`}>
          {status === "progress" ? <Info size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
          <p>{t(noteKey, { date: deadline || t("common.na") })}</p>
        </div>
      </section>

      {object.blockList?.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h2>
              <Layers size={19} aria-hidden="true" />
              {t("result.blocksTitle")}
            </h2>
          </div>
          <div className="table-wrap">
            <table className="blocks-table">
              <thead>
                <tr>
                  <th>{t("result.blockName")}</th>
                  <th>{t("result.blockFloor")}</th>
                  <th>{t("result.blockApts")}</th>
                  <th>{t("result.blockArea")}</th>
                </tr>
              </thead>
              <tbody>
                {object.blockList.map((block, index) => (
                  <tr key={`${block.name}-${index}`}>
                    <td>{block.name || t("common.na")}</td>
                    <td>{block.floor ? fmtInt(block.floor, lang) : t("common.na")}</td>
                    <td>{block.apartments ? fmtInt(block.apartments, lang) : t("common.na")}</td>
                    <td>{block.area ? `${fmtArea(block.area, lang)} ${t("unit.m2")}` : t("common.na")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h2>
            <FileText size={19} aria-hidden="true" />
            {t("result.documents")}
          </h2>
        </div>
        <div className="doc-grid">
          <div className="doc-card doc-card--ok">
            <span className="doc-icon">
              <CheckCircle2 size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>{t("result.docRegistry")}</h3>
              <p>{t("result.docRegistryText")}</p>
            </div>
          </div>
          <div className="doc-card doc-card--demo">
            <span className="doc-icon">
              <Hash size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>{t("result.docCadastral")}</h3>
              <p>{t("result.docCadastralText")}</p>
              <span className="mini-demo">{t("result.demoTag")}</span>
            </div>
          </div>
          <div className="doc-card doc-card--muted">
            <span className="doc-icon">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>{t("result.docQr")}</h3>
              <p>{t("result.docQrText")}</p>
            </div>
          </div>
        </div>
        <p className="panel-note">
          <Info size={15} aria-hidden="true" />
          {t("result.docsNote")}
        </p>
      </section>
    </>
  );
}

function IllegalContent({ object }) {
  const { t, lang } = useApp();
  const [photoIndex, setPhotoIndex] = useState(null);
  const photos = object.photos || [];
  const area = fmtArea(object.area, lang);

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>
            <AlertTriangle size={19} aria-hidden="true" />
            {t("result.about")}
          </h2>
          <span className="panel-tag panel-tag--red">ID {object.id}</span>
        </div>

        <div className="illegal-address-block">
          <span className="eyebrow eyebrow--red">{t("result.address")}</span>
          <h3>{object.address}</h3>
          <p>
            <MapPin size={15} aria-hidden="true" />
            {object.district}, {regionName(t, object.region)}
          </p>
        </div>

        <div className="facts-grid">
          <Fact label={t("result.id")} value={object.id} mono />
          <Fact label="DAN ID" value={object.danId || t("common.na")} mono />
          <Fact label={t("result.region")} value={regionName(t, object.region)} />
          <Fact label={t("result.district")} value={object.district} />
          <Fact label={t("result.type")} value={objectType(t, object.type)} />
          <Fact label={t("result.area")} value={area ? `${area} ${t("unit.m2")}` : t("result.areaUnknown")} />
          <Fact label={t("result.purpose")} value={object.purpose || t("common.na")} wide />
          <Fact label={t("result.decision")} value={object.decision || t("common.na")} mono />
          <Fact label={t("result.protocol")} value={object.protocol || t("common.na")} mono />
          <Fact label={t("result.actDate")} value={fmtDate(object.actDate, lang) || t("common.na")} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>
            <CalendarDays size={19} aria-hidden="true" />
            {t("result.timeline")}
          </h2>
          <span className="status-pill status-illegal">{t("result.illegal")}</span>
        </div>

        <Timeline
          steps={[
            {
              title: t("result.timelineDetected"),
              date: fmtDate(object.actDate, lang),
              state: "done",
              tone: "red"
            },
            {
              title: t("reestr.registered"),
              date: null,
              state: "current",
              tone: "red"
            }
          ]}
        />

        <div className="status-note status-note--red">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{t("result.illegalNote")}</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>
            <Camera size={19} aria-hidden="true" />
            {t("result.photos")}
          </h2>
          <span className="panel-tag">{t("result.photoCount", { count: object.photoCount || photos.length })}</span>
        </div>

        {photos.length > 0 ? (
          <>
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  className="photo-tile"
                  onClick={() => setPhotoIndex(index)}
                  aria-label={`${t("result.photos")} ${index + 1}`}
                >
                  <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  <span className="photo-zoom">
                    <Camera size={17} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
            <p className="panel-note">
              <Camera size={15} aria-hidden="true" />
              {t("result.photoHint")}
            </p>
          </>
        ) : (
          <p className="empty-inline">{t("result.noPhotos")}</p>
        )}
      </section>

      {photoIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={photoIndex}
          onIndex={setPhotoIndex}
          onClose={() => setPhotoIndex(null)}
        />
      )}
    </>
  );
}

function Fact({ label, value, meta, wide = false, mono = false }) {
  return (
    <div className={wide ? "fact fact--wide" : "fact"}>
      <span>{label}</span>
      <strong className={mono ? "mono" : undefined}>
        {value}
        {meta && <em className="fact-meta">{meta}</em>}
      </strong>
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div
          className={`timeline-step timeline-step--${step.state}${step.tone ? ` timeline-step--${step.tone}` : ""}`}
          key={`${step.title}-${index}`}
        >
          <span className="timeline-dot">
            {step.state === "done" ? <CheckCircle2 size={18} aria-hidden="true" /> : <span />}
          </span>
          <div>
            <strong>{step.title}</strong>
            <span>{step.date || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObjectNotFound() {
  const { t } = useApp();

  return (
    <div className="page">
      <div className="container page-narrow">
        <div className="empty-state">
          <span className="empty-icon">
            <SearchX size={30} aria-hidden="true" />
          </span>
          <h1>{t("result.notFound")}</h1>
          <p>{t("result.notFoundText")}</p>
          <div className="empty-actions">
            <button type="button" className="button button-primary" onClick={() => navigate("/")}>
              {t("common.backHome")}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="button button-ghost" onClick={() => navigate("/map")}>
              {t("search.pickMap")}
            </button>
          </div>
          <div className="empty-search">
            <SearchCard variant="page" initialKind="number" />
          </div>
        </div>
      </div>
    </div>
  );
}
