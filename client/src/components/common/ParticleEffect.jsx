import React, { useEffect, useRef } from "react";

/**
 * ParticleEffect Component
 * Generates floating heart particles for romantic arcade aesthetic
 */
export default function ParticleEffect() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Generate random particles on mount and at intervals
    const generateParticles = () => {
      const container = containerRef.current;
      if (!container) return;

      const particleCount = Math.random() > 0.7 ? 1 : 0;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";

        // Random start position
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        // Random size
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random color (pink/cyan for arcade theme)
        const colors = [
          "rgba(255, 0, 255, 0.6)",
          "rgba(0, 255, 255, 0.6)",
          "rgba(255, 20, 147, 0.6)",
          "rgba(200, 100, 255, 0.6)",
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = randomColor;

        // Random trajectory
        const tx = (Math.random() - 0.5) * 200;
        const ty = -300 - Math.random() * 200;
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => particle.remove(), 3000);
      }
    };

    // Generate particles periodically
    const interval = setInterval(generateParticles, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="particle-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
