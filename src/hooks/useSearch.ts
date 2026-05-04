import type { SearchFilters } from "@/types";

export function useSearch() {
  return {
    filters: {} as SearchFilters,
    setFilters: (_filters: SearchFilters) => undefined,
  };
}
