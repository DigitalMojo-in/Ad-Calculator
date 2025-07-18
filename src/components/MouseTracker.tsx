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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };

      trailDots.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: 5 + Math.random() * 3,
        life: 1
      });

      if (trailDots.current.length > 40) {
        trailDots.current.shift();
      }

      const element = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive = element && (
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.tagName === 'INPUT' ||
        element.closest('[role="button"]') ||
        element.closest('.cursor-pointer')
      );
      
      setIsHovering(Boolean(isInteractive));
    };

    const animate = () => {
      const easing = 0.12;
      mousePosition.current.x += (targetPosition.current.x - mousePosition.current.x) * easing;
      mousePosition.current.y += (targetPosition.current.y - mousePosition.current.y) * easing;

      cursor.style.transform = `translate3d(${mousePosition.current.x - 16}px, ${mousePosition.current.y - 16}px, 0)`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailDots.current = trailDots.current.filter(dot => {
        dot.life -= 0.02;
        dot.opacity = dot.life;

        if (dot.life > 0) {
          ctx.save();
          ctx.globalAlpha = dot.opacity * 0.6;
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 12;
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <>
      {/* Canvas Trail */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998]"
        style={{ mixBlendMode: 'difference' }}
      />

      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-300 ease-out ${
          isHovering ? 'scale-150 bg-white/90' : 'scale-100 bg-white/60'
        }`}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
    </>
  );
};

export default MouseTracker;
