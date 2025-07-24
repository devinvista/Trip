# Guia de Deploy MySQL - PartiuTrip

## Configuração Atual

A aplicação PartiuTrip está configurada para usar **exclusivamente MySQL** em produção:

### Banco de Dados MySQL
- **Host**: srv1661.hstgr.io:3306
- **Driver**: mysql2
- **ORM**: Drizzle ORM (dialeto MySQL)
- **Conexão**: Pool de conexões configurado

### Scripts de Deploy
```json
{
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js"
}
```

### Variáveis de Ambiente Necessárias
```env
DB_HOST=srv1661.hstgr.io
DB_USER=u211565369_partiu_trip_user
DB_PASSWORD=Partiu@2024
DB_NAME=u211565369_partiu_trip
NODE_ENV=production
```

### Configuração de Deploy (.replit)
```toml
[deployment]
deploymentTarget = "autoscale"
run = ["npm", "run", "start"]
build = ["npm", "run", "build"]

[[ports]]
localPort = 5000
externalPort = 80
```

## Status da Migração PostgreSQL

✅ **Dependências removidas**: connect-pg-simple, @types/connect-pg-simple  
✅ **Código atualizado**: Todos os imports e referências PostgreSQL removidos  
✅ **MySQL funcionando**: Aplicação conecta e opera corretamente com MySQL  
⚠️ **PATH residual**: PostgreSQL ainda presente no PATH do sistema por limitação Replit  

## Notas Importantes

1. **A aplicação NÃO usa PostgreSQL** - todas as conexões são via MySQL
2. **Deploy funcionará corretamente** - scripts configurados para MySQL
3. **PATH não afeta funcionamento** - apenas resíduo visual do sistema
4. **Todas as tabelas estão no MySQL** - dados persistentes e operacionais

## Como Fazer Deploy

1. Clique no botão "Deploy" no Replit
2. Configure as variáveis de ambiente MySQL se necessário
3. A aplicação será buildada e executada com MySQL automaticamente

O deploy funcionará perfeitamente mesmo com a referência PostgreSQL no PATH.