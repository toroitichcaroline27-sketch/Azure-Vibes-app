import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0078D4', '#00BCF2', '#10B981', '#F59E0B', '#6366F1'],
      });
    }
  } catch (e) {
    console.warn('Confetti effect skipped:', e);
  }
}

export function fireMegaConfetti() {
  try {
    if (typeof window === 'undefined') return;
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      try {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0078D4', '#00BCF2', '#38BDF8'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#F59E0B', '#818CF8'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      } catch (err) {
        // ignore frame animation errors
      }
    };
    frame();
  } catch (e) {
    console.warn('Mega confetti skipped:', e);
  }
}
