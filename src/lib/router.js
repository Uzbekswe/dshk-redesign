import { useEffect, useState } from "react";

export function parseHash(hash = window.location.hash) {
  const raw = hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart || "/";
  const params = new URLSearchParams(queryPart || "");
  const segments = path.split("/").filter(Boolean);
  return { path, segments, params };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(to) {
  const target = to.startsWith("#") ? to : `#${to}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = target;
}

export function routeQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}
