'use client';

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
// Import the updated ModelSelect and its props type
import { ModelSelect, ModelSelectProps } from './ModelSelect';
import { cn } from '@/lib/utils';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
// Remove unused imports if any
// import { ProviderKey } from "@/lib/provider-config";
// import { ProviderTiming } from "@/lib/image-types";

// Update Props Interface to use ModelSelectProps
interface ModelCardCarouselProps {
  // The models prop should be an array of objects matching ModelSelectProps
  models: ModelSelectProps[];
}

export function ModelCardCarousel({ models }: ModelCardCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const initialized = useRef(false);

  // Reset initialization state if the models array changes identity
  useEffect(() => {
    initialized.current = false;
  }, [models]);

  useLayoutEffect(() => {
    // Only initialize/reset scroll if api exists and not already done for this set of models
    if (!api || initialized.current) return;

    // Short delay can sometimes help ensure API is fully ready after model change
    const timer = setTimeout(() => {
      if (api.scrollSnapList().length > 0) {
        api.scrollTo(0, true); // Use immediate scroll
        setCurrentSlide(0);
        initialized.current = true; // Mark as initialized for this model set
      }
    }, 50); // 50ms delay

    return () => clearTimeout(timer);
  }, [api, models]); // Re-run if api or models change

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      // Check if api is still mounted/available
      if (api.selectedScrollSnap) {
        setCurrentSlide(api.selectedScrollSnap());
      }
    };

    api.on('select', onSelect);
    // Re-initialize listener when models change
    api.reInit(); // Reinitialize carousel properties

    return () => {
      // Check if api is still available before trying to turn off listener
      if (api.off) {
        api.off('select', onSelect);
      }
    };
  }, [api, models]); // Re-run if api or models change

  return (
    <div className="relative w-full mb-8">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          dragFree: false, // Keep dragFree false for better snap control
          containScroll: 'trimSnaps',
          loop: models.length > 1, // Only loop if more than one item
        }}
        // Add key based on models length or content hash if needed for hard reset
        // key={models.length}
      >
        <CarouselContent>
          {/* Map over the models array, passing each object directly to ModelSelect */}
          {models.map((modelProps, i) => (
            <CarouselItem key={modelProps.providerKey}>
              {' '}
              {/* Use providerKey as key */}
              {/* Spread the modelProps directly */}
              <ModelSelect {...modelProps} />
              {/* Slide indicator */}
              {models.length > 1 && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  {/* Use currentSlide derived from API state */}
                  {currentSlide + 1} of {models.length}
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Only show controls if more than one model */}
        {models.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background" />
          </>
        )}
      </Carousel>

      {/* Dot Indicators - Only show if more than one model */}
      {models.length > 1 && (
        <div className="absolute -bottom-6 left-0 right-0">
          <div className="flex justify-center gap-1">
            {models.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to model ${index + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-150 ease-in-out',
                  // Use currentSlide derived from API state for active dot
                  index === currentSlide
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-primary/50 hover:bg-primary/75', // Add hover effect
                )}
                onClick={() => api?.scrollTo(index)} // Use API to scroll
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
