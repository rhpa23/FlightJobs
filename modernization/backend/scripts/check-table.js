const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

try {
  const tableInfo = db.prepare("PRAGMA table_info(pilotlicenseexpensesuserdbmodels)").all();
  console.log('Estrutura da tabela pilotlicenseexpensesuserdbmodels:');
  tableInfo.forEach(col => {
    console.log(`  - ${col.name}: ${col.type} (notnull: ${col.notnull}, dflt_value: ${col.dflt_value})`);
  });
} catch (error) {
  console.error('Erro ao verificar tabela:', error);
} finally {
  db.close();
}
