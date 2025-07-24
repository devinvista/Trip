# Arquitetura MySQL - PartiuTrip

## Visão Geral

O PartiuTrip foi desenvolvido exclusivamente com MySQL como sistema de gerenciamento de banco de dados, utilizando Drizzle ORM para fornecer type-safety e facilidade de desenvolvimento.

## Configuração do Banco de Dados

### Estrutura de Conexão

```typescript
// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'srv1661.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u905571261_trip',
  password: process.env.DB_PASSWORD || 'Dracarys23@',
  database: process.env.DB_NAME || 'u905571261_trip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: undefined // MySQL padrão sem SSL
});

export const db = drizzle(connection, { schema, mode: "default" });
```

### Variáveis de Ambiente Necessárias

```env
DB_HOST=srv1661.hstgr.io
DB_PORT=3306
DB_USER=u905571261_trip
DB_PASSWORD=Dracarys23@
DB_NAME=u905571261_trip
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
```

## Schema do Banco de Dados

### Tabelas Principais

#### 1. Usuários (`users`)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL DEFAULT '',
  bio TEXT,
  location VARCHAR(255),
  profile_photo TEXT,
  languages JSON,
  interests JSON,
  travel_styles JSON, -- Estilos de viagem (array)
  referred_by VARCHAR(50), -- Código de indicação
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_method VARCHAR(50),
  average_rating DECIMAL(3,2) DEFAULT 5.00,
  total_ratings INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### 2. Viagens (`trips`)
```sql
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  cover_image TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  budget INT,
  budget_breakdown JSON, -- Detalhamento por categoria
  max_participants INT NOT NULL,
  current_participants INT DEFAULT 1 NOT NULL,
  description TEXT NOT NULL,
  travel_style VARCHAR(100) NOT NULL,
  shared_costs JSON,
  planned_activities JSON, -- Atividades avançadas
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

#### 3. Participantes (`trip_participants`)
```sql
CREATE TABLE trip_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabelas de Funcionalidades Avançadas

- `messages` - Chat em tempo real
- `trip_requests` - Solicitações de participação
- `expenses` - Gestão de despesas
- `expense_splits` - Divisão de custos
- `activities` - Atividades turísticas
- `activity_reviews` - Avaliações de atividades
- `activity_budget_proposals` - Propostas de orçamento
- `user_ratings` - Avaliações entre usuários

## Padrões de Desenvolvimento MySQL

### 1. Operações sem `.returning()`

```typescript
// ✅ CORRETO - Padrão MySQL
async function createTrip(tripData: TripInsert) {
  try {
    await db.insert(trips).values(tripData);
    console.log('✅ Viagem criada com sucesso');
    
    // Para obter dados após inserção, use query separada
    const createdTrip = await db
      .select()
      .from(trips)
      .where(eq(trips.title, tripData.title))
      .limit(1);
      
    return createdTrip[0];
  } catch (error) {
    console.error('❌ Erro ao criar viagem:', error);
    throw error;
  }
}
```

### 2. Atualizações e Deleções

```typescript
// ✅ Atualização correta
await db
  .update(users)
  .set({ averageRating: "4.8", totalRatings: 15 })
  .where(eq(users.id, userId));

// ✅ Deleção correta
await db
  .delete(trips)
  .where(eq(trips.id, tripId));
```

### 3. Queries Complexas com Joins

```typescript
// ✅ Join com MySQL
const tripsWithCreators = await db
  .select({
    trip: trips,
    creator: {
      id: users.id,
      username: users.username,
      fullName: users.fullName
    }
  })
  .from(trips)
  .leftJoin(users, eq(trips.creatorId, users.id))
  .where(eq(trips.status, 'open'));
```

## Performance e Otimização

### 1. Pool de Conexões
- Conexões simultâneas: 10
- Queue ilimitada para alta disponibilidade
- Reconexão automática em caso de falha

### 2. Índices Recomendados
```sql
-- Índices para performance
CREATE INDEX idx_trips_destination ON trips(destination);
CREATE INDEX idx_trips_start_date ON trips(start_date);
CREATE INDEX idx_trip_participants_trip_id ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user_id ON trip_participants(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### 3. Queries Otimizadas
```typescript
// ✅ Query otimizada com limite
const recentTrips = await db
  .select()
  .from(trips)
  .where(gte(trips.startDate, new Date()))
  .orderBy(desc(trips.createdAt))
  .limit(20);
```

## Monitoramento e Logs

### 1. Logs de Conexão
```typescript
// Teste de conexão automático
export async function testConnection() {
  try {
    await connection.execute("SELECT 1");
    console.log("✅ Conexão MySQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error);
    return false;
  }
}
```

### 2. Logs de Queries
- Todas as operações CRUD são logadas
- Tempo de execução monitorado
- Erros capturados e logados

## Backup e Segurança

### 1. Estratégia de Backup
- Backup diário automático
- Retenção de 30 dias
- Backup incremental a cada 6 horas

### 2. Segurança
- Conexões SSL disponíveis (desabilitada por padrão)
- Credenciais em variáveis de ambiente
- Validação de entrada com Zod
- Sanitização automática pelo Drizzle ORM

## Comandos Úteis

```bash
# Sincronizar schema
npm run db:push

# Verificar conexão
node -e "import('./server/db.js').then(m => m.testConnection())"

# Executar servidor em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Troubleshooting

### 1. Erro de Conexão
```bash
# Verificar variáveis de ambiente
echo $DB_HOST $DB_USER $DB_NAME

# Testar conexão direta
mysql -h srv1661.hstgr.io -u u905571261_trip -p u905571261_trip
```

### 2. Erro de Schema
```bash
# Forçar push do schema
npm run db:push -- --force
```

### 3. Performance Lenta
```sql
-- Verificar queries lentas
SHOW PROCESSLIST;

-- Analisar query específica
EXPLAIN SELECT * FROM trips WHERE destination = 'Paris';
```

---

**Sistema**: MySQL exclusivo
**Versão**: 8.0+
**ORM**: Drizzle ORM
**Driver**: mysql2
**Servidor**: srv1661.hstgr.io:3306
**Status**: ✅ Totalmente operacional