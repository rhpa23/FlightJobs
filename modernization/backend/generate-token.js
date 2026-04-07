const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

// Configurações do .env
const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Conectar ao banco de dados SQLite
const dbPath = path.join(__dirname, '../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

// Buscar o usuário de teste (colunas usam PascalCase no SQLite)
const user = db.prepare("SELECT Id as id, Email as email FROM aspnetusers WHERE Email = 'rhpa23@gmail.com'").get();

if (!user) {
  console.error('Usuário rhpa23@gmail.com não encontrado no banco de dados!');
  console.log('Execute primeiro: node create-test-user.js');
  db.close();
  process.exit(1);
}

// Payload do token (mesmo formato usado no auth.service.ts)
const payload = {
  email: user.email,
  sub: user.id
};

// Gerar token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

console.log('=== TOKEN JWT VÁLIDO ===');
console.log(token);
console.log('\n=== PAYLOAD DECODIFICADO ===');
console.log(JSON.stringify(jwt.decode(token), null, 2));
console.log('\n=== USUÁRIO ===');
console.log(`ID: ${user.id}`);
console.log(`Email: ${user.email}`);
console.log('\n=== EXPIRA EM ===');
console.log(JWT_EXPIRES_IN);

db.close();
