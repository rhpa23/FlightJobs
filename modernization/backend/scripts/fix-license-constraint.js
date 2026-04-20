const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db');
const db = new Database(dbPath);

try {
  // Desabilitar foreign keys temporariamente
  console.log('Desabilitando foreign keys...');
  db.pragma('foreign_keys = OFF');

  // SQLite não suporta ALTER COLUMN diretamente, então precisamos criar uma nova tabela
  console.log('Criando tabela temporária...');
  db.exec(`
    CREATE TABLE pilotlicenseexpensesuserdbmodels_new (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      MaturityDate DATETIME NOT NULL,
      OverdueProcessed BOOLEAN NOT NULL DEFAULT 0,
      PilotLicenseExpense_Id INTEGER,
      User_Id TEXT,
      FOREIGN KEY (PilotLicenseExpense_Id) REFERENCES pilotlicenseexpensesdbmodels(Id),
      FOREIGN KEY (User_Id) REFERENCES aspnetusers(Id)
    );
  `);

  // Copiar dados da tabela antiga para a nova
  console.log('Copiando dados...');
  db.exec(`
    INSERT INTO pilotlicenseexpensesuserdbmodels_new (Id, MaturityDate, OverdueProcessed, PilotLicenseExpense_Id, User_Id)
    SELECT Id, MaturityDate, OverdueProcessed, PilotLicenseExpense_Id, User_Id FROM pilotlicenseexpensesuserdbmodels;
  `);

  // Adicionar coluna OverdueProcessed_old com valor padrão
  console.log('Adicionando coluna OverdueProcessed_old...');
  db.exec(`
    ALTER TABLE pilotlicenseexpensesuserdbmodels_new ADD COLUMN OverdueProcessed_old BOOLEAN DEFAULT 0;
  `);

  // Atualizar o valor da nova coluna baseado na coluna antiga
  db.exec(`
    UPDATE pilotlicenseexpensesuserdbmodels_new SET OverdueProcessed_old = OverdueProcessed;
  `);

  // Deletar tabela antiga
  console.log('Deletando tabela antiga...');
  db.exec(`DROP TABLE pilotlicenseexpensesuserdbmodels;`);

  // Renomear tabela nova
  console.log('Renomeando tabela nova...');
  db.exec(`ALTER TABLE pilotlicenseexpensesuserdbmodels_new RENAME TO pilotlicenseexpensesuserdbmodels;`);

  // Reabilitar foreign keys
  console.log('Reabilitando foreign keys...');
  db.pragma('foreign_keys = ON');

  // Recriar índices
  console.log('Recriando índices...');
  db.exec(`
    CREATE INDEX IX_PilotLicenseExpense_Id ON pilotlicenseexpensesuserdbmodels(PilotLicenseExpense_Id);
    CREATE INDEX IX_User_Id ON pilotlicenseexpensesuserdbmodels(User_Id);
  `);

  console.log('Constraint fixada com sucesso!');
} catch (error) {
  console.error('Erro ao fixar constraint:', error);
  process.exit(1);
} finally {
  db.close();
}
