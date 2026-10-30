import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useApp } from "../lib/app-context.js";

export default function PhotoLightbox({ photos, index, onIndex, onClose }) {
  const { t } = useApp();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % photos.length);
      if (event.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [index, photos.length, onClose, onIndex]);

  if (!photos.length) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={t("result.photos")}>
      <div className="lightbox-head">
        <span>
          {t("result.photoOf", { current: index + 1, total: photos.length })}
        </span>
        <button type="button" className="icon-button icon-button--light" onClick={onClose} aria-label={t("common.close")}>
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="lightbox-body">
        {photos.length > 1 && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--prev"
            onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
            aria-label={t("common.prev")}
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
        )}
        <img
          src={photos[index]}
          alt={`${t("result.photos")} ${index + 1}`}
          referrerPolicy="no-referrer"
        />
        {photos.length > 1 && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--next"
            onClick={() => onIndex((index + 1) % photos.length)}
            aria-label={t("common.next")}
          >
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="lightbox-dots">
        {photos.map((photo, photoIndex) => (
          <button
            key={photo}
            type="button"
            className={photoIndex === index ? "is-active" : ""}
            onClick={() => onIndex(photoIndex)}
            aria-label={`${photoIndex + 1}`}
            aria-current={photoIndex === index ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
