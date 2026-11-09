import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({
  value = 0,
  duration = 1200,
  format = (number) => Math.round(number).toLocaleString(),
}) {
  const [display, setDisplay] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const from = previousValue.current;
    const to = Number(value) || 0;
    const start = performance.now();
    let frame;

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previousValue.current = to;
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{format(display)}</>;
}
