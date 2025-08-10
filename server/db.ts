import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";
import dotenv from "dotenv";
import { initializeDatabaseSecurity, validateDatabaseUrl as validateDbUrl } from "./db-security";

// Carregar variáveis de ambiente
dotenv.config();

// INICIALIZAR PROTEÇÕES DE SEGURANÇA
initializeDatabaseSecurity();

console.log(`🔗 Conectando ao PostgreSQL...`);

// PROTEÇÃO DE SEGURANÇA: Validação rigorosa da DATABASE_URL
function validateDatabaseUrl(url: string): string {
  if (!url) {
    throw new Error("🚨 SEGURANÇA: DATABASE_URL é obrigatória e não pode estar vazia");
  }

  // Lista de domínios autorizados para conexão
  const allowedDomains = [
    'neon.tech',           // Neon PostgreSQL (configurado no .env)
    'ep-dark-frog-acs6c8yp.sa-east-1.aws.neon.tech'  // Domínio específico do projeto
  ];

  // Bloquear tentativas de conexão com bancos nativos do Replit
  const blockedPatterns = [
    'replit.dev',
    'repl.co',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'sqlite',
    'file:',
    'memory:'
  ];

  // Verificar se contém padrões bloqueados
  for (const pattern of blockedPatterns) {
    if (url.toLowerCase().includes(pattern.toLowerCase())) {
      throw new Error(`🚨 SEGURANÇA: Conexão bloqueada - tentativa de usar banco não autorizado: ${pattern}`);
    }
  }

  // Verificar se está usando um domínio autorizado
  const urlObj = new URL(url);
  const isAuthorized = allowedDomains.some(domain => 
    urlObj.hostname.includes(domain)
  );

  if (!isAuthorized) {
    throw new Error(`🚨 SEGURANÇA: Domínio não autorizado: ${urlObj.hostname}. Apenas domínios Neon são permitidos.`);
  }

  // Verificar se é PostgreSQL
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error("🚨 SEGURANÇA: Apenas conexões PostgreSQL são permitidas");
  }

  console.log(`✅ SEGURANÇA: URL do banco validada - conectando ao Neon PostgreSQL`);
  return url;
}

// Configuração do banco PostgreSQL com validações de segurança
if (!process.env.DATABASE_URL) {
  throw new Error("🚨 SEGURANÇA: DATABASE_URL é obrigatória no arquivo .env");
}

// Validar e proteger a URL do banco
const secureDbUrl = validateDatabaseUrl(process.env.DATABASE_URL);
const connection = postgres(secureDbUrl, { 
  ssl: 'require',
  // Configurações adicionais de segurança
  connect_timeout: 10,
  max: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30 // 30 minutos
});

// Configurar Drizzle com PostgreSQL
export const db = drizzle(connection, { schema });

// Testar conexão com validações de segurança
export async function testConnection() {
  try {
    console.log("🔗 Testando conexão PostgreSQL...");
    
    // Testar conexão básica
    await db.execute(sql`SELECT 1`);
    
    // Verificar se estamos conectados ao banco correto
    const result = await db.execute(sql`SELECT current_database(), current_user, inet_server_addr()`);
    const dbInfo = result[0] as any;
    
    console.log("✅ Conexão PostgreSQL estabelecida com sucesso!");
    console.log(`📊 Banco: ${dbInfo.current_database}, Usuário: ${dbInfo.current_user}`);
    
    // Verificação adicional de segurança - confirmar que não é banco local
    const serverAddr = dbInfo.inet_server_addr;
    if (serverAddr && typeof serverAddr === 'string' && (
      serverAddr.includes('127.0.0.1') || 
      serverAddr.includes('localhost')
    )) {
      throw new Error("🚨 SEGURANÇA: Detectada conexão com banco local - bloqueando");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error);
    return false;
  }
}

// Reset completo do banco
export async function resetDatabase() {
  const { resetDatabase: resetDB } = await import("./reset-database");
  return await resetDB();
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    console.log("🏗️ Inicializando tabelas do schema PostgreSQL...");
    
    // With Drizzle and PostgreSQL Neon, schema is managed by migrations
    // Check if we need to create initial test data
    try {
      const userCount = await db.select().from(users).limit(1);
      if (userCount.length === 0) {
        console.log("🌱 Criando dados básicos de teste...");
        const { createSimpleSeedData } = await import("./simple-postgres-seed");
        await createSimpleSeedData();
      }
    } catch (error) {
      console.log("🌱 Tabelas não existem ainda, criando dados básicos...");
      const { createSimpleSeedData } = await import("./simple-postgres-seed");
      await createSimpleSeedData();
    }
    
    console.log("✅ Inicialização das tabelas concluída!");
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
    throw error;
  }
}
