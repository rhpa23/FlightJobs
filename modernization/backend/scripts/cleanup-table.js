const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

try {
  // Deletar tabela temporária incompleta
  console.log('Deletando tabela temporária incompleta...');
  db.exec('DROP TABLE IF EXISTS pilotlicenseexpensesuserdbmodels_new;');
  console.log('Tabela temporária deletada com sucesso!');
} catch (error) {
  console.error('Erro ao deletar tabela:', error);
} finally {
  db.close();
}
