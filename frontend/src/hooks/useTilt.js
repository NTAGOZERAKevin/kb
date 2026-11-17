import { useCallback, useRef } from 'react';

// Pointer-driven 3D tilt. Writes straight to the DOM on mousemove so the effect
// never re-renders React, and optionally feeds a CSS spotlight position.
export function useTilt({ max = 7, scale = 1.01, spotlight = false } = {}) {
  const ref = useRef(null);

  const onMouseMove = useCallback(
    (event) => {
      const node = ref.current;

      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      node.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${
        -y * max
      }deg) scale(${scale})`;

      if (spotlight) {
        node.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
        node.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
      }
    },
    [max, scale, spotlight],
  );

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg) scale(1)';
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
