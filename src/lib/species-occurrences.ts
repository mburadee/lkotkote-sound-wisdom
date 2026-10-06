// GBIF records are observations/specimens, not a complete habitat or range boundary.
export function occurrenceTileUrl(taxonKey: number) {
  return `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?taxonKey=${taxonKey}&style=green.point&bin=hex&hexPerTile=80`;
}

export function acceptedTaxonKey(match: { usageKey?: number; acceptedUsageKey?: number; matchType?: string; rank?: string }) {
  if (match.matchType !== "EXACT" || match.rank !== "SPECIES") return undefined;
  return match.acceptedUsageKey ?? match.usageKey;
}