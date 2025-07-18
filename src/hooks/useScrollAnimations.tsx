
import { useEffect, useRef } from 'react';

export const useScrollAnimations = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            // Add animation classes based on data attributes
            if (element.dataset.scrollAnimation === 'slide-in-right') {
              element.classList.add('animate-slide-in-right');
            } else if (element.dataset.scrollAnimation === 'slide-in-left') {
              element.classList.add('animate-slide-in-left');
            } else if (element.dataset.scrollAnimation === 'fade-in-up') {
              element.classList.add('animate-fade-in-up');
            } else if (element.dataset.scrollAnimation === 'scale-in') {
              element.classList.add('animate-scale-in');
            }
            
            element.classList.add('animate-fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with data-scroll-animation attribute
    const elementsToObserve = document.querySelectorAll('[data-scroll-animation]');
    elementsToObserve.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return observerRef;
};
