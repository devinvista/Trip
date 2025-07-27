# PartiuTrip - Plataforma de Companheiros de Viagem

## Visão Geral

O PartiuTrip é uma plataforma web que conecta viajantes com interesses, destinos e datas similares para compartilhar experiências de viagem e dividir custos. Desenvolvida como uma aplicação full-stack moderna, permite que usuários criem planos de viagem, encontrem companheiros compatíveis e coordenem despesas compartilhadas.

## Principais Funcionalidades

- **Criação de Viagens**: Planeje viagens detalhadas com destino, datas, orçamento e estilo
- **Busca de Companheiros**: Encontre viajantes compatíveis com filtros avançados
- **Divisão de Custos**: Sistema completo de gestão e divisão de despesas
- **Chat em Tempo Real**: Comunicação entre participantes das viagens
- **Gerenciamento de Atividades**: Organize e priorize atividades da viagem
- **Sistema de Indicações**: Programa PartiuAmigos para convidar outros viajantes
- **Perfil Gamificado**: Níveis de viajante e sistema de conquistas

## Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/UI** para componentes
- **Framer Motion** para animações
- **React Hook Form** com validação Zod
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento

### Backend
- **Node.js** com Express
- **POSTGREE** com Drizzle ORM
- **Passport.js** para autenticação
- **Express Session** para gerenciamento de sessões
- **Bcrypt** para hash de senhas

## Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+

### Instalação das Dependências
```bash
npm install
```

### Configuração do Banco de Dados
Configure as variáveis de ambiente no arquivo `.env`:
```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=partiu_trip
```

### Executar a Aplicação
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Sincronizar schema do banco
npm run db:push
```

## Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   └── lib/           # Utilitários e configurações
├── server/                # Backend Node.js
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   ├── auth.ts           # Configuração de autenticação
│   └── db.ts             # Configuração do banco
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas do banco de dados
└── replit.md            # Documentação do projeto
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Executa servidor de produção
- `npm run check` - Verifica tipos TypeScript
- `npm run db:push` - Sincroniza schema do banco

## Funcionalidades Principais

### Sistema de Autenticação
- Login com username, email ou telefone
- Autenticação baseada em sessões
- Códigos de indicação obrigatórios no cadastro

### Gerenciamento de Viagens
- Criação detalhada com orçamento por categoria
- Sistema de participantes com aprovação
- Chat em tempo real entre participantes
- Divisão automática de custos

### Perfil do Usuário
- Informações pessoais e preferências
- Sistema de níveis (Iniciante, Aventureiro, Explorador, Embaixador)
- Histórico de viagens e conquistas
- Programa de indicações PartiuAmigos

### Busca e Descoberta
- Filtros por destino, data, orçamento e estilo
- Sugestões personalizadas baseadas no perfil
- Galeria de destinos populares

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Suporte

Para suporte ou dúvidas, entre em contato através do sistema de feedback da plataforma.