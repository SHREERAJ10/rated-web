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

export default function CarouselWithPagination({ media, className="" }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

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

  return (
    <div>
      <Carousel className={`w-full max-w-sm ${className}`} setApi={setApi}>
        <CarouselContent>
          {media.map((image) => (
            <CarouselItem key={image.id}>
              <img
                alt="dddepth-248"
                className="size-full rounded-xl object-cover"
                src={image.mediaUrl}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {media.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
      {media.length > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              className={cn("h-2 w-2 rounded-full border-2", {
                "border-primary": current === index + 1,
              })}
              key={index}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
