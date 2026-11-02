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
      const count = Math.floor((width * height) / 9000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.1 + 0.4,
          alpha: Math.random() * 0.5 + 0.15,
          twinkleSpeed: (Math.random() * 0.007 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
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

    // Main render loop: transparent clear so ambient gradient shines through
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw delicate silver stars
      ctx.save();
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.65 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(244, 244, 245, ${star.alpha * 0.75})`;
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
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity * 0.7})`);

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
      style={{ opacity: 0.8 }}
    />
  );
};
