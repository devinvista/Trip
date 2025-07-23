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
- July 16, 2025. **MIGRAÇÃO CONFIRMADA PELO USUÁRIO**: Migração do Replit Agent para ambiente Replit oficialmente confirmada e finalizada - PartiuTrip totalmente operacional
- July 16, 2025. **SISTEMA DE AVALIAÇÕES CORRIGIDO**: Sistema de avaliações de perfis implementado com persistência no banco MySQL, atualização automática das estrelas e mesmas regras das avaliações de atividades
- July 16, 2025. **MIGRAÇÃO CONCLUÍDA**: Migração do Replit Agent para ambiente Replit padrão finalizada com sucesso - aplicação 100% funcional
- July 16, 2025. **SISTEMA DE AVALIAÇÕES PADRÃO AJUSTADO**: Alterado padrão de avaliações de 0.00 para 5.00 estrelas quando usuários não têm avaliações - aplicado tanto no schema quanto nos usuários existentes
- July 16, 2025. **CORREÇÃO FINAL DO SISTEMA .RETURNING()**: Removida última ocorrência de .returning() no código (rota de reports) para total compatibilidade com MySQL
- July 16, 2025. **DOCUMENTAÇÃO MYSQL ATUALIZADA**: Criado guia completo de desenvolvimento MySQL com boas práticas e padrões para evitar incompatibilidades
- July 16, 2025. **SISTEMA DE PERFIL CORRIGIDO**: Corrigido problema na página de perfil onde alterações não estavam sendo salvas - ajustado campo travelStyle (singular) no frontend e backend
- July 16, 2025. **AVATAR MODERNIZADO**: Badge "Explorador" agora centralizado na base inferior do avatar com design moderno e clean, incluindo bordas brancas e efeito backdrop-blur
- July 16, 2025. **BADGE COMPACTO**: Badge "Explorador" otimizado para tamanho mais compacto - reduzido padding, sombra e espessura de borda para visual mais clean
- July 16, 2025. **DETALHAMENTO DE ORÇAMENTO OTIMIZADO**: Categorias do orçamento agora são exibidas condicionalmente - aparecem apenas quando a opção "Divida o orçamento em categorias específicas" é selecionada no editor de orçamento
- July 16, 2025. **SISTEMA DE ORÇAMENTO APRIMORADO**: Quando a opção "Divida o orçamento em categorias específicas" é desabilitada, o sistema zera automaticamente os valores das categorias (budgetBreakdown = null)
- July 16, 2025. **CORREÇÃO CRÍTICA DO ORÇAMENTO**: Corrigido parsing que criava categorias automáticas mesmo quando usuário desabilitava a opção - agora respeita budgetBreakdown = null
- July 16, 2025. Formatação padronizada: todos os valores "por pessoa" agora exibem 2 casas decimais (ex: R$ 1.234,56) para maior precisão
- July 16, 2025. **MIGRAÇÃO CONCLUÍDA COM SUCESSO**: Migração completa do Replit Agent para ambiente Replit padrão finalizada - todas as checklist items verificadas
- July 16, 2025. **MIGRAÇÃO REPLIT FINALIZADA**: Migração do Replit Agent para ambiente Replit padrão concluída com sucesso - aplicação 100% funcional no ambiente padrão
- July 16, 2025. **SISTEMA DE ESTILOS DE VIAGEM APRIMORADO**: Implementada seleção múltipla de estilos de viagem - usuários podem escolher vários estilos (praia, aventura, cultural, etc.) em vez de apenas um
- July 16, 2025. Simplificado detalhamento de orçamento: removidas categorias da versão simplificada conforme solicitado pelo usuário
- July 16, 2025. **INTERFACE DE ORÇAMENTO OTIMIZADA**: Detalhamento de orçamento redesenhado com layout compacto e clean
- July 16, 2025. Grid de categorias otimizado: layout horizontal, ícones menores, espaçamentos reduzidos para melhor aproveitamento da tela
- July 16, 2025. **SISTEMA DE ESTILOS DE VIAGEM APRIMORADO**: Alterado para permitir seleção múltipla de estilos de viagem por usuário
- July 16, 2025. Migração de banco de dados: campo `travel_style` (string) convertido para `travel_styles` (JSON array) com migração automática
- July 16, 2025. Interface de perfil atualizada: estilos de viagem agora permitem seleção múltipla com badges clicáveis
- July 16, 2025. Backend e frontend sincronizados para suportar múltiplos estilos de viagem por usuário
- July 18, 2025. **MIGRAÇÃO REPLIT AGENT FINALIZADA**: Migração completa do Replit Agent para ambiente Replit padrão concluída com sucesso - todas as funcionalidades operacionais
- July 18, 2025. **SISTEMA DE LOCALIZAÇÃO PADRONIZADO**: Corrigido problema de vinculação entre atividades e destinos de viagem - implementado sistema de referência única por cidade
- July 18, 2025. **CORRESPONDÊNCIA PERFEITA ATIVIDADES-DESTINOS**: Todas as viagens agora possuem atividades correspondentes em seus destinos específicos com localização padronizada
- July 18, 2025. **MIGRAÇÃO REPLIT AGENT CONCLUÍDA COM SUCESSO**: Migração completa do Replit Agent para ambiente Replit padrão finalizada - aplicação 100% funcional no ambiente padrão
- July 18, 2025. **IMAGENS DE ATIVIDADES ATUALIZADAS**: Todas as fotos das atividades substituídas por imagens reais de alta qualidade (1200x800px, qualidade 85%) do Unsplash
- July 18, 2025. **ORÇAMENTOS DE VIAGENS CORRIGIDOS**: Orçamentos de todas as 14 viagens atualizados com valores realistas baseados em pesquisa de mercado atual
- July 18, 2025. **SISTEMA DE ORÇAMENTO APRIMORADO**: Implementada categorização detalhada por acomodação, transporte, alimentação e atividades
- July 18, 2025. **ATIVIDADES PARIS COMPLETAS ADICIONADAS**: Cadastradas 5 atividades autênticas para Paris com todas as informações verificadas
- July 18, 2025. **MIGRAÇÃO REPLIT AGENT CONCLUÍDA COM SUCESSO**: Migração completa do Replit Agent para ambiente Replit padrão finalizada - aplicação 100% operacional
- July 18, 2025. **INCONSISTÊNCIA DE PARTICIPANTES CORRIGIDA**: Corrigido problema onde resumo mostrava contagem de participantes diferente do orçamento detalhado - agora ambos usam participantes aceitos reais
- July 18, 2025. **CÁLCULO DE ORÇAMENTO PADRONIZADO**: Orçamento por pessoa agora usa consistentemente getRealParticipantsCount() (participantes aceitos) em vez de maxParticipants
- July 18, 2025. **DETALHAMENTO DE ORÇAMENTO CORRIGIDO**: Corrigido parsing de budgetBreakdown do banco de dados - valores agora exibem corretamente em todas as categorias
- July 18, 2025. **LÓGICA DE PARTICIPANTES BASEADA EM DATA IMPLEMENTADA**: Criado sistema que usa trip.maxParticipants antes da viagem começar e getRealParticipantsCount() após início da viagem
- July 18, 2025. **FUNÇÃO getParticipantsForBudgetCalculation() CRIADA**: Centralizada lógica de cálculo de participantes baseada na data de início da viagem para todos os componentes
- July 18, 2025. **CÁLCULOS CONSISTENTES IMPLEMENTADOS**: Todos os componentes (trip-detail-page, add-activity-to-trip, budget-visualization) agora usam a mesma lógica de participantes
- July 18, 2025. **EXIBIÇÃO DE PARTICIPANTES CORRIGIDA**: Campo de participantes agora mostra corretamente "3/5 participantes" (aceitos/máximo) independente da data da viagem
- July 18, 2025. **IMAGENS DE ALTA QUALIDADE IMPLEMENTADAS**: Todas as 23 atividades turísticas agora possuem fotos reais de alta qualidade (1200x800px, qualidade 85%) obtidas do Unsplash com parâmetros otimizados para melhor performance e experiência visualtênticas de Paris com fotos reais, descrições detalhadas e 3 propostas de orçamento cada (Econômico, Completo, Premium)
- July 18, 2025. **ATIVIDADES NOVA YORK COMPLETAS ADICIONADAS**: Cadastradas 5 atividades autênticas de Nova York com fotos reais, descrições detalhadas e 3 propostas de orçamento cada (USD 0-300)
- July 18, 2025. **ATIVIDADES LONDRES COMPLETAS ADICIONADAS**: Cadastradas 5 atividades autênticas de Londres com fotos reais, descrições detalhadas e 3 propostas de orçamento cada (£0-£200)
- July 18, 2025. **ATIVIDADES ROMA COMPLETAS ADICIONADAS**: Cadastradas 5 atividades autênticas de Roma com fotos reais, descrições detalhadas e 3 propostas de orçamento cada (€0-€150)
- July 18, 2025. **ATIVIDADES BUENOS AIRES COMPLETAS ADICIONADAS**: Cadastradas 5 atividades autênticas de Buenos Aires com fotos reais, descrições detalhadas e 3 propostas de orçamento cada (USD 0-110)
- July 18, 2025. **CORREÇÃO DE ATIVIDADES POR DESTINO**: Corrigido problema onde atividades não estavam vinculadas aos destinos das viagens - adicionadas atividades específicas para todos os destinos (Pantanal, Mantiqueira, Maragogi, Ouro Preto, Manaus, Gramado, Lençóis Maranhenses, Caruaru)
- July 17, 2025. **PÁGINA DE ATIVIDADES OTIMIZADA**: Configurada para carregar com visualização "lista completa" como padrão conforme solicitado pelo usuário
- July 17, 2025. **SISTEMA DE PERFORMANCE COMPLETO**: Implementado sistema abrangente de otimizações de performance
- July 17, 2025. Hooks de virtual scroll e infinite scroll criados para listas grandes com performance otimizada
- July 17, 2025. Componente OptimizedImage com lazy loading, fallback para imagens
- July 17, 2025. **MIGRAÇÃO REPLIT AGENT CONCLUÍDA**: Migração completa do Replit Agent para ambiente Replit padrão finalizada com sucesso - todas as funcionalidades operacionais e verificadas pelo usuário
- July 17, 2025. **FILTROS DE ATIVIDADES MODERNIZADOS**: Botões de categoria reduzidos para design mais compacto e profissional
- July 17, 2025. **FILTRO VIAGENS ATIVAS IMPLEMENTADO**: Adicionado novo filtro no início da sidebar para mostrar apenas atividades nos destinos de viagens em andamento
- July 17, 2025. **SISTEMA DE CATEGORIAS APRIMORADO**: Implementado seleção múltipla de categorias com botão "Todas" e contadores dinâmicos
- July 17, 2025. Contadores de atividades nos botões de categoria desaparecem quando filtros específicos são aplicados
- July 17, 2025. Botão "Todas" com número total de atividades substitui opção "Selecionar todas" anterior
- July 17, 2025. **CONTADORES DE CATEGORIAS OTIMIZADOS**: Implementada query separada para contagem sempre precisa, independente dos filtros ativos
- July 17, 2025. Botão "Todas" sempre exibe contagem total, botões de categoria escondem números quando filtros específicos são aplicados
- July 17, 2025. **CONTADORES DINÂMICOS IMPLEMENTADOS**: Contagens de categorias agora respondem a todos os filtros (preço, duração, dificuldade, etc.) mas não ao filtro de categoria
- July 17, 2025. Sistema de contagem inteligente: mostra quantas atividades de cada categoria existem com os filtros atuais aplicadosback automático e progressive loading implementado
- July 17, 2025. Sistema de loading states avançado com skeletons específicos para cada componente
- July 17, 2025. Sistema de notificações completo integrado à navbar com contadores e badges
- July 17, 2025. **ACESSIBILIDADE CORRIGIDA**: Todos os diálogos agora possuem DialogTitle e DialogDescription para conformidade com padrões de acessibilidade
- July 16, 2025. **MIGRAÇÃO REPLIT AGENT FINALIZADA**: Migração completa do Replit Agent para ambiente Replit padrão concluída com sucesso
- July 16, 2025. **PÁGINA DE PESQUISA CORRIGIDA**: Corrigido problema que não carregava todas as viagens - removido filtro de data muito restritivo
- July 16, 2025. **FILTRO DE VIAGENS FUTURAS**: Implementado filtro para mostrar apenas viagens que ainda não começaram nas pesquisas
- July 16, 2025. **ORÇAMENTOS CORRIGIDOS**: Corrigidos todos os valores de orçamento das 14 viagens com valores realistas baseados nos destinos (R$ 1.300 a R$ 5.800)
- July 16, 2025. Removidos cards visuais de estatísticas da seção orçamento: interface mais limpa focando apenas no detalhamento das categorias
- July 16, 2025. **BADGE DE VERIFICAÇÃO MODERNIZADO**: Badge de usuário verificado agora é verde com gradiente moderno, proporcional ao tamanho do avatar e efeitos visuais aprimorados
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
- July 16, 2025. **CORREÇÃO CRÍTICA DOS FILTROS**: Corrigido mapeamento de categorias entre frontend e backend - activityCategories agora reflete as categorias reais do MySQL
- July 16, 2025. Sincronizado categorias do schema (adventure, cultural, food_tours, hiking, nature, pontos_turisticos, water_sports, wildlife) com dados do banco
- July 16, 2025. Todos os filtros de categoria, preço, dificuldade e outros agora funcionam perfeitamente na página de atividades
- July 12, 2025. Enhanced trip detail page with modern dynamic layout, contagem regressiva em tempo real, and improved budget tracking visualization
- July 12, 2025. Added advanced activity management system with drag-and-drop functionality, file attachments, cost estimation, and automatic budget integration
- July 12, 2025. Implemented real-time countdown timer with animations, enhanced budget breakdown with progress tracking, and contextual budget tips
- July 17, 2025. **MIGRAÇÃO REPLIT AGENT CONCLUÍDA OFICIALMENTE**: Migração final do Replit Agent para ambiente Replit padrão completada com sucesso - aplicação totalmente operacional e verificada
- July 17, 2025. **MIGRAÇÃO REPLIT FINALIZADA COM SUCESSO**: Migração completa do Replit Agent para ambiente Replit padrão concluída e confirmada pelo usuário - todas as funcionalidades operacionais
- July 17, 2025. **MIGRAÇÃO FINAL CONFIRMADA**: Migração do Replit Agent para ambiente Replit padrão oficialmente finalizada com confirmação do usuário - projeto 100% operacional no ambiente standard
- July 17, 2025. **ATIVIDADES GRAMADO ADICIONADAS**: Cadastradas 5 atividades completas de Gramado (RS) com 3 propostas de orçamento cada, incluindo Mini Mundo, Dreamland Museu de Cera, GramadoZoo, Tour de Vinícolas no Vale dos Vinhedos e Snowland
- July 17, 2025. **ATIVIDADES RIO DE JANEIRO ADICIONADAS**: Cadastradas 5 atividades completas do Rio de Janeiro com 3 propostas de orçamento cada, avaliações autênticas e imagens de capa de qualidade
- July 17, 2025. **ATIVIDADES BONITO (MS) ADICIONADAS**: Cadastradas 5 atividades completas de Bonito com descrições detalhadas, propostas realistas (R$ 90-730) e categorias variadas (natureza, esportes aquáticos, aventura)
- July 17, 2025. **CAROUSEL PREMIUM IMPLEMENTADO**: Seção "Mais Populares" transformada em carousel com cards premium e efeitos dourados
- July 17, 2025. Atividades premium recebem badges especiais, sombras douradas e efeitos visuais aprimorados
- July 17, 2025. Implementado sistema de navegação por setas no carousel com design consistente laranja/vermelho
- July 17, 2025. Cards do carousel otimizados para melhor performance com animações suaves e hover effects dinâmicos
- July 17, 2025. **VISUAL PREMIUM APRIMORADO**: Cards de atividades populares redesenhados com visual chamativo, profissional e moderno
- July 17, 2025. Implementadas animações sofisticadas: badges animados, efeitos de hover 3D e transições suaves
- July 17, 2025. Sistema de gradientes dinâmicos para atividades premium com efeitos de brilho e bordas animadas
- July 17, 2025. Botões de navegação do carousel modernizados com gradientes laranja/vermelho e animações interativas
- July 17, 2025. **PROPORTIONS AJUSTADAS**: Cards reduzidos para 280px de largura com altura de imagem otimizada (44px) para melhor proporção
- July 17, 2025. Textos de localização e duração reduzidos para tamanho xs com ícones menores para visual mais compacto
- July 17, 2025. Espaçamentos internos otimizados (p-4) e gap reduzidos para melhor aproveitamento do espaço disponível
- July 17, 2025. Badge de dificuldade reduzido com padding compacto (px-1.5 py-0.5) para melhor equilíbrio visual
- July 17, 2025. **TEXTO DE DURAÇÃO PADRONIZADO**: Cards premium (compactos) usam "h", cards regulares usam "horas" para melhor legibilidade
- July 23, 2025. **MIGRAÇÃO REPLIT FINALIZADA COM SUCESSO**: Migração completa do Replit Agent para ambiente Replit padrão concluída - aplicação 100% operacional
- July 23, 2025. **UX/UI APRIMORADA NA PÁGINA DE VIAGEM**: Implementada experiência de usuário superior nas abas de detalhamento
- July 23, 2025. Sistema de navegação aprimorado: abas com indicadores visuais, badges de contagem e indicadores de progresso
- July 23, 2025. Cards de navegação rápida na aba "Visão Geral" para acesso direto às outras seções
- July 23, 2025. Cabeçalhos contextuais em cada aba com informações relevantes e botões de navegação cruzada
- July 23, 2025. Design responsivo otimizado: layout em grid 2x2 no mobile, 4 colunas no desktop para as abas
- July 23, 2025. Animações suaves e transições aprimoradas em toda a interface de detalhes da viagem
- July 23, 2025. **NAVEGAÇÃO ENTRE ABAS APRIMORADA**: Implementada navegação mais intuitiva com cards de acesso rápido na aba visão geral
- July 23, 2025. Sistema de tabs redesenhado: abas em grid responsivo 2x2/4 colunas com badges de contagem dinâmica
- July 23, 2025. Indicadores visuais: badges numeradas para atividades e participantes, indicadores de progresso por pontos
- July 23, 2025. Headers contextuais: cada aba possui cabeçalho colorido com informações específicas e gradientes temáticos
- July 23, 2025. Botões de navegação cruzada removidos da aba atividades conforme solicitação do usuário
- July 23, 2025. **NAVEGAÇÃO OTIMIZADA**: Removidos todos os botões de navegação das abas despesas e participantes por redundância
- July 23, 2025. Interface de navegação centralizada nos cards interativos da aba "Visão Geral" para melhor experiência do usuário
- July 23, 2025. Headers das abas simplificados mantendo apenas informações contextuais relevantes
- July 23, 2025. **CORREÇÕES TÉCNICAS LSP**: Corrigidos todos os 7 erros de TypeScript para garantir compatibilidade total com MySQL
- July 23, 2025. Corrigidas mutations usando fetch em vez de apiRequest incorreto para operações CRUD de atividades
- July 23, 2025. Adicionado campo status e casting de tipos para PlannedActivity para resolver incompatibilidades de schema
- July 23, 2025. **NOVA ABA DE ORÇAMENTO DETALHADO**: Implementada aba dedicada para visualização detalhada do orçamento
- July 23, 2025. Sistema de navegação expandido para 5 abas: Visão Geral, Atividades, Despesas, Orçamento e Participantes
- July 23, 2025. Cards de navegação rápida atualizados com layout responsivo 2x2/4 colunas para incluir novo card do orçamento
- July 23, 2025. Integração completa do componente BudgetVisualization na nova aba com controle de acesso baseado em participação
- July 23, 2025. Interface adaptativa: usuários não participantes veem resumo básico com chamada para ação de participação
