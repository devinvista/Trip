# PartiuTrip - Plataforma de Companheiros de Viagem

## Visão Geral

PartiuTrip é uma plataforma web que conecta viajantes com interesses, destinos e datas comuns para compartilhar experiências de viagem e custos. Desenvolvida como uma aplicação full-stack usando tecnologias web modernas, permite que usuários criem planos de viagem, encontrem companheiros de viagem compatíveis e coordenem despesas compartilhadas como acomodação, transporte e atividades.

## Arquitetura do Sistema

### Arquitetura Frontend
- **Framework**: React 18 com TypeScript
- **Roteamento**: Wouter (roteador React leve)
- **Gerenciamento de Estado**: TanStack React Query para estado do servidor
- **Componentes UI**: Primitivos Radix UI com sistema de estilo shadcn/ui
- **Estilização**: Tailwind CSS com variáveis CSS para temas
- **Manipulação de Formulários**: React Hook Form com validação Zod
- **Ferramenta de Build**: Vite com configuração personalizada

### Arquitetura Backend
- **Runtime**: Node.js com Express.js
- **Autenticação**: Passport.js com estratégia local e autenticação baseada em sessão
- **Armazenamento de Sessão**: Sessões Express com armazenamento MySQL
- **Segurança de Senha**: Módulo crypto do Node.js com hash scrypt
- **Design de API**: Endpoints RESTful com respostas JSON
- **Banco de Dados**: MySQL com Drizzle ORM (migração completa da memória para persistência)
- **Armazenamento**: Sistema totalmente migrado para MySQL com dados persistentes

### Esquema do Banco de Dados
A aplicação usa MySQL com as seguintes entidades principais:
- **Usuários**: Autenticação, informações de perfil e preferências de viagem
- **Viagens**: Planos de viagem com destinos, datas, orçamentos e custos compartilhados
- **Participantes da Viagem**: Relacionamento muitos-para-muitos entre usuários e viagens
- **Mensagens**: Funcionalidade de chat em tempo real para grupos de viagem
- **Solicitações de Viagem**: Sistema de solicitações para participar de viagens

## Componentes Principais

### Sistema de Autenticação
- Autenticação local com usuário/senha
- Autenticação baseada em sessão usando express-session
- Hash de senhas usando Node.js scrypt com salt
- Rotas protegidas no frontend e backend
- Gerenciamento de perfil de usuário com preferências de viagem

### Sistema de Avaliações
- Avaliações por estrelas (1-5) para atividades turísticas
- Interface completa com formulário de avaliação
- Sistema de fotos, data da visita e comentários
- Votação em avaliações como "útil" 
- Badges de verificação para avaliações confiáveis
- Integração com página de detalhes das atividades

### Gerenciamento de Viagens
- Criação de viagens com planejamento detalhado (destino, datas, orçamento, estilo)
- Descoberta de viagens com capacidades de filtro avançado
- Gerenciamento de participantes com sistema de solicitação/aprovação
- Mensagens em tempo real dentro de grupos de viagem
- Rastreamento de custos compartilhados para várias categorias de despesas
- Sistema de divisão de despesas similar ao Splitwise
  - Adicionar despesas com descrição, valor e categoria
  - Dividir custos entre participantes selecionados
  - Cálculo automático de saldo
  - Sugestões de liquidação
  - Suporte para upload de recibos

### Interface do Usuário
- Design responsivo com abordagem mobile-first
- Arquitetura baseada em componentes usando primitivos Radix UI
- Suporte a tema escuro/claro através de variáveis CSS
- Validação de formulários com feedback em tempo real
- Estados de carregamento e tratamento de erros em toda a aplicação

### Recursos em Tempo Real
- Sistema de chat com polling de mensagens (intervalos de 3 segundos)
- Atualizações ao vivo de participantes da viagem
- Notificações de solicitações e atualizações de status

## Fluxo de Dados

