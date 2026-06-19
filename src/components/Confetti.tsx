import React from 'react';

const PARTICLE_COUNT = 12;

/** Pure CSS confetti — max 12 particles, GPU transforms only. */
export function Confetti() {
  return (
    <div className="confetti-root pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <span key={i} className={`confetti-particle confetti-particle--${i}`} />
      ))}
    </div>
  );
}
