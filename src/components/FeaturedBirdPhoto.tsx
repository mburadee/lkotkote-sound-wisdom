import { useState } from "react";
import { Bird } from "lucide-react";
import { featuredBirdPhoto } from "@/lib/featured-bird-photos";

type Props = {
  scientificName: string;
  alt: string;
  className: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
};

function Photo({ scientificName, alt, ...props }: Props) {
  const photo = featuredBirdPhoto(scientificName);
  const [fallback, setFallback] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  if (!photo || unavailable) {
    return <span className={`${props.className} flex items-center justify-center bg-muted`} role="img" aria-label={`${alt} — photo unavailable`}><Bird className="h-8 w-8 text-muted-foreground" /></span>;
  }
  return (
    <img {...props} alt={alt} src={fallback ? photo.fallbackUrl : photo.url}
      onError={() => fallback ? setUnavailable(true) : setFallback(true)} />
  );
}

export default function FeaturedBirdPhoto(props: Props) {
  return <Photo key={props.scientificName} {...props} />;
}