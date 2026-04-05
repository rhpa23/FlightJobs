const { pbkdf2Sync, timingSafeEqual } = require('crypto');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath, { readonly: true });
const user = db.prepare("SELECT Id, Email, PasswordHash FROM aspnetusers WHERE Email = 'rhpa23@gmail.com'").get();

if (!user) {
  console.log('Usuário não encontrado');
  process.exit(1);
}

const password = '1q2w3e!Q@W#E';
console.log('Email:', user.Email);
console.log('Password:', password);
console.log('PasswordHash:', user.PasswordHash);

const hashBuffer = Buffer.from(user.PasswordHash, 'base64');
console.log('Hash buffer length:', hashBuffer.length);

// Formato: 1 byte marker + 16 bytes salt + 32 bytes hash
const marker = hashBuffer[0];
const salt = hashBuffer.subarray(1, 17);
const storedKey = hashBuffer.subarray(17, 49);

console.log('\nFormato (marker + salt + hash):');
console.log('  Marker:', marker);
console.log('  Salt (16 bytes):', salt.toString('hex'));
console.log('  Stored key (32 bytes):', storedKey.toString('hex'));

// Test with the known password
try {
  const key = pbkdf2Sync(password, salt, 1000, 32, 'sha1');
  const match = timingSafeEqual(key, storedKey);
  console.log(`\n  Testando "${password}" com SHA1/1000: ${match ? '✅ MATCH!' : '❌'}`);
  
  if (!match) {
    // Try with SHA256
    const key256 = pbkdf2Sync(password, salt, 1000, 32, 'sha256');
    const match256 = timingSafeEqual(key256, storedKey);
    console.log(`  Testando "${password}" com SHA256/1000: ${match256 ? '✅ MATCH!' : '❌'}`);
    
    // Try with 10000 iterations
    const key10k = pbkdf2Sync(password, salt, 10000, 32, 'sha1');
    const match10k = timingSafeEqual(key10k, storedKey);
    console.log(`  Testando "${password}" com SHA1/10000: ${match10k ? '✅ MATCH!' : '❌'}`);
    
    const key10k256 = pbkdf2Sync(password, salt, 10000, 32, 'sha256');
    const match10k256 = timingSafeEqual(key10k256, storedKey);
    console.log(`  Testando "${password}" com SHA256/10000: ${match10k256 ? '✅ MATCH!' : '❌'}`);
  }
} catch (error) {
  console.log('Erro:', error.message);
}

db.close();
