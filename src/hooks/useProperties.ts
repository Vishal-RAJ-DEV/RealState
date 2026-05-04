import type { PropertyWithSeller } from "@/types";

export function useProperties() {
  return {
    properties: [] as PropertyWithSeller[],
    isLoading: false,
    error: null as string | null,
  };
}
