# Migração PostgreSQL para MySQL - PartiuTrip

## Visão Geral

Este documento descreve a migração completa da aplicação PartiuTrip de PostgreSQL para MySQL, incluindo todas as alterações necessárias no código, dependências e configurações.

## Alterações Realizadas

### 1. Dependências
- **Removido**: `@neondatabase/serverless` (driver PostgreSQL)
- **Adicionado**: `mysql2` (driver MySQL)
- **Mantido**: `drizzle-orm` (ORM compatível com MySQL)

### 2. Configuração do Banco de Dados

#### Arquivo: `server/db.ts`
- Mudança de `drizzle-orm/postgres-js` para `drizzle-orm/mysql2`
- Configuração de conexão MySQL com pool de conexões
- Servidor MySQL: `srv1661.hstgr.io:3306`

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  host: 'srv1661.hstgr.io',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false
});
```

### 3. Schema de Banco de Dados

#### Arquivo: `shared/schema.ts`
Migração completa de todos os schemas:

**Tipos de Dados Convertidos:**
- `serial` → `int({ mode: 'number' }).primaryKey().autoincrement()`
- `text` → `varchar(255)` ou `varchar(1000)`
- `jsonb` → `json`
- `numeric(10,2)` → `decimal({ precision: 10, scale: 2 })`
- `timestamp` → `timestamp({ mode: 'date' })`
- `boolean` → `boolean`

**Funções de Schema:**
- `pgTable` → `mysqlTable`
- `pgEnum` → `mysqlEnum`

### 4. Variáveis de Ambiente

#### Antes (PostgreSQL):
```env
DATABASE_URL=postgresql://...
```

#### Depois (MySQL):
```env
DB_USER=username
DB_PASSWORD=password
DB_NAME=database_name
```

### 5. Configuração da Aplicação

#### Arquivo: `server/index.ts`
- Logs atualizados para referenciar MySQL
- Comentários atualizados para refletir uso do MySQL

### 6. Documentação

#### Arquivo: `replit.md`
- Atualizada seção "Arquitetura Backend"
- Atualizada seção "Esquema do Banco de Dados"
- Atualizada seção "Dependências Externas"
- Atualizada seção "Configuração de Ambiente"

## Comandos de Migração

### Instalação de Dependências
```bash
npm uninstall @neondatabase/serverless
npm install mysql2
```

### Push do Schema
```bash
npm run db:push
```

### Teste da Conexão
```bash
npm run dev
```

## Verificação da Migração

### Logs de Sucesso
```
🔗 Conectando ao MySQL...
🔗 Testando conexão MySQL...
✅ Conexão MySQL estabelecida com sucesso!
🏗️ Inicializando tabelas MySQL...
✅ Tabelas MySQL inicializadas com sucesso!
```

### Funcionalidades Testadas
- ✅ Conexão com banco de dados MySQL
- ✅ Criação automática de tabelas
- ✅ Inserção de dados de teste
- ✅ Autenticação de usuários
- ✅ Operações CRUD completas
- ✅ Relacionamentos entre tabelas

## Estrutura do Banco MySQL

### Tabelas Principais
- `users` - Usuários do sistema
- `trips` - Viagens criadas
- `tripParticipants` - Participantes das viagens
- `messages` - Mensagens do chat
- `tripRequests` - Solicitações de participação
- `expenses` - Despesas compartilhadas
- `expenseSplits` - Divisão de despesas
- `userRatings` - Avaliações de usuários
- `destinationRatings` - Avaliações de destinos
- `verificationRequests` - Solicitações de verificação
- `activities` - Atividades disponíveis
- `activityReviews` - Avaliações de atividades
- `activityBookings` - Reservas de atividades
- `activityBudgetProposals` - Propostas de orçamento
- `tripActivities` - Atividades vinculadas a viagens

## Notas Importantes

1. **Compatibilidade**: Drizzle ORM mantém compatibilidade total entre PostgreSQL e MySQL
2. **Performance**: Pool de conexões MySQL otimizado para produção
3. **Segurança**: Credenciais armazenadas em variáveis de ambiente
4. **Monitoramento**: Logs detalhados para debug e monitoramento

## Próximos Passos

1. Monitorar performance do MySQL em produção
2. Configurar backup automático do banco
3. Otimizar consultas conforme necessário
4. Implementar índices para melhor performance

---

**Data da Migração**: 13 de julho de 2025
**Status**: ✅ Concluída com sucesso
**Servidor MySQL**: srv1661.hstgr.io:3306