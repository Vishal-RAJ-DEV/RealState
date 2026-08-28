import type { PropertyWithDetails } from "@/types";

export function useProperties() {
  return {
    properties: [] as PropertyWithDetails[],
    isLoading: false,
    error: null as string | null,
  };
}
