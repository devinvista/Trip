// MIDDLEWARE DE SEGURANÇA
// Proteções adicionais para o servidor Express

import { Request, Response, NextFunction } from "express";

/**
 * Middleware que monitora tentativas de acesso a dados sensíveis
 */
export function securityMonitorMiddleware(req: Request, res: Response, next: NextFunction) {
  // Lista de endpoints sensíveis que devem ser monitorados
  const sensitiveEndpoints = [
    '/api/admin',
    '/api/database',
    '/api/config',
    '/api/env'
  ];

  // Verificar se é uma tentativa de acesso a endpoint sensível
  const isSensitive = sensitiveEndpoints.some(endpoint => 
    req.path.toLowerCase().includes(endpoint.toLowerCase())
  );

  if (isSensitive) {
    console.warn(`🚨 SEGURANÇA: Tentativa de acesso a endpoint sensível: ${req.path} de IP: ${req.ip}`);
    
    // Bloquear acesso a endpoints administrativos não autorizados
    return res.status(403).json({ 
      error: "Acesso negado - endpoint protegido",
      timestamp: new Date().toISOString()
    });
  }

  // Headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
}

/**
 * Middleware que bloqueia tentativas de manipulação de variáveis de ambiente
 */
export function environmentProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Verificar se há tentativas de enviar dados relacionados a configuração de banco
  const suspiciousPatterns = [
    'DATABASE_URL',
    'DB_HOST',
    'DB_PASSWORD',
    'CONNECTION_STRING',
    'MYSQL_',
    'POSTGRES_',
    'SQLITE_'
  ];

  const requestBody = JSON.stringify(req.body || {}).toLowerCase();
  const queryString = JSON.stringify(req.query || {}).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (requestBody.includes(pattern.toLowerCase()) || queryString.includes(pattern.toLowerCase())) {
      console.error(`🚨 SEGURANÇA: Tentativa de manipular configuração de banco detectada: ${pattern}`);
      
      return res.status(400).json({
        error: "Requisição bloqueada - dados sensíveis detectados",
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
}

/**
 * Middleware que registra todas as requisições para auditoria
 */
export function auditLogMiddleware(req: Request, res: Response, next: NextFunction) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer')
  };

  // Log de auditoria (pode ser expandido para salvar em arquivo)
  if (req.path.startsWith('/api/')) {
    console.log(`📊 AUDITORIA: ${JSON.stringify(logData)}`);
  }

  next();
}