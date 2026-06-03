'use client';

import { useEffect, useRef } from 'react';

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mouse interaction
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStrings();
    };

    window.addEventListener('resize', handleResize);
    canvas.width = width;
    canvas.height = height;

    // String Physics
    const strings: { points: { x: number; y: number; baseY: number; vy: number }[] }[] = [];
    const numStrings = 30; // Number of horizontal strings
    const numPoints = 80; // Points per string

    const initStrings = () => {
      strings.length = 0;
      const spacing = height / (numStrings + 1);
      for (let i = 0; i < numStrings; i++) {
        const points = [];
        const baseY = spacing * (i + 1);
        for (let j = 0; j <= numPoints; j++) {
          points.push({
            x: (width / numPoints) * j,
            y: baseY,
            baseY: baseY,
            vy: 0,
          });
        }
        strings.push({ points });
      }
    };

    initStrings();

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      ctx.lineWidth = 1;
      // Accent color #10B981 with low opacity, adapting dynamically to the theme
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)';

      strings.forEach((string, index) => {
        ctx.beginPath();
        
        string.points.forEach((point, i) => {
          // Mouse interaction
          const dx = mouseX - point.x;
          const dy = mouseY - point.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 250; // Interaction radius

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            // Push points away from mouse
            point.vy -= (dy / dist) * force * 0.8;
          }

          // Spring physics
          const spring = 0.03;
          const friction = 0.90;
          
          point.vy += (point.baseY - point.y) * spring;
          point.vy *= friction;
          point.y += point.vy;

          // Ambient vibration
          const vibration = Math.sin(time + index * 0.5 + i * 0.05) * 1.5;
          const finalY = point.y + vibration;

          if (i === 0) {
            ctx.moveTo(point.x, finalY);
          } else {
            const prevPoint = string.points[i - 1];
            const prevFinalY = prevPoint.y + Math.sin(time + index * 0.5 + (i - 1) * 0.05) * 1.5;
            const cx = (prevPoint.x + point.x) / 2;
            const cy = (prevFinalY + finalY) / 2;
            ctx.quadraticCurveTo(prevPoint.x, prevFinalY, cx, cy);
          }
        });
        
        const lastPoint = string.points[string.points.length - 1];
        const lastFinalY = lastPoint.y + Math.sin(time + index * 0.5 + (string.points.length - 1) * 0.05) * 1.5;
        ctx.lineTo(lastPoint.x, lastFinalY);

        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-2]"
      style={{ opacity: 0.8 }}
    />
  );
}
