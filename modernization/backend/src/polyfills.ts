import { randomUUID } from 'crypto';

// Polyfill for crypto.randomUUID() - required for Node.js < 20
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = { randomUUID };
}
