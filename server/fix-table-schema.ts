import { createConnection } from 'mysql2/promise';

async function fixTableSchema() {
  const connection = await createConnection({
    host: process.env.DB_HOST || 'srv1661.hstgr.io',
    user: process.env.DB_USER || 'u715665838_partiutrip',
    password: process.env.DB_PASSWORD || '@PartiuTrip2024',
    database: process.env.DB_NAME || 'u715665838_partiutrip',
  });

  try {
    console.log('🔍 Verificando estrutura da tabela activity_budget_proposals...');
    
    // Check if table exists and what columns it has
    const [tables] = await connection.execute(`
      SELECT * FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u715665838_partiutrip' 
      AND TABLE_NAME = 'activity_budget_proposals'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Tabela activity_budget_proposals não existe! Criando...');
      
      await connection.execute(`
        CREATE TABLE activity_budget_proposals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          activity_id INT NOT NULL,
          created_by INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
          inclusions JSON,
          exclusions JSON,
          valid_until TIMESTAMP NULL,
          is_active BOOLEAN DEFAULT TRUE NOT NULL,
          votes INT DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabela activity_budget_proposals criada!');
    } else {
      console.log('✅ Tabela activity_budget_proposals existe');
    }

    // Check columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'u715665838_partiutrip' 
      AND TABLE_NAME = 'activity_budget_proposals'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 Colunas da tabela:');
    columns.forEach((col: any) => {
      console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY || ''}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
  }
}

fixTableSchema().catch(console.error);