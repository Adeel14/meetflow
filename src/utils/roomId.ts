/**
 * Room key and display utilities.
 * Ensures that all variations (spaces, hyphens, uppercase, lowercase, full URLs)
 * map to the exact same canonical room key so hosts and guests always connect.
 */

export function getRoomKey(id: string): string {
  if (!id) return '';
  let clean = String(id).trim();

  // If a full URL is passed, extract the room slug
  if (clean.includes('/room/')) {
    clean = clean.split('/room/')[1].split('?')[0].split('#')[0];
  } else if (clean.includes('room=')) {
    clean = clean.split('room=')[1].split('&')[0].split('#')[0];
  }

  // Strip all non-alphanumeric characters and uppercase
  return clean.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formatRoomDisplay(id: string): string {
  const clean = getRoomKey(id);
  if (clean.length === 9) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}`;
  }
  return clean;
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(3)}-${part(3)}-${part(3)}`;
}

// Backward compatibility alias
export const normalizeRoomId = formatRoomDisplay;
