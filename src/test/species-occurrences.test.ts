import { describe, expect, it } from "vitest";
import { acceptedTaxonKey, occurrenceTileUrl, toOccurrencePoints } from "@/lib/species-occurrences";

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
  it("drops records without coordinates and links each point to its GBIF entry", () => {
    const points = toOccurrencePoints([{ key: 42, decimalLatitude: 1, decimalLongitude: 37, eventDate: "2021-05-03T10:00", country: "Kenya" }, { key: 7 }]);
    expect(points).toHaveLength(1);
    expect(points[0].url).toBe("https://www.gbif.org/occurrence/42");
    expect(points[0].date).toBe("2021-05-03");
  });
});