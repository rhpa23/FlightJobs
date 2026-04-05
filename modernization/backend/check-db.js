const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath, { readonly: true });

// List all tables
console.log('=== Todas as tabelas ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => console.log('-', t.name));

// Show schema for each table
console.log('\n=== Schema de cada tabela ===');
tables.forEach(t => {
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(t.name);
  console.log(`\n--- ${t.name} ---`);
  console.log(schema.sql);
});

db.close();
