import pc from 'picocolors';

const SPIN_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function startSpinner(message: string): { update: (msg: string) => void; stop: () => void } {
  let current = message;
  let frame = 0;

  const interval = setInterval(() => {
    const spin = SPIN_FRAMES[frame % SPIN_FRAMES.length] ?? '⠋';
    process.stdout.write(`\r  ${pc.cyan(spin)}  ${current}   `);
    frame++;
  }, 80);

  return {
    update(msg: string) {
      current = msg;
    },
    stop() {
      clearInterval(interval);
      process.stdout.write('\r\x1b[K');
    },
  };
}
