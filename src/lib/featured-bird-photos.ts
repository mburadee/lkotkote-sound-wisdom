import sources from "@/assets/featured-birds/sources.json";

type PhotoSource = { originalUrl: string; source: string };
const credits: Record<string, PhotoSource> = sources;
const photos = import.meta.glob<{ default: { url: string } }>(
  "../assets/featured-birds/*.jpg.asset.json",
  { eager: true },
);

/** Both bird pages use the same unedited Wikipedia photographs. */
export function featuredBirdPhoto(scientificName: string) {
  const filename = scientificName.toLowerCase().replace(/ /g, "_");
  const asset = photos[`../assets/featured-birds/${filename}.jpg.asset.json`]?.default;
  const credit = credits[scientificName];
  if (!asset || !credit) return undefined;
  return { url: asset.url, fallbackUrl: credit.originalUrl, source: credit.source };
}