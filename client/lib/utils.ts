export { cn } from './utils/cn';
export { formatRelativeDate, formatDate, formatDateTime } from './utils/date';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1] ?? '0', 16),
        g: parseInt(result[2] ?? '0', 16),
        b: parseInt(result[3] ?? '0', 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'dark';
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? 'dark' : 'light';
}
