import React, { useEffect, useRef } from 'react';
import { AtmosphereMode } from '../../types/nexus';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  isSparkle: boolean;
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

interface Cloud {
  x: number;
  y: number;
  speed: number;
  radius: number;
  opacity: number;
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

    // Initialize stars
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const count = Math.floor((width * height) / 8000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.8),
          size: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: (Math.random() * 0.03 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          isSparkle: Math.random() > 0.88,
        });
      }
    };
    initStars();

    // Initialize drifting clouds
    const clouds: Cloud[] = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: height * 0.3 + Math.random() * (height * 0.4),
      speed: Math.random() * 0.12 + 0.04,
      radius: Math.random() * 120 + 80,
      opacity: Math.random() * 0.04 + 0.02,
    }));

    // Trigger meteor function
    const triggerMeteor = () => {
      meteorsRef.current.push({
        x: Math.random() * (width * 0.8) + width * 0.1,
        y: Math.random() * (height * 0.3),
        length: Math.random() * 100 + 80,
        speed: Math.random() * 9 + 12,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
        active: true,
      });
    };

    // External listener for task completion meteors
    const onTaskCompletedEvent = () => {
      triggerMeteor();
      setTimeout(triggerMeteor, 150);
    };
    window.addEventListener('nexus-task-completed', onTaskCompletedEvent);

    // Random natural shooting stars
    const meteorInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerMeteor();
      }
    }, 4500);

    // Draw 4-point sparkle star
    const drawSparkle = (cx: number, cy: number, size: number, alpha: number) => {
      ctx.save();
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 3);
      ctx.quadraticCurveTo(cx, cy, cx + size * 3, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + size * 3);
      ctx.quadraticCurveTo(cx, cy, cx - size * 3, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - size * 3);
      ctx.fill();
      ctx.restore();
    };

    // Main render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mode === 'twilight') {
        // Starry Twilight deep purple/violet sunset gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#090714');
        gradient.addColorStop(0.35, '#160e33');
        gradient.addColorStop(0.65, '#2e1065');
        gradient.addColorStop(0.85, '#581c87');
        gradient.addColorStop(1, '#1e1136');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Warm horizon glow (city lamps & cozy windows)
        const horizonGlow = ctx.createRadialGradient(
          width * 0.5,
          height * 1.1,
          50,
          width * 0.5,
          height * 1.1,
          width * 0.7
        );
        horizonGlow.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
        horizonGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.08)');
        horizonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, 0, width, height);
      } else if (mode === 'cyber') {
        // Deep Cyber Cozy Neon Night
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#06070b');
        gradient.addColorStop(0.5, '#120b22');
        gradient.addColorStop(1, '#0b0c16');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const neonGlow = ctx.createRadialGradient(
          width * 0.85,
          height * 0.15,
          10,
          width * 0.85,
          height * 0.15,
          width * 0.5
        );
        neonGlow.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        neonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = neonGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Crescent Moon in top-right
      const moonX = width - 110;
      const moonY = 90;
      const moonRadius = 26;

      ctx.save();
      // Moon ambient glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 3.5);
      moonGlow.addColorStop(0, 'rgba(250, 204, 21, 0.22)');
      moonGlow.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon shape
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0.2 * Math.PI, 1.8 * Math.PI, false);
      ctx.bezierCurveTo(moonX - 5, moonY + 15, moonX - 5, moonY - 15, moonX + moonRadius * Math.cos(0.2 * Math.PI), moonY - moonRadius * Math.sin(0.2 * Math.PI));
      ctx.fill();
      ctx.restore();

      // Draw drifting clouds
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.radius > width) {
          cloud.x = -cloud.radius;
        }

        ctx.save();
        const cloudGradient = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          cloud.radius * 0.2,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        cloudGradient.addColorStop(0, `rgba(168, 85, 247, ${cloud.opacity})`);
        cloudGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Stars
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.twinkleSpeed = -Math.abs(star.twinkleSpeed);
        } else if (star.alpha < 0.2) {
          star.alpha = 0.2;
          star.twinkleSpeed = Math.abs(star.twinkleSpeed);
        }

        if (star.isSparkle) {
          drawSparkle(star.x, star.y, star.size, star.alpha);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 3;
          ctx.fill();
        }
      });

      // Draw Meteors
      meteorsRef.current.forEach((meteor) => {
        if (!meteor.active) return;

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity -= 0.012;

        if (meteor.opacity <= 0 || meteor.x > width || meteor.y > height) {
          meteor.active = false;
          return;
        }

        ctx.save();
        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const meteorGradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        meteorGradient.addColorStop(0, `rgba(254, 240, 138, ${meteor.opacity})`);
        meteorGradient.addColorStop(0.3, `rgba(236, 72, 153, ${meteor.opacity * 0.8})`);
        meteorGradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = meteorGradient;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(254, 240, 138, 0.8)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();

        // Meteor Head Spark
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Filter out dead meteors
      meteorsRef.current = meteorsRef.current.filter((m) => m.active);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('nexus-task-completed', onTaskCompletedEvent);
      clearInterval(meteorInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  if (mode === 'transparent') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
};
