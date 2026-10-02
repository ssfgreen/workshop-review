import { useLocation } from "preact-iso";
import { filtersToQuery, parseFilters, type Filters } from "../lib/filters.js";

/** Filters read from and written to the URL query, so they survive a refresh. */
export function useFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const { path, query, route } = useLocation();
  const filters = parseFilters(query);
  const set = (patch: Partial<Filters>) => route(path + filtersToQuery({ ...filters, ...patch }), true);
  return [filters, set];
}

/** A link to another screen that keeps the current filters. */
export function useLinkWithFilters() {
  const { query } = useLocation();
  const qs = filtersToQuery(parseFilters(query));
  return (path: string) => path + qs;
}
