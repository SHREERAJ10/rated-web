"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Widest allowed frame (landscape cap, ~IG's 1.91:1)
const MAX_ASPECT_RATIO = 1.91;
// Tallest allowed frame ("mobile wallpaper" cap, ~9:19.5)
const MIN_ASPECT_RATIO = 9 / 19.5;
// Used until the first image has loaded and reported its real ratio
const DEFAULT_ASPECT_RATIO = 4 / 5;

export default function CarouselWithPagination({
  media,
  className = "",
  fit = "cover",
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [aspectRatio, setAspectRatio] = React.useState(DEFAULT_ASPECT_RATIO);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleFirstImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    const naturalRatio = naturalWidth / naturalHeight;
    const clampedRatio = Math.min(
      MAX_ASPECT_RATIO,
      Math.max(MIN_ASPECT_RATIO, naturalRatio),
    );
    setAspectRatio(clampedRatio);
  };

  return (
    <div className="relative w-full">
      <Carousel className={`w-full ${className}`} setApi={setApi}>
        <CarouselContent
          className={fit === "contain" ? "sm:h-[calc(100vh-3rem)]" : ""}
        >
          {media.map((image, index) => (
            <CarouselItem
              key={image.id}
              className={fit === "contain" ? "sm:h-[calc(100vh-3rem)]" : ""}
            >
              {fit === "contain" ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[12px] bg-surface-container">
                  <img
                    alt="post media"
                    className="max-w-full max-h-full object-contain"
                    src={image.mediaUrl}
                  />
                </div>
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-[12px] bg-surface-container"
                  style={{ aspectRatio }}
                >
                  <img
                    alt="post media"
                    className="absolute inset-0 w-full h-full object-cover"
                    src={image.mediaUrl}
                    onLoad={index === 0 ? handleFirstImageLoad : undefined}
                  />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        {media.length > 1 && (
          <>
            <CarouselPrevious className="left-2 sm:left-3 w-8 h-8 sm:w-9 sm:h-9 bg-surface-container-lowest/90 backdrop-blur-md border-none text-on-surface hover:bg-surface-container-lowest shadow-none" />
            <CarouselNext className="right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-surface-container-lowest/90 backdrop-blur-md border-none text-on-surface hover:bg-surface-container-lowest shadow-none" />
          </>
        )}
      </Carousel>

      {media.length > 1 && (
        <>
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[12px] font-medium text-on-surface">
            {current}/{count}
          </div>
          <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {Array.from({ length: count }).map((_, index) => (
              <button
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  current === index + 1
                    ? "bg-surface-container-lowest"
                    : "bg-surface-container-lowest/50",
                )}
                key={index}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