1. **Cadastro/Login de Usuário**: Usuários se autenticam através da estratégia local, sessões são armazenadas no MySQL
2. **Criação de Viagem**: Usuários autenticados criam viagens com informações de planejamento detalhado
3. **Descoberta de Viagem**: Usuários pesquisam e filtram viagens baseadas em preferências e compatibilidade
4. **Solicitações de Participação**: Usuários solicitam participar de viagens, criadores aprovam/rejeitam solicitações
5. **Comunicação**: Participantes aprovados podem conversar dentro de grupos de viagem
6. **Compartilhamento de Custos**: Criadores de viagem definem despesas compartilhadas, participantes coordenam pagamentos

## Dependências Externas

### Dependências Principais
- **mysql2**: Driver MySQL para conexão com banco de dados
- **drizzle-orm**: ORM type-safe com dialeto MySQL
- **passport & passport-local**: Middleware de autenticação
- **@tanstack/react-query**: Gerenciamento de estado do servidor
- **react-hook-form**: Manipulação de formulários com validação
- **zod**: Biblioteca de validação de esquema
- **date-fns**: Manipulação e formatação de datas

### Dependências de UI
- **@radix-ui/***: Primitivos de UI acessíveis (dialog, dropdown, etc.)
- **tailwindcss**: Framework CSS utility-first
- **lucide-react**: Biblioteca de ícones
- **class-variance-authority**: Gerenciamento de variantes de componentes

### Dependências de Desenvolvimento
- **vite**: Ferramenta de build e servidor de desenvolvimento
- **typescript**: Segurança de tipos
- **tsx**: Execução TypeScript para desenvolvimento

## Estratégia de Deploy

### Processo de Build
- Frontend: Vite compila aplicação React para `dist/public`
- Backend: esbuild empacota servidor Express para `dist/index.js`
- Artefato único de deploy com servir arquivos estáticos

### Configuração de Ambiente
- Conexão com banco de dados MySQL via variáveis de ambiente:
  - `DB_USER`: Nome de usuário do banco MySQL
  - `DB_PASSWORD`: Senha do banco MySQL
  - `DB_NAME`: Nome do banco de dados
- Servidor MySQL hospedado em srv1661.hstgr.io
- Segredo de sessão para segurança de autenticação

### Configuração de Desenvolvimento
- `npm run dev`: Inicia servidor de desenvolvimento com hot reload
- `npm run build`: Cria build de produção
- `npm run start`: Executa servidor de produção
- `npm run db:push`: Sincroniza esquema do banco com Drizzle

## Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma da interface: Português brasileiro (todos os elementos da UI traduzidos do inglês para português).

## Registro de Alterações

### Marcos Principais
- **15 de julho de 2025** - Migração completa do Replit Agent para ambiente Replit padrão concluída com sucesso
- **15 de julho de 2025** - Verificação final da migração: aplicação funcionando perfeitamente no ambiente Replit
- **15 de julho de 2025** - Documentação e interface totalmente traduzidas para português brasileiro
- **15 de julho de 2025** - Aplicação PartiuTrip totalmente operacional com MySQL
- **14 de julho de 2025** - Sistema de autenticação híbrida implementado com segurança robusta
- **14 de julho de 2025** - Plataforma de divisão de custos estilo Splitwise completamente funcional
- **14 de julho de 2025** - Sistema de gamificação com níveis de viajante e programa PartiuAmigos
- **13 de julho de 2025** - Interface redesenhada com design moderno e responsivo
- **15 de julho de 2025** - Sistema completo de avaliações e reviews para atividades turísticas
- **12 de julho de 2025** - Sistema de atividades turísticas inspirado no TripAdvisor
- **11 de julho de 2025** - Dashboard dinâmico com filtros avançados e estatísticas em tempo real
- **6 de julho de 2025** - Interface completamente traduzida para português brasileiro
- **5 de julho de 2025** - Sistema de autenticação baseado em sessão implementado
- **30 de junho de 2025** - Configuração inicial do projeto PartiuTrip

### Detalhes Técnicos
- **Banco de Dados**: Migração completa de PostgreSQL para MySQL com todas as tabelas e dados
- **Autenticação**: Sistema híbrido com suporte a cookies e headers de sessão
- **Interface**: Design responsivo com Tailwind CSS e componentes Shadcn/UI
- **Funcionalidades**: Sistema completo de viagens, divisão de custos, chat e gamificação
- **Segurança**: Implementação de boas práticas de segurança e validação de dados
- July 15, 2025. Corrigido sistema de contagem de participantes para usar apenas participantes aceitos em toda aplicação
- July 15, 2025. Implementada função getRealParticipantsCount() padronizada e sincronização automática no backend
- July 15, 2025. Corrigido AdvancedActivityManager para calcular custos baseado em participantes aceitos reais
- July 15, 2025. Implementado sistema responsivo para DialogContent - todos os diálogos agora se ajustam automaticamente ao tamanho da tela
- July 15, 2025. Corrigido sistema de parsing de atividades planejadas para tratar strings JSON duplamente escapadas do banco de dados
- July 15, 2025. Implementada timeline visual para atividades planejadas com agrupamento por data e melhor experiência do usuário
- July 15, 2025. Corrigido sistema de datas na timeline com suporte a diferentes formatos de data/hora
- July 15, 2025. Migração completa do Replit Agent para ambiente Replit padrão - aplicação funcionando perfeitamente
- July 15, 2025. Corrigido bug nas propostas de orçamento: removido valor hardcoded que fazia proposta aparecer incorretamente como "já incluído"
- July 15, 2025. Implementada lógica dinâmica para verificar propostas realmente incluídas nas viagens do usuário
- July 15, 2025. Padronizado design de botões azuis em todos os componentes da aplicação com gradientes e estados consistentes
- July 15, 2025. Removido efeitos hover amarelo/laranja inconsistentes da página de atividades e aplicado tema azul uniforme
- July 15, 2025. Corrigido todos os efeitos hover amarelos em botões das páginas de atividades, detalhamento, perfil e home - aplicado tema azul consistente
- July 15, 2025. Corrigido TODOS os botões com efeitos hover amarelo/laranja na aplicação inteira - agora 100% dos botões seguem o tema azul padrão
- July 15, 2025. Removido cores amarelo/laranja de dashboard, home, atividades e propostas de orçamento - identidade visual unificada com tema azul/índigo
- July 15, 2025. Corrigido card "melhor custo-benefício" para manter padrão visual verde consistente (borda, botão, badge)
- July 15, 2025. Corrigido sistema de adição de atividades a viagens - agora mostra todas as viagens do usuário sem filtro de localização
- July 15, 2025. Implementado filtro por localização da atividade para mostrar apenas viagens na mesma cidade
- July 15, 2025. Corrigido sistema de parsing de dados JSON duplamente escapados nas propostas de orçamento
- July 15, 2025. Corrigido erro de tipo em proposal.inclusions.map através de parsing seguro de arrays JSON
- July 15, 2025. Implementada nova lógica de preços baseada em propostas de orçamento: atividades são gratuitas por padrão, preços determinados pelas propostas selecionadas
- July 15, 2025. Removida área duplicada de propostas do sidebar e integradas funcionalidades nos cards da aba orçamentos com seleção múltipla
- July 15, 2025. Implementado estado "Já incluído" para botões de propostas que já foram adicionadas às viagens do usuário
- July 15, 2025. **MIGRAÇÃO CONCLUÍDA**: Migração completa do Replit Agent para ambiente Replit padrão finalizada com sucesso - aplicação 100% funcional
- July 15, 2025. **MIGRAÇÃO CONFIRMADA**: Migração do Replit Agent para ambiente Replit padrão confirmada pelo usuário - todas as funcionalidades operacionais
- July 15, 2025. **MIGRAÇÃO FINALIZADA**: Migração do Replit Agent para ambiente Replit concluída com sucesso - aplicação 100% funcional no ambiente padrão
- July 15, 2025. Implementado sistema de votação por proposta individual com toggle: usuários podem votar e remover voto clicando novamente
- July 15, 2025. Alterado texto de "Você já votou nesta atividade" para "Já deu like!" em toda interface de propostas de orçamento
- July 15, 2025. Criado endpoint /api/proposals/:id/user-vote para verificar votos individuais por proposta
- July 15, 2025. Implementado sistema de votação debounced: voto só é contabilizado após 800ms do último clique, evitando spam
- July 15, 2025. Adicionado feedback visual para votos pendentes com animação e cor amarela durante processamento
- July 15, 2025. Corrigido erro "Expected array, received string" nas propostas de orçamento - campos inclusões/exclusões agora funcionam corretamente como arrays
- July 15, 2025. Corrigido erro de ícone Plus não encontrado no componente AddActivityToTrip
- July 15, 2025. Implementado sistema automático de atualização de orçamento: valores de atividades agora são adicionados automaticamente ao orçamento das viagens
- July 15, 2025. Corrigido endpoint incorreto /api/trips/my-trips para /api/my-trips na página de detalhes da atividade
- July 15, 2025. Corrigido erro com userTrips.flatMap() para tratar estrutura correta de dados { created: [], participating: [] }
- July 15, 2025. **SISTEMA DE AVALIAÇÕES IMPLEMENTADO**: Sistema completo de avaliações para atividades turísticas
- July 15, 2025. Criado endpoint GET/POST /api/activities/:id/reviews para buscar e criar avaliações
- July 15, 2025. Implementado componente ActivityReviews com interface de avaliação por estrelas (1-5)
- July 15, 2025. Adicionado sistema de "marcar como útil" para avaliações com endpoint /api/reviews/:id/helpful
- July 15, 2025. Integrado sistema de avaliações na página de detalhes de atividades com aba dedicada
- July 15, 2025. Criados dados de exemplo de avaliações para demonstração do sistema funcionando
- July 15, 2025. Sistema de avaliações permite upload de fotos, data da visita e badges de verificação
- July 16, 2025. **SISTEMA DE AVALIAÇÕES APRIMORADO**: Implementado sistema completo com verificação de usuários e controle de edição
- July 16, 2025. Apenas usuários verificados podem criar avaliações para usuários, destinos e atividades
- July 16, 2025. Cada usuário pode fazer apenas uma avaliação por item com janela de edição de 7 dias
- July 16, 2025. Sistema de reportes de avaliações: avaliações são automaticamente ocultadas após 5 reports
- July 16, 2025. Avaliações ocultas não aparecem nas listagens públicas, mantendo qualidade do conteúdo
- July 16, 2025. Rotas PUT e DELETE para editar/excluir avaliações dentro do prazo de 7 dias
- July 16, 2025. Verificação de duplicatas: usuários não podem avaliar o mesmo item duas vezes
- July 16, 2025. Sistema de reports implementado para usuários, destinos e atividades com auto-moderação
- July 16, 2025. **PÁGINA DE ATIVIDADES REDESENHADA**: Recriada página de atividades com design moderno e profissional
- July 16, 2025. Implementado design responsivo com hero section, seção de atividades populares e filtros avançados
- July 16, 2025. Adicionado sistema de visualização em grid/lista, sidebar de filtros desktop e sheet mobile
- July 16, 2025. Interface com animações suaves, contadores de filtros ativos e sistema de busca com debounce
- July 16, 2025. Criado sistema de cards modernos com hover effects, badges de categoria e preços destacados
- July 16, 2025. Sistema de filtros visuais por categoria com ícones, contador de atividades e estados de loading otimizados
- July 12, 2025. Enhanced trip detail page with modern dynamic layout, contagem regressiva em tempo real, and improved budget tracking visualization
- July 12, 2025. Added advanced activity management system with drag-and-drop functionality, file attachments, cost estimation, and automatic budget integration
- July 12, 2025. Implemented real-time countdown timer with animations, enhanced budget breakdown with progress tracking, and contextual budget tips
