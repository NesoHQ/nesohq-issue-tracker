import { formatDistanceToNow } from 'date-fns';

/**
 * Date formatting utilities
 */

export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown date';
  }
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}
