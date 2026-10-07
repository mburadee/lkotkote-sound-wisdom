// GBIF records are observations/specimens, not a complete habitat or range boundary.
export function occurrenceTileUrl(taxonKey: number) {
  return `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${taxonKey}&style=orange.marker&bin=hex&hexPerTile=80&hasGeospatialIssue=false`;
}

export function acceptedTaxonKey(match: { usageKey?: number; acceptedUsageKey?: number; matchType?: string; rank?: string }) {
  if (match.matchType !== "EXACT" || match.rank !== "SPECIES") return undefined;
  return match.acceptedUsageKey ?? match.usageKey;
}

export interface OccurrencePoint {
  key: number;
  lat: number;
  lng: number;
  date: string;
  location: string;
  source: string;
  url: string;
}

type RawOccurrence = {
  key?: number; decimalLatitude?: number; decimalLongitude?: number; eventDate?: string; year?: number;
  locality?: string; stateProvince?: string; country?: string; datasetName?: string; institutionCode?: string; basisOfRecord?: string;
};

// Keeps only records with real coordinates; never invents missing date/location values.
export function toOccurrencePoints(results: RawOccurrence[]): OccurrencePoint[] {
  return results.flatMap((r) => {
    if (typeof r.key !== "number" || typeof r.decimalLatitude !== "number" || typeof r.decimalLongitude !== "number") return [];
    const location = [r.locality, r.stateProvince, r.country].filter(Boolean).join(", ") || "Location name not recorded";
    const basis = r.basisOfRecord ? r.basisOfRecord.toLowerCase().replace(/_/g, " ") : "";
    const source = [r.datasetName ?? r.institutionCode, basis].filter(Boolean).join(" · ") || "Source not recorded";
    return [{ key: r.key, lat: r.decimalLatitude, lng: r.decimalLongitude, date: r.eventDate?.slice(0, 10) ?? (r.year ? String(r.year) : "Date not recorded"), location, source, url: `https://www.gbif.org/occurrence/${r.key}` }];
  });
}
