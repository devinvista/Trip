import mysql from 'mysql2/promise';

async function checkTableSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1661.hstgr.io',
      user: 'u715665838_partiutrip',
      password: '@PartiuTrip2024',
      database: 'u715665838_partiutrip',
    });

    console.log('🔍 Verificando estrutura da tabela activity_budget_proposals...');
    
    const [rows] = await connection.execute(`DESCRIBE activity_budget_proposals`);
    console.log('Colunas da tabela:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type}) ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? row.Key : ''}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error.message);
  }
}

checkTableSchema();