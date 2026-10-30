import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  AttributionControl,
  setWorkerUrl
} from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  Layers,
  List,
  MapPin,
  Satellite,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useApp } from "../lib/app-context.js";
import { navigate } from "../lib/router.js";
import {
  constructionObjects,
  getObject,
  illegalObjects,
  regions
} from "../lib/data.js";
import {
  fmtInt,
  objectType,
  regionName,
  statusKey,
  statusLabel
} from "../lib/format.js";

const EMPTY = { type: "FeatureCollection", features: [] };
const MAX_LIST = 120;

setWorkerUrl(maplibreWorkerUrl);

const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

function addBasemapLayers(map) {
  map.addSource("satellite", {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution: "Esri, Maxar, Earthstar Geographics"
  });
  map.addLayer({
    id: "base-satellite",
    type: "raster",
    source: "satellite",
    layout: { visibility: "none" }
  });
}

function addDataLayers(map) {
  map.addSource("construction", { type: "geojson", data: EMPTY });
  map.addSource("illegal", {
    type: "geojson",
    data: EMPTY,
    cluster: true,
    clusterMaxZoom: 13,
    clusterRadius: 46
  });

  map.addLayer({
    id: "construction-halo",
    type: "circle",
    source: "construction",
    paint: {
      "circle-radius": 11,
      "circle-color": "#ffffff",
      "circle-opacity": 0.9
    }
  });

  map.addLayer({
    id: "construction-points",
    type: "circle",
    source: "construction",
    paint: {
      "circle-radius": 6,
      "circle-color": [
        "match",
        ["get", "statusKey"],
        "progress",
        "#007AFF",
        "stopped",
        "#B45309",
        "frozen",
        "#B45309",
        "#64748b"
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });

  map.addLayer({
    id: "illegal-clusters",
    type: "circle",
    source: "illegal",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#FB7185",
        10,
        "#E11D48",
        50,
        "#9F1239"
      ],
      "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28],
      "circle-opacity": 0.92,
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff"
    }
  });

  map.addLayer({
    id: "illegal-cluster-count",
    type: "symbol",
    source: "illegal",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 12
    },
    paint: { "text-color": "#ffffff" }
  });

  map.addLayer({
    id: "illegal-points",
    type: "circle",
    source: "illegal",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "#E11D48",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });
}

function parseObjectParam(value) {
  if (!value) return null;
  const [kind, id] = String(value).split(":");
  if (!["construction", "illegal"].includes(kind) || !id) return null;
  return { kind, id };
}

function constructionFeature(item) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [item.lon, item.lat] },
    properties: {
      kind: "construction",
      id: String(item.id),
      title: item.shortName || item.reestr,
      statusKey: statusKey(item)
    }
  };
}

function illegalFeature(item) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [item.lon, item.lat] },
    properties: {
      kind: "illegal",
      id: String(item.id),
      title: item.address || `ID ${item.id}`
    }
  };
}

