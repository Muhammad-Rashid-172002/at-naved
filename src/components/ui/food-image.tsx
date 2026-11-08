"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import { resolveImage } from "@/config/images";
import { cn } from "@/lib/cn";

/** Unsplash's imgix CDN: resizes per device width and serves AVIF/WebP automatically. */
export const unsplashLoader = ({ src, width, quality }: ImageLoaderProps) =>
  `${src}?auto=format&fit=max&w=${width}&q=${quality ?? 72}`;

/**
 * Real food photograph. Accepts "photo:<key>" registry keys, uploaded URLs or /public paths.
 * Never renders broken: on error it falls back to a registry photo. Parent must be `relative`.
 */
export function FoodImage({
  src,
  alt,
  className,
  priority,
  quality,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const r = resolveImage(failed ? null : src);
  const plain = r.src.endsWith(".svg") || r.src.startsWith("data:");
  return (
    <Image
      src={r.src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      loader={r.remote ? unsplashLoader : undefined}
      unoptimized={plain}
      onLoad={() => setLoaded(true)}
      onError={() => !failed && setFailed(true)}
      style={r.position ? { objectPosition: r.position } : undefined}
      className={cn("object-cover transition-[opacity,transform,filter] duration-700", loaded || priority ? "opacity-100" : "opacity-0", className)}
    />
  );
}
