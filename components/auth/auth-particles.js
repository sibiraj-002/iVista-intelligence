"use client";

const PARTICLES = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: `${(index * 17 + 5) % 98}%`,
  opacity: 0.12 + (index % 6) * 0.07,
  size: index % 5 === 0 ? 3.5 : index % 3 === 0 ? 2.5 : 1.5,
  top: `${(index * 23 + 9) % 96}%`,
}));

export function AuthParticles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-auth-particles
    >
      {PARTICLES.map((particle) => (
        <span
          className="absolute rounded-full bg-white"
          data-auth-particle
          key={particle.id}
          style={{
            height: particle.size,
            left: particle.left,
            opacity: particle.opacity,
            top: particle.top,
            width: particle.size,
          }}
        />
      ))}
    </div>
  );
}
