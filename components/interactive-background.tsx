'use client';

import { useEffect, useRef } from 'react';

type FloorTheme = {
  dark: boolean;
  lineRgb: string;
  baseAlpha: number;
  lineWidth: number;
};

function readFloorTheme(): FloorTheme {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const lineRgb = styles.getPropertyValue('--floor-line-rgb').trim() || '4, 120, 87';
  const baseAlpha = Number.parseFloat(styles.getPropertyValue('--floor-alpha')) || 0.22;
  const lineWidth = Number.parseFloat(styles.getPropertyValue('--floor-line-width')) || 0.65;

  return {
    dark: root.classList.contains('dark'),
    lineRgb,
    baseAlpha,
    lineWidth,
  };
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isVisible = !document.hidden;
    let elapsed = 0;
    let theme = readFloorTheme();
    let needsPaint = true;

    let mouseX = width * 0.5;
    let mouseY = height * 0.38;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let mouseActive = false;

    const isMobile = () => width < 768;

    const syncTheme = () => {
      theme = readFloorTheme();
      needsPaint = true;
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsPaint = true;
    };

    const drawDepthWash = () => {
      const wash = context.createRadialGradient(
        width * 0.72,
        height * 0.22,
        0,
        width * 0.72,
        height * 0.22,
        Math.max(width, height) * 0.55
      );

      if (theme.dark) {
        wash.addColorStop(0, 'rgba(148, 163, 184, 0.045)');
        wash.addColorStop(0.45, 'rgba(71, 85, 105, 0.02)');
        wash.addColorStop(1, 'transparent');
      } else {
        wash.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
        wash.addColorStop(0.4, 'rgba(241, 245, 249, 0.1)');
        wash.addColorStop(1, 'transparent');
      }

      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);
    };

    const drawSpotlight = () => {
      const spotX = mouseActive ? mouseX : width * 0.42 + Math.sin(elapsed * 0.1) * width * 0.03;
      const spotY = mouseActive ? mouseY : height * 0.28 + Math.cos(elapsed * 0.08) * height * 0.02;
      const radius = Math.min(width, height) * (mouseActive ? 0.28 : 0.32);
      const gradient = context.createRadialGradient(spotX, spotY, 0, spotX, spotY, radius);

      if (theme.dark) {
        gradient.addColorStop(0, 'rgba(226, 232, 240, 0.04)');
        gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.015)');
        gradient.addColorStop(1, 'transparent');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        gradient.addColorStop(0.45, 'rgba(248, 250, 252, 0.06)');
        gradient.addColorStop(1, 'transparent');
      }

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(spotX, spotY, radius, 0, Math.PI * 2);
      context.fill();
    };

    const drawPerspectiveFloor = () => {
      const mobile = isMobile();
      const pointerOffsetX = ((mouseX / Math.max(width, 1)) - 0.5) * (mobile ? 18 : 48);
      const pointerOffsetY = ((mouseY / Math.max(height, 1)) - 0.5) * (mobile ? 10 : 22);
      const horizonY = height * 0.54 + pointerOffsetY;
      const vanishingX = width * 0.5 + pointerOffsetX;
      const floorBottom = height + 36;
      const focal = Math.max(height * 0.72, 220);
      const cameraHeight = mobile ? 88 : 118;
      const nearZ = 48;
      const farZ = mobile ? 420 : 560;
      const spacingZ = mobile ? 38 : 32;
      const halfWidth = mobile ? 420 : 720;
      const verticalCount = mobile ? 11 : 17;
      const waveAmplitude = mobile ? 4 : 7;
      const scrollZ = prefersReducedMotion ? 0 : (elapsed * 22) % spacingZ;
      const { lineRgb, baseAlpha, lineWidth } = theme;
      const lineWStrong = lineWidth + 0.3;

      const project = (worldX: number, worldZ: number) => {
        const z = Math.max(worldZ, 1);
        const scale = focal / z;
        const wave =
          Math.sin(worldX * 0.0035 + worldZ * 0.0028 - elapsed * 0.28) * waveAmplitude;
        return {
          x: vanishingX + worldX * scale,
          y: horizonY + (cameraHeight + wave) * scale,
        };
      };

      const depthFade = (worldZ: number, screenY: number) => {
        const depthT = Math.min(1, Math.max(0, (worldZ - nearZ) / (farZ - nearZ)));
        const nearEdge = 1 - Math.pow(1 - depthT, 1.35);
        const bottomEdge = Math.min(1, Math.max(0, (floorBottom - screenY) / (height * 0.22)));
        const horizonEdge = Math.min(1, Math.max(0, (screenY - horizonY) / (height * 0.08)));
        return nearEdge * bottomEdge * horizonEdge;
      };

      const strokePolyline = (
        points: Array<{ x: number; y: number }>,
        alpha: number,
        strokeWidth: number
      ) => {
        if (points.length < 2 || alpha <= 0.01) return;
        context.globalAlpha = alpha;
        context.lineWidth = strokeWidth;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let index = 1; index < points.length; index++) {
          context.lineTo(points[index].x, points[index].y);
        }
        context.stroke();
      };

      context.save();
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = `rgba(${lineRgb}, 1)`;

      for (let line = 0; line < verticalCount; line++) {
        const progress = line / (verticalCount - 1);
        const worldX = -halfWidth + progress * halfWidth * 2;
        const steps = mobile ? 18 : 28;
        const points: Array<{ x: number; y: number }> = [];
        const strokeWidth = progress === 0.5 ? lineWStrong : lineWidth;

        for (let step = 0; step <= steps; step++) {
          const worldZ = nearZ + (step / steps) * (farZ - nearZ);
          const point = project(worldX, worldZ);
          if (point.y < horizonY - 2 || point.y > floorBottom) {
            if (points.length >= 2) {
              const mid = points[Math.floor(points.length / 2)];
              const midZ = nearZ + ((farZ - nearZ) * 0.55);
              strokePolyline(points, baseAlpha * (0.5 + depthFade(midZ, mid.y) * 0.65), strokeWidth);
            }
            points.length = 0;
            continue;
          }
          points.push(point);
        }

        if (points.length >= 2) {
          const mid = points[Math.floor(points.length / 2)];
          const midZ = (nearZ + farZ) * 0.55;
          strokePolyline(points, baseAlpha * (0.5 + depthFade(midZ, mid.y) * 0.65), strokeWidth);
        }
      }

      const horizontalCount = Math.ceil((farZ - nearZ) / spacingZ) + 1;
      for (let line = 0; line < horizontalCount; line++) {
        const worldZ = farZ - line * spacingZ - scrollZ;
        if (worldZ < nearZ || worldZ > farZ) continue;

        const segments = mobile ? 20 : 32;
        const points: Array<{ x: number; y: number }> = [];
        const center = project(0, worldZ);
        const alpha = baseAlpha * (0.32 + depthFade(worldZ, center.y) * 0.9);
        const strokeWidth = worldZ < nearZ + spacingZ * 2 ? lineWStrong : lineWidth;

        for (let segment = 0; segment <= segments; segment++) {
          const worldX = -halfWidth + (segment / segments) * halfWidth * 2;
          const point = project(worldX, worldZ);
          if (point.y < horizonY - 2 || point.y > floorBottom) {
            strokePolyline(points, alpha, strokeWidth);
            points.length = 0;
            continue;
          }
          points.push(point);
        }

        strokePolyline(points, alpha, strokeWidth);
      }

      context.restore();
      context.globalAlpha = 1;
    };

    const drawSparks = () => {
      const particleCount = isMobile() ? 5 : 8;
      context.fillStyle = theme.dark ? 'rgba(226, 232, 240, 0.5)' : 'rgba(15, 23, 42, 0.35)';

      for (let index = 0; index < particleCount; index++) {
        const x = ((Math.sin(elapsed * 0.07 + index * 1.7) * 0.5 + 0.5) * width + index * 61) % width;
        const y =
          height * 0.55 +
          (((Math.cos(elapsed * 0.055 + index * 2.1) * 0.5 + 0.5) * height * 0.4 + index * 29) %
            (height * 0.4));
        const radius = 0.55 + (Math.sin(elapsed * 0.6 + index) * 0.5 + 0.5) * 0.45;

        context.globalAlpha = 0.06 + (Math.sin(elapsed + index) * 0.5 + 0.5) * 0.1;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const paint = (animate: boolean) => {
      context.clearRect(0, 0, width, height);
      drawDepthWash();
      drawSpotlight();
      drawPerspectiveFloor();
      if (animate && !prefersReducedMotion) drawSparks();
      needsPaint = false;
    };

    const render = () => {
      if (isVisible) {
        elapsed += 0.012;
        mouseX += (targetMouseX - mouseX) * 0.045;
        mouseY += (targetMouseY - mouseY) * 0.045;
        paint(true);
      } else if (needsPaint) {
        paint(false);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouseX = event.clientX;
      targetMouseY = event.clientY;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) needsPaint = true;
    };

    const handleResize = () => {
      resizeCanvas();
      if (prefersReducedMotion) paint(false);
    };

    const handleThemeChange = () => {
      syncTheme();
      paint(!prefersReducedMotion && isVisible);
    };

    const themeObserver = new MutationObserver(handleThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    resizeCanvas();
    syncTheme();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('themechange', handleThemeChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (prefersReducedMotion) {
      paint(false);
    } else {
      render();
    }

    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('themechange', handleThemeChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-2]"
      aria-hidden="true"
    />
  );
}
