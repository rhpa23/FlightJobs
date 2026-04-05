import { pbkdf2Sync, timingSafeEqual, randomBytes } from 'crypto';

/**
 * Verifica uma senha no formato ASP.NET Identity legado.
 * 
 * Formato do hash (49 bytes):
 * - 1 byte: marker (0x00)
 * - 16 bytes: salt
 * - 32 bytes: hash (PBKDF2 com HMAC-SHA1, 1000 iterações)
 */
export function verifyAspNetPassword(password: string, storedHash: string): boolean {
  try {
    const hashBuffer = Buffer.from(storedHash, 'base64');
    
    // Verifica se é o formato esperado (49 bytes, marker 0x00)
    if (hashBuffer.length !== 49 || hashBuffer[0] !== 0x00) {
      return false;
    }
    
    const salt = hashBuffer.subarray(1, 17);
    const storedKey = hashBuffer.subarray(17, 49);
    
    const key = pbkdf2Sync(password, salt, 1000, 32, 'sha1');
    
    return timingSafeEqual(key, storedKey);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Gera um hash de senha no formato ASP.NET Identity legado.
 * 
 * Formato do hash (49 bytes):
 * - 1 byte: marker (0x00)
 * - 16 bytes: salt
 * - 32 bytes: hash (PBKDF2 com HMAC-SHA1, 1000 iterações)
 */
export function hashAspNetPassword(password: string): string {
  const salt = randomBytes(16);
  const key = pbkdf2Sync(password, salt, 1000, 32, 'sha1');
  
  // Concatena marker + salt + hash
  const hashBuffer = Buffer.concat([
    Buffer.from([0x00]), // marker
    salt,
    key
  ]);
  
  return hashBuffer.toString('base64');
}
