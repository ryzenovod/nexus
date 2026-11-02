import React, { useEffect, useRef } from 'react';
import { AtmosphereMode } from '../../types/nexus';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface StarryTwilightCanvasProps {
  mode: AtmosphereMode;
}

export const StarryTwilightCanvas: React.FC<StarryTwilightCanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);

  useEffect(() => {
    if (mode === 'transparent') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Delicate silver-monochrome stars
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const count = Math.floor((width * height) / 10000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.0 + 0.4,
          alpha: Math.random() * 0.4 + 0.1,
          twinkleSpeed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    };
    initStars();

    const triggerMeteor = () => {
      meteorsRef.current.push({
        x: Math.random() * (width * 0.8) + width * 0.1,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 70 + 40,
        speed: Math.random() * 8 + 12,
        angle: Math.PI / 4,
        opacity: 0.6,
        active: true,
      });
    };

    const onTaskCompletedEvent = () => {
      triggerMeteor();
    };
    window.addEventListener('nexus-task-completed', onTaskCompletedEvent);

    // Draw subtle minimal crescent moon
    const drawCrescentMoon = () => {
      ctx.save();
      const moonX = width * 0.85;
      const moonY = height * 0.10;
      const radius = 14;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cutout with pure obsidian background
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(moonX + 5, moonY - 3, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Main render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep, pure obsidian dark surface (#09090b)
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Subtle monochromatic vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        width * 0.2,
        width * 0.5,
        height * 0.5,
        width * 0.85
      );
      vignette.addColorStop(0, 'rgba(18, 18, 22, 0.3)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle crescent moon
      drawCrescentMoon();

      // Draw delicate silver stars
      ctx.save();
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.5 || star.alpha < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(244, 244, 245, ${star.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Draw meteors
      meteorsRef.current.forEach((m) => {
        if (!m.active) return;

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity * 0.5})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.opacity -= 0.02;

        if (m.opacity <= 0 || m.x > width || m.y > height) {
          m.active = false;
        }
      });

      meteorsRef.current = meteorsRef.current.filter((m) => m.active);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('nexus-task-completed', onTaskCompletedEvent);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  if (mode === 'transparent') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: 0.35 }}
    />
  );
};