export default function MapPage({ route }) {
  const { t, lang } = useApp();
  const objectParam = route.params.get("object");
  const [region, setRegion] = useState(route.params.get("region") || "");
  const [showProgress, setShowProgress] = useState(true);
  const [showStopped, setShowStopped] = useState(true);
  const [showIllegal, setShowIllegal] = useState(true);
  const [basemap, setBasemap] = useState("osm");
  const [selected, setSelected] = useState(() => parseObjectParam(objectParam));
  const [panelOpen, setPanelOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const regionConstructions = useMemo(
    () => constructionObjects.filter((item) => !region || item.region === region),
    [region]
  );
  const regionIllegal = useMemo(
    () => illegalObjects.filter((item) => (!region || item.region === region) && item.lat && item.lon),
    [region]
  );

  const counts = useMemo(
    () => ({
      progress: regionConstructions.filter((item) => statusKey(item) === "progress").length,
      stopped: regionConstructions.filter((item) => statusKey(item) !== "progress").length,
      illegal: regionIllegal.length
    }),
    [regionConstructions, regionIllegal]
  );

  const visibleConstructions = useMemo(
    () =>
      regionConstructions.filter((item) => {
        const key = statusKey(item);
        if (key === "progress") return showProgress;
        return showStopped;
      }),
    [regionConstructions, showProgress, showStopped]
  );

  const visibleIllegal = showIllegal ? regionIllegal : [];
  const total = visibleConstructions.length + visibleIllegal.length;

  const constructionGeo = useMemo(
    () => ({ type: "FeatureCollection", features: visibleConstructions.map(constructionFeature) }),
    [visibleConstructions]
  );
  const illegalGeo = useMemo(
    () => ({ type: "FeatureCollection", features: visibleIllegal.map(illegalFeature) }),
    [visibleIllegal]
  );

  const listItems = useMemo(() => {
    const constructions = visibleConstructions.map((item) => ({
      kind: "construction",
      id: item.id,
      title: item.shortName || item.reestr,
      subtitle: `${item.address} · ${regionName(t, item.region)}`,
      tone: statusKey(item) === "progress" ? "blue" : "amber",
      badge: statusLabel(t, item)
    }));
    const illegal = visibleIllegal.map((item) => ({
      kind: "illegal",
      id: item.id,
      title: item.address || `ID ${item.id}`,
      subtitle: `${item.district} · ${regionName(t, item.region)}`,
      tone: "red",
      badge: t("result.illegal")
    }));
    return [...constructions, ...illegal];
  }, [visibleConstructions, visibleIllegal, t]);

  const selectedObject = selected ? getObject(selected.kind, selected.id) : null;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [64.6, 41.2],
      zoom: 5.3,
      minZoom: 4,
      maxZoom: 18,
      attributionControl: false
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      addBasemapLayers(map);
      addDataLayers(map);
      setMapReady(true);

      const openFeature = (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        setSelected({
          kind: feature.properties.kind,
          id: feature.properties.id
        });
        setPanelOpen(false);
      };

      map.on("click", "construction-points", openFeature);
      map.on("click", "illegal-points", openFeature);

      map.on("click", "illegal-clusters", async (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        try {
          const source = map.getSource("illegal");
          const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: Math.min(zoom + 0.4, 16),
            duration: 650
          });
        } catch {
          map.easeTo({ center: feature.geometry.coordinates, zoom: 11, duration: 650 });
        }
      });

      ["construction-points", "illegal-points", "illegal-clusters"].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    mapRef.current?.getSource("construction")?.setData(constructionGeo);
  }, [constructionGeo, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    mapRef.current?.getSource("illegal")?.setData(illegalGeo);
  }, [illegalGeo, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    map.setLayoutProperty(
      "base-satellite",
      "visibility",
      basemap === "satellite" ? "visible" : "none"
    );
  }, [basemap, mapReady]);

  useEffect(() => {
    if (!objectParam) return;
    const parsed = parseObjectParam(objectParam);
    if (parsed) setSelected(parsed);
  }, [objectParam]);

  useEffect(() => {
    if (!mapReady || !selectedObject?.lat || !selectedObject?.lon) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [selectedObject.lon, selectedObject.lat],
      zoom: Math.max(map.getZoom(), 13.4),
      duration: 850,
      essential: true
    });
  }, [mapReady, selectedObject]);

  const enableAll = () => {
    setShowProgress(true);
    setShowStopped(true);
    setShowIllegal(true);
  };

  const pick = (item) => {
    setSelected({ kind: item.kind, id: item.id });
    setPanelOpen(false);
  };

  return (
    <div className="map-page">
      <div className="map-shell">
        <aside className={panelOpen ? "map-panel is-open" : "map-panel"} aria-label={t("map.panelTitle")}>
          <div className="map-panel-head">
            <div>
              <span className="eyebrow">{t("nav.map")}</span>
              <h1>{t("map.title")}</h1>
              <p>{t("map.subtitle")}</p>
            </div>
            <button
              type="button"
              className="icon-button map-panel-close"
              onClick={() => setPanelOpen(false)}
              aria-label={t("map.filtersClose")}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="map-panel-body">
            <div className="map-total">
              <span className="map-total-icon">
                <Layers size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>{fmtInt(total, lang)}</strong>
                <span>{t("map.objects")}</span>
              </div>
            </div>

            <fieldset className="layer-group">
              <legend>{t("map.layerObjects")}</legend>
              <LayerToggle
                checked={showProgress}
                onChange={() => setShowProgress((value) => !value)}
                label={t("map.inProgress")}
                count={counts.progress}
                tone="blue"
                lang={lang}
                t={t}
              />
              <LayerToggle
                checked={showStopped}
                onChange={() => setShowStopped((value) => !value)}
                label={t("map.stoppedFrozen")}
                count={counts.stopped}
                tone="amber"
                lang={lang}
                t={t}
              />
            </fieldset>

            <fieldset className="layer-group">
              <legend>{t("map.layerViolations")}</legend>
              <LayerToggle
                checked={showIllegal}
                onChange={() => setShowIllegal((value) => !value)}
                label={t("map.illegal")}
                count={counts.illegal}
                tone="red"
                lang={lang}
                t={t}
              />
            </fieldset>

            <fieldset className="layer-group layer-group--disabled">
              <legend>{t("map.layerPlans")}</legend>
              <DisabledLayer label={t("map.masterPlans")} soon={t("common.soon")} />
            </fieldset>

            <fieldset className="layer-group layer-group--disabled">
              <legend>{t("map.layerGeology")}</legend>
              <DisabledLayer label={t("map.seismic")} soon={t("common.soon")} />
              <DisabledLayer label={t("map.accelerogram")} soon={t("common.soon")} />
            </fieldset>

            <fieldset className="layer-group layer-group--disabled">
              <legend>{t("map.layerTools")}</legend>
              <DisabledLayer label={t("map.buildings3d")} soon={t("common.soon")} />
              <DisabledLayer label={t("map.landfills")} soon={t("common.soon")} />
            </fieldset>

            <div className="map-field">
              <label htmlFor="map-region">{t("map.region")}</label>
              <select
                id="map-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="">{t("map.allRegions")}</option>
                {regions.map((item) => (
                  <option value={item} key={item}>
                    {regionName(t, item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-field">
              <span className="map-field-label">{t("map.basemap")}</span>
              <div className="segmented">
                <button
                  type="button"
                  className={basemap === "osm" ? "is-active" : ""}
                  onClick={() => setBasemap("osm")}
                >
                  {t("map.osm")}
                </button>
                <button
                  type="button"
                  className={basemap === "satellite" ? "is-active" : ""}
                  onClick={() => setBasemap("satellite")}
                >
                  <Satellite size={14} aria-hidden="true" />
                  {t("map.satellite")}
                </button>
              </div>
            </div>

            <div className="map-list-head">
              <h2>
                <List size={17} aria-hidden="true" />
                {t("map.listTitle")}
              </h2>
              <span>{fmtInt(listItems.length, lang)}</span>
            </div>

            {listItems.length > 0 ? (
              <div className="map-list">
                {listItems.slice(0, MAX_LIST).map((item) => (
                  <button
                    type="button"
                    key={`${item.kind}-${item.id}`}
                    className="map-list-item"
                    onClick={() => pick(item)}
                  >
                    <span className={`map-list-dot map-list-dot--${item.tone}`} />
                    <span className="map-list-text">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ))}
                {listItems.length > MAX_LIST && (
                  <p className="map-list-more">
                    {t("map.more", { count: fmtInt(listItems.length - MAX_LIST, lang) })}
                  </p>
                )}
                {showIllegal && counts.illegal > 0 && (
                  <button
                    type="button"
                    className="text-link map-registry-link"
                    onClick={() => navigate("/registry")}
                  >
                    {t("map.openRegistry")}
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <p className="map-list-empty">{t("map.noObjects")}</p>
            )}
          </div>
        </aside>

        {panelOpen && (
          <button
            type="button"
            className="map-panel-backdrop"
            aria-label={t("map.filtersClose")}
            onClick={() => setPanelOpen(false)}
          />
        )}

        <div className="map-stage">
          <div className="map-canvas" ref={containerRef} />

          <div className="map-mobile-bar">
            <button type="button" className="map-filter-button" onClick={() => setPanelOpen(true)}>
              <SlidersHorizontal size={17} aria-hidden="true" />
              {t("map.filtersOpen")}
            </button>
            <span className="map-mobile-count">
              <span className="dot dot--blue" />
              {fmtInt(total, lang)}
            </span>
          </div>

          <div className="map-legend">
            <span>
              <i className="legend-dot legend-dot--blue" />
              {t("map.registered")}
            </span>
            <span>
              <i className="legend-dot legend-dot--red" />
              {t("map.illegalLegend")}
            </span>
          </div>

          {!mapReady && !mapError && (
            <div className="map-loading">
              <span className="spinner" />
              {t("map.loading")}
            </div>
          )}

          {mapError && (
            <div className="map-error">
              <AlertTriangle size={26} aria-hidden="true" />
              <strong>{t("map.error")}</strong>
              <p>{t("map.errorText")}</p>
            </div>
          )}

          {mapReady && total === 0 && (
            <div className="map-empty">
              <span className="map-empty-icon">
                <Layers size={24} aria-hidden="true" />
              </span>
              <strong>{t("map.empty")}</strong>
              <p>{t("map.emptyText")}</p>
              <button type="button" className="button button-primary button-small" onClick={enableAll}>
                {t("map.enableAll")}
              </button>
            </div>
          )}

          {selectedObject && (
            <div className="map-selected">
              <button
                type="button"
                className="icon-button map-selected-close"
                onClick={() => setSelected(null)}
                aria-label={t("map.close")}
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div className="map-selected-top">
                <span className={`status-pill status-${selectedObject.verdict === "registered" ? statusKey(selectedObject) : "illegal"}`}>
                  {selectedObject.verdict === "registered" ? statusLabel(t, selectedObject) : t("result.illegal")}
                </span>
                <span className="type-badge">{objectType(t, selectedObject.type)}</span>
              </div>

              <h3>
                {selectedObject.verdict === "registered"
                  ? selectedObject.shortName
                  : selectedObject.address}
              </h3>
              <p>
                <MapPin size={14} aria-hidden="true" />
                {selectedObject.verdict === "registered"
                  ? `${selectedObject.address}, ${selectedObject.district}`
                  : `${selectedObject.district}, ${regionName(t, selectedObject.region)}`}
              </p>

              <div className="map-selected-actions">
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() =>
                    navigate(
                      `/object/${selectedObject.verdict === "registered" ? "construction" : "illegal"}/${selectedObject.id}`
                    )
                  }
                >
                  {t("map.openCard")}
                </button>
                <button
                  type="button"
                  className="button button-ghost button-small"
                  onClick={() => setSelected(null)}
                >
                  {t("map.close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LayerToggle({ checked, onChange, label, count, tone, lang, t }) {
  return (
    <label className="layer-row">
      <span className={`layer-swatch layer-swatch--${tone}`} aria-hidden="true" />
      <span className="layer-text">
        <strong>{label}</strong>
        <small>
          {fmtInt(count, lang)} {t("unit.pieces")}
        </small>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

function DisabledLayer({ label, soon }) {
  return (
    <div className="layer-row is-disabled">
      <span className="layer-swatch layer-swatch--gray" aria-hidden="true" />
      <span className="layer-text">
        <strong>{label}</strong>
      </span>
      <span className="soon-badge">{soon}</span>
    </div>
  );
}
