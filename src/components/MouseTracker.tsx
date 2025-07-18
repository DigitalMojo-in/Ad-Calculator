
import React, { useEffect, useRef, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  id: number;
}

export const MouseTracker: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef<MousePosition>({ x: 0, y: 0 });
  const cursorPosition = useRef<MousePosition>({ x: 0, y: 0 });
  const trailPosition = useRef<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [trailDots, setTrailDots] = useState<TrailDot[]>([]);
  const animationFrame = useRef<number>();
  const dotIdCounter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      
      // Add new trail dot
      const newDot: TrailDot = {
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        scale: 1,
        id: dotIdCounter.current++
      };
      
      setTrailDots(prev => [...prev.slice(-8), newDot]); // Keep last 8 dots
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, .hover-target, input, select, textarea')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, .hover-target, input, select, textarea')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      // Smooth cursor following with easing
      const easing = 0.15;
      cursorPosition.current.x += (mousePosition.current.x - cursorPosition.current.x) * easing;
      cursorPosition.current.y += (mousePosition.current.y - cursorPosition.current.y) * easing;

      // Trail following with slower easing
      const trailEasing = 0.08;
      trailPosition.current.x += (mousePosition.current.x - trailPosition.current.x) * trailEasing;
      trailPosition.current.y += (mousePosition.current.y - trailPosition.current.y) * trailEasing;

      // Update cursor position
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPosition.current.x}px, ${cursorPosition.current.y}px, 0)`;
      }

      // Update trail position
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPosition.current.x}px, ${trailPosition.current.y}px, 0)`;
      }

      // Update trail dots opacity and scale
      setTrailDots(prev => prev.map((dot, index) => ({
        ...dot,
        opacity: Math.max(0, 1 - (prev.length - index) * 0.15),
        scale: Math.max(0.3, 1 - (prev.length - index) * 0.1)
      })).filter(dot => dot.opacity > 0.01));

      // Draw canvas trail
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          trailDots.forEach((dot, index) => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 3 * dot.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(30, 163, 79, ${dot.opacity * 0.6})`;
            ctx.fill();
          });
        }
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [trailDots]);

  useEffect(() => {
    // Set canvas size
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * {
          cursor: none !important;
        }
        
        button, a, input, select, textarea, .hover-target {
          cursor: none !important;
        }
      `}</style>

      {/* Canvas for trail dots */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ mixBlendMode: 'difference' }}
      />

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-200 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#1ea34f',
          boxShadow: '0 0 20px rgba(30, 163, 79, 0.5)',
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Trail cursor */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(30, 163, 79, 0.3)',
          boxShadow: '0 0 30px rgba(30, 163, 79, 0.3)',
          mixBlendMode: 'multiply',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};
