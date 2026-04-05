const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

// Check if user already exists
const existingUser = db.prepare("SELECT * FROM aspnetusers WHERE email = 'rhpa23@gmail.com'").get();

if (existingUser) {
  console.log('Usuário já existe:', existingUser.email);
} else {
  // Create test user
  const saltRounds = 10;
  const password = 'Test@123';
  const passwordHash = bcrypt.hashSync(password, saltRounds);
  
  const stmt = db.prepare(`
    INSERT INTO aspnetusers (email, password_hash, user_name, first_name, last_name, email_confirmed, lockout_enabled)
    VALUES (?, ?, ?, ?, ?, 1, 1)
  `);
  
  const result = stmt.run('rhpa23@gmail.com', passwordHash, 'rhpa23', 'Test', 'User');
  console.log('Usuário criado com ID:', result.lastInsertRowid);
  console.log('Email: rhpa23@gmail.com');
  console.log('Senha: Test@123');
}

// List all users
console.log('\n=== Usuários cadastrados ===');
const users = db.prepare('SELECT id, email, user_name, first_name, last_name FROM aspnetusers').all();
users.forEach(u => console.log(u));

db.close();
