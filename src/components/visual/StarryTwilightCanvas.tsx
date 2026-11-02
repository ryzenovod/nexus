import React, { useEffect, useRef } from 'react';
import { AtmosphereMode } from '../../types/nexus';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  isSparkle: boolean;
  color: string;
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

interface CloudLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
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

    // Initialize stars with varied twilight colors (pure white, cyan sparkle, pale amber)
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#e0e7ff', '#fbcfe8'];
      const count = Math.floor((width * height) / 6000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.85),
          size: Math.random() * 2.0 + 0.5,
          alpha: Math.random() * 0.85 + 0.15,
          twinkleSpeed: (Math.random() * 0.025 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          isSparkle: Math.random() > 0.85,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };
    initStars();

    // Trigger meteor function
    const triggerMeteor = () => {
      meteorsRef.current.push({
        x: Math.random() * (width * 0.8) + width * 0.1,
        y: Math.random() * (height * 0.35),
        length: Math.random() * 110 + 90,
        speed: Math.random() * 8 + 14,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        opacity: 1,
        active: true,
      });
    };

    const onTaskCompletedEvent = () => {
      triggerMeteor();
      setTimeout(triggerMeteor, 180);
      setTimeout(triggerMeteor, 360);
    };
    window.addEventListener('nexus-task-completed', onTaskCompletedEvent);

    const meteorInterval = setInterval(() => {
      if (Math.random() > 0.35) {
        triggerMeteor();
      }
    }, 4000);

    // Draw 4-point sparkle star
    const drawSparkle = (cx: number, cy: number, size: number, alpha: number, color: string) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 3.5);
      ctx.quadraticCurveTo(cx, cy, cx + size * 3.5, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + size * 3.5);
      ctx.quadraticCurveTo(cx, cy, cx - size * 3.5, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - size * 3.5);
      ctx.fill();
      ctx.restore();
    };

    // Draw silhouette of anime utility telegraph pole and wires (from reference art)
    const drawTelegraphPolesAndWires = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(8, 6, 18, 0.7)';
      ctx.fillStyle = 'rgba(8, 6, 18, 0.85)';
      ctx.lineWidth = 1.2;

      const poleX = width * 0.18;
      const poleBaseY = height;
      const poleTopY = height * 0.65;

      // Wooden pole shaft
      ctx.fillRect(poleX - 4, poleTopY, 8, poleBaseY - poleTopY);

      // Crossarms
      ctx.fillRect(poleX - 28, poleTopY + 16, 56, 4);
      ctx.fillRect(poleX - 22, poleTopY + 36, 44, 4);

      // Insulator pegs
      ctx.fillRect(poleX - 26, poleTopY + 11, 4, 5);
      ctx.fillRect(poleX + 22, poleTopY + 11, 4, 5);
      ctx.fillRect(poleX - 20, poleTopY + 31, 4, 5);
      ctx.fillRect(poleX + 16, poleTopY + 31, 4, 5);

      // Power lines catenary curves across the sky
      ctx.beginPath();
      ctx.moveTo(0, poleTopY + 30);
      ctx.quadraticCurveTo(poleX * 0.5, poleTopY + 55, poleX - 26, poleTopY + 13);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(poleX + 22, poleTopY + 13);
      ctx.quadraticCurveTo(width * 0.55, poleTopY + 70, width, poleTopY + 40);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, poleTopY + 50);
      ctx.quadraticCurveTo(poleX * 0.5, poleTopY + 75, poleX - 20, poleTopY + 33);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(poleX + 16, poleTopY + 33);
      ctx.quadraticCurveTo(width * 0.6, poleTopY + 95, width, poleTopY + 65);
      ctx.stroke();

      ctx.restore();
    };

    // Main render loop
    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      if (mode === 'twilight') {
        // Deep Indigo to Sunset Magenta Twilight Gradient (Matching Image 2 Reference)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
        skyGradient.addColorStop(0, '#060611');
        skyGradient.addColorStop(0.35, '#0e1233');
        skyGradient.addColorStop(0.60, '#23124d');
        skyGradient.addColorStop(0.80, '#58135e');
        skyGradient.addColorStop(0.92, '#831843'); // Vibrant sunset magenta
        skyGradient.addColorStop(0.98, '#be185d');
        skyGradient.addColorStop(1, '#1c0e2a');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height);

        // Sunset Horizon Glow & Cozy Window Amber Light
        const sunsetGlow = ctx.createRadialGradient(
          width * 0.45,
          height * 0.96,
          20,
          width * 0.45,
          height * 0.96,
          width * 0.8
        );
        sunsetGlow.addColorStop(0, 'rgba(244, 63, 94, 0.45)'); // Hot pink/magenta horizon
        sunsetGlow.addColorStop(0.35, 'rgba(245, 158, 11, 0.28)'); // Amber house window glow
        sunsetGlow.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)');
        sunsetGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sunsetGlow;
        ctx.fillRect(0, 0, width, height);

        // Azure-rimmed billowy night clouds (from Reference 2)
        const cloudOffset = (tick * 0.15) % (width + 600);
        ctx.save();
        const blueCloudGradient = ctx.createRadialGradient(
          width * 0.7 - cloudOffset * 0.3,
          height * 0.45,
          80,
          width * 0.7 - cloudOffset * 0.3,
          height * 0.45,
          380
        );
        blueCloudGradient.addColorStop(0, 'rgba(30, 58, 138, 0.35)');
        blueCloudGradient.addColorStop(0.6, 'rgba(14, 116, 144, 0.18)');
        blueCloudGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = blueCloudGradient;
        ctx.beginPath();
        ctx.arc(width * 0.7 - cloudOffset * 0.3, height * 0.45, 380, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw telegraph poles and wires on twilight horizon
        drawTelegraphPolesAndWires();

        // Warm cozy house window lights along bottom horizon
        ctx.save();
        const houseX = width * 0.52;
        const houseY = height - 38;
        // Window 1
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
        ctx.shadowBlur = 18;
        ctx.fillRect(houseX, houseY, 22, 14);
        // Window 2
        ctx.fillRect(houseX + 32, houseY + 2, 18, 12);
        ctx.restore();

      } else if (mode === 'cyber') {
        // Deep Cyber Cozy Neon Night (Matching Image 1 Reference)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#06050e');
        gradient.addColorStop(0.45, '#140c26');
        gradient.addColorStop(0.85, '#200e3d');
        gradient.addColorStop(1, '#0b0817');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Purple Neon Gamepad Wall Aura
        const purpleAura = ctx.createRadialGradient(
          width * 0.85,
          height * 0.25,
          20,
          width * 0.85,
          height * 0.25,
          width * 0.45
        );
        purpleAura.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
        purpleAura.addColorStop(0.5, 'rgba(236, 72, 153, 0.1)');
        purpleAura.addColorStop(1, 'transparent');
        ctx.fillStyle = purpleAura;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Glowing Crescent Moon
      const moonX = width - 105;
      const moonY = 85;
      const moonRadius = 26;

      ctx.save();
      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 3.8);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      moonGlow.addColorStop(0.45, 'rgba(244, 114, 182, 0.12)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon Body
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0.2 * Math.PI, 1.8 * Math.PI, false);
      ctx.bezierCurveTo(moonX - 5, moonY + 16, moonX - 5, moonY - 16, moonX + moonRadius * Math.cos(0.2 * Math.PI), moonY - moonRadius * Math.sin(0.2 * Math.PI));
      ctx.fill();
      ctx.restore();

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
          drawSparkle(star.x, star.y, star.size, star.alpha, star.color);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.alpha;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.globalAlpha = 1;
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
        meteorGradient.addColorStop(0.3, `rgba(236, 72, 153, ${meteor.opacity * 0.85})`);
        meteorGradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = meteorGradient;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(254, 240, 138, 0.9)';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

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
