// MÓDULO DE SEGURANÇA DO BANCO DE DADOS
// Este módulo implementa proteções robustas para garantir
// que apenas o banco configurado no .env seja usado

import dotenv from "dotenv";

dotenv.config();

// Configurações de segurança
const SECURITY_CONFIG = {
  // Domínios autorizados para conexão
  allowedDomains: [
    'neon.tech',
    'ep-dark-frog-acs6c8yp.sa-east-1.aws.neon.tech'
  ],
  
  // Padrões bloqueados (bancos locais, Replit nativo, etc.)
  blockedPatterns: [
    'replit.dev',
    'repl.co', 
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'sqlite',
    'file:',
    'memory:',
    '.db',
    'local.'
  ],
  
  // Protocolos permitidos
  allowedProtocols: ['postgresql:', 'postgres:']
};

/**
 * Verifica se a aplicação está tentando usar o banco correto
 */
export function validateEnvironment(): void {
  // Verificar se DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    throw new Error("🚨 SEGURANÇA: DATABASE_URL não encontrada no arquivo .env");
  }

  // Verificar se SESSION_SECRET existe (indicador de configuração correta)
  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️ AVISO: SESSION_SECRET não configurada");
  }

  console.log("✅ SEGURANÇA: Variáveis de ambiente validadas");
}

/**
 * Valida URL do banco antes de qualquer conexão
 */
export function validateDatabaseUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error("🚨 SEGURANÇA: URL do banco inválida ou vazia");
  }

  try {
    const urlObj = new URL(url);
    
    // Verificar protocolo
    if (!SECURITY_CONFIG.allowedProtocols.includes(urlObj.protocol)) {
      throw new Error(`🚨 SEGURANÇA: Protocolo não autorizado: ${urlObj.protocol}`);
    }

    // Verificar padrões bloqueados
    for (const pattern of SECURITY_CONFIG.blockedPatterns) {
      if (url.toLowerCase().includes(pattern.toLowerCase())) {
        throw new Error(`🚨 SEGURANÇA: Padrão bloqueado detectado: ${pattern}`);
      }
    }

    // Verificar domínios autorizados
    const isAuthorized = SECURITY_CONFIG.allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );

    if (!isAuthorized) {
      throw new Error(`🚨 SEGURANÇA: Domínio não autorizado: ${urlObj.hostname}`);
    }

    console.log(`✅ SEGURANÇA: URL validada para ${urlObj.hostname}`);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('SEGURANÇA')) {
      throw error; // Re-throw security errors
    }
    throw new Error(`🚨 SEGURANÇA: URL malformada: ${error}`);
  }
}

/**
 * Monitor de segurança que verifica periodicamente
 */
export function startSecurityMonitor(): void {
  const monitor = () => {
    try {
      validateEnvironment();
      if (process.env.DATABASE_URL) {
        validateDatabaseUrl(process.env.DATABASE_URL);
      }
    } catch (error) {
      console.error("🚨 MONITOR DE SEGURANÇA:", error);
      process.exit(1); // Encerrar aplicação se detectar problema de segurança
    }
  };

  // Verificar a cada 5 minutos
  setInterval(monitor, 5 * 60 * 1000);
  
  // Verificação inicial
  monitor();
  
  console.log("🛡️ Monitor de segurança do banco iniciado");
}

/**
 * Bloquear tentativas de alteração das variáveis de ambiente em runtime
 */
export function protectEnvironmentVariables(): void {
  const originalDbUrl = process.env.DATABASE_URL;
  
  // Criar uma validação que monitora mudanças
  const checkInterval = setInterval(() => {
    if (process.env.DATABASE_URL !== originalDbUrl) {
      console.error("🚨 SEGURANÇA: DATABASE_URL foi alterada durante execução - reiniciando aplicação");
      process.exit(1);
    }
  }, 30000); // Verificar a cada 30 segundos

  // Limpar interval quando o processo terminar
  process.on('exit', () => clearInterval(checkInterval));
  process.on('SIGINT', () => clearInterval(checkInterval));
  process.on('SIGTERM', () => clearInterval(checkInterval));

  console.log("🔒 SEGURANÇA: Monitor de proteção de variáveis de ambiente ativado");
}

/**
 * Inicializar todas as proteções de segurança
 */
export function initializeDatabaseSecurity(): void {
  console.log("🛡️ Inicializando proteções de segurança do banco...");
  
  validateEnvironment();
  
  if (process.env.DATABASE_URL) {
    validateDatabaseUrl(process.env.DATABASE_URL);
  }
  
  protectEnvironmentVariables();
  startSecurityMonitor();
  
  console.log("✅ SEGURANÇA: Todas as proteções do banco foram ativadas");
}