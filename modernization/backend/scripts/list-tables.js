const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas no banco de dados:');
  tables.forEach(t => console.log(`  - ${t.name}`));
} catch (error) {
  console.error('Erro ao listar tabelas:', error);
} finally {
  db.close();
}
