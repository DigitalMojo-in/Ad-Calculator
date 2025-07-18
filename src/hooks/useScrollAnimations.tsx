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
            if (element.dataset.animateFrom === 'right') {
              element.classList.add('animate-slide-in-right');
              element.classList.remove('translate-x-full', 'opacity-0');
            } else if (element.dataset.animateFrom === 'left') {
              element.classList.add('animate-slide-in-left');
              element.classList.remove('-translate-x-full', 'opacity-0');
            } else if (element.dataset.animateFrom === 'bottom') {
              element.classList.add('animate-slide-in-bottom');
              element.classList.remove('translate-y-full', 'opacity-0');
            } else if (element.dataset.animateFrom === 'fade') {
              element.classList.add('animate-fade-in');
              element.classList.remove('opacity-0');
            } else if (element.dataset.animateFrom === 'scale') {
              element.classList.add('animate-scale-in');
              element.classList.remove('scale-95', 'opacity-0');
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with data-animate-from attribute
    const animateElements = document.querySelectorAll('[data-animate-from]');
    animateElements.forEach((el) => {
      const element = el as HTMLElement;
      
      // Set initial state based on animation type
      if (element.dataset.animateFrom === 'right') {
        element.classList.add('translate-x-full', 'opacity-0', 'transition-all', 'duration-700', 'ease-out');
      } else if (element.dataset.animateFrom === 'left') {
        element.classList.add('-translate-x-full', 'opacity-0', 'transition-all', 'duration-700', 'ease-out');
      } else if (element.dataset.animateFrom === 'bottom') {
        element.classList.add('translate-y-full', 'opacity-0', 'transition-all', 'duration-700', 'ease-out');
      } else if (element.dataset.animateFrom === 'fade') {
        element.classList.add('opacity-0', 'transition-all', 'duration-700', 'ease-out');
      } else if (element.dataset.animateFrom === 'scale') {
        element.classList.add('scale-95', 'opacity-0', 'transition-all', 'duration-700', 'ease-out');
      }
      
      observerRef.current?.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return null;
};