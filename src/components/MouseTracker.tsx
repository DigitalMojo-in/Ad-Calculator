import React, { useEffect, useRef, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  size: number;
  life: number;
}

const MouseTracker: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef<MousePosition>({ x: 0, y: 0 });
  const targetPosition = useRef<MousePosition>({ x: 0, y: 0 });
  const trailDots = useRef<TrailDot[]>([]);
  const animationFrame = useRef<number>();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    if (!cursor || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Hide default cursor
    document.body.style.cursor = 'none';
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      (el as HTMLElement).style.cursor = 'none';
    });

    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };

      // Add trail dot
      trailDots.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: Math.random() * 3 + 2,
        life: 1
      });

      // Limit trail dots
      if (trailDots.current.length > 20) {
        trailDots.current.shift();
      }

      // Check if hovering over interactive elements
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive = element && (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.closest('button') ||
        element.closest('a') ||
        element.closest('input') ||
        element.closest('select') ||
        element.closest('[role="button"]') ||
        element.closest('.cursor-pointer')
      );
      
      setIsHovering(Boolean(isInteractive));
    };

    const animate = () => {
      // Smooth cursor movement with easing
      const easing = 0.15;
      mousePosition.current.x += (targetPosition.current.x - mousePosition.current.x) * easing;
      mousePosition.current.y += (targetPosition.current.y - mousePosition.current.y) * easing;

      // Update cursor position
      cursor.style.transform = `translate3d(${mousePosition.current.x - 12}px, ${mousePosition.current.y - 12}px, 0)`;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail dots
      trailDots.current = trailDots.current.filter(dot => {
        dot.life -= 0.05;
        dot.opacity = dot.life;
        
        if (dot.life > 0) {
          ctx.save();
          ctx.globalAlpha = dot.opacity * 0.6;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size * dot.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    animate();

    return () => {
      document.body.style.cursor = '';
      allElements.forEach(el => {
        (el as HTMLElement).style.cursor = '';
      });
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <>
      {/* Canvas for trail dots */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ mixBlendMode: 'difference' }}
      />
      
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-200 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          mixBlendMode: 'difference',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        }}
      />
    </>
  );
};

export default MouseTracker;