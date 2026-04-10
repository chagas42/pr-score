export function buildBar(value: number, max: number, width: number): string {
  if (max === 0) return '';
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled);
}

export function formatRank(index: number): string {
  return String(index + 1).padStart(2, ' ');
}
