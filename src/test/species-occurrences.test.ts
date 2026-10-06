import { describe, expect, it } from "vitest";
import { acceptedTaxonKey, occurrenceTileUrl } from "@/lib/species-occurrences";

describe("real species occurrence maps", () => {
  it("uses the accepted species for synonym names", () => {
    expect(acceptedTaxonKey({ usageKey: 11260662, acceptedUsageKey: 2475264, matchType: "EXACT", rank: "SPECIES" })).toBe(2475264);
  });
  it("does not map fuzzy or higher-rank matches as a species", () => {
    expect(acceptedTaxonKey({ usageKey: 1, matchType: "FUZZY", rank: "SPECIES" })).toBeUndefined();
    expect(acceptedTaxonKey({ usageKey: 1, matchType: "EXACT", rank: "GENUS" })).toBeUndefined();
  });
  it("requests sourced occurrences for the selected species only", () => {
    expect(occurrenceTileUrl(2475264)).toContain("taxonKey=2475264&");
    expect(occurrenceTileUrl(2475264)).toContain("https://api.gbif.org/v2/map/occurrence/density/");
  });
});