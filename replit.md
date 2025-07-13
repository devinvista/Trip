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
- **Armazenamento de Sessão**: Sessões Express com armazenamento PostgreSQL
- **Segurança de Senha**: Módulo crypto do Node.js com hash scrypt
- **Design de API**: Endpoints RESTful com respostas JSON
- **Banco de Dados**: PostgreSQL com Drizzle ORM

### Esquema do Banco de Dados
A aplicação usa PostgreSQL com as seguintes entidades principais:
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

1. **Cadastro/Login de Usuário**: Usuários se autenticam através da estratégia local, sessões são armazenadas no PostgreSQL
2. **Criação de Viagem**: Usuários autenticados criam viagens com informações de planejamento detalhado
3. **Descoberta de Viagem**: Usuários pesquisam e filtram viagens baseadas em preferências e compatibilidade
4. **Solicitações de Participação**: Usuários solicitam participar de viagens, criadores aprovam/rejeitam solicitações
5. **Comunicação**: Participantes aprovados podem conversar dentro de grupos de viagem
6. **Compartilhamento de Custos**: Criadores de viagem definem despesas compartilhadas, participantes coordenam pagamentos

## Dependências Externas

### Dependências Principais
- **@neondatabase/serverless**: Driver PostgreSQL para banco de dados Neon
- **drizzle-orm**: ORM type-safe com dialeto PostgreSQL
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
- Conexão com banco de dados via variável de ambiente `DATABASE_URL`
- Segredo de sessão para segurança de autenticação
- Neon PostgreSQL como banco de dados de produção

### Configuração de Desenvolvimento
- `npm run dev`: Inicia servidor de desenvolvimento com hot reload
- `npm run build`: Cria build de produção
- `npm run start`: Executa servidor de produção
- `npm run db:push`: Sincroniza esquema do banco com Drizzle

## Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana.
Idioma da interface: Português brasileiro (todos os elementos da UI traduzidos do inglês para português).

## Registro de Alterações

Registro de Alterações:
- 30 de junho de 2025. Configuração inicial
- July 5, 2025. Fixed authentication session management with proper cookie configuration
- July 5, 2025. Implemented budget subdivision system - budget now represents total trip cost with automatic per-person calculation
- July 5, 2025. Enhanced trip detail page with chat functionality and improved user interface
- July 5, 2025. Added comprehensive expense category breakdown (transport, accommodation, food, activities, etc.)
- July 5, 2025. Created new dynamic home page with featured destinations, trip highlights, and attractive design elements
- July 5, 2025. Added cookie-parser middleware and simplified authentication flow for better session persistence
- July 5, 2025. Removed CORS middleware in favor of native Express session handling
- July 5, 2025. Changed home page to be publicly accessible - no authentication required for initial page
- July 5, 2025. Fixed authentication and login flow - password hashing now uses consistent scrypt method
- July 5, 2025. Fixed route navigation - all dashboard links now point to correct routes (/create-trip, /search)
- July 5, 2025. Trip creators are automatically added as participants with 'accepted' status
- July 5, 2025. Updated session configuration - httpOnly set to false for development, using session store
- July 5, 2025. Fixed trip detail page functionality - added missing API route for individual trip details
- July 5, 2025. Fixed trip card links to use correct route pattern (/trip/:id)
- July 5, 2025. Improved search page with proper filters and API integration
- July 5, 2025. Implemented interactive trip budget visualization with progress bars, pie charts, and budget tips
- July 5, 2025. Migrated successfully from Replit Agent to standard Replit environment
- July 5, 2025. Implemented simplified chat system as mural with message exchange between participants
- July 5, 2025. Fixed session authentication issues by correcting cookie configuration and middleware order
- July 5, 2025. Created default test trips for user Tom: Chapada Diamantina adventure and Campos do Jordão weekend
- July 5, 2025. Enhanced chat window with message composition area, character counter, and proper message display
- July 5, 2025. Successfully migrated from Replit Agent to standard Replit environment with proper security practices
- July 5, 2025. Added animated journey progress tracker with milestone celebrations, point system, and category-based progress visualization
- July 5, 2025. Implemented collaborative trip planning with real-time group editing using WebSocket connections
- July 5, 2025. Added presence indicators, live cursors, and conflict resolution for simultaneous trip editing
- July 5, 2025. Created comprehensive collaborative editing demo page with technical documentation
- July 6, 2025. Translated entire interface to Portuguese - all UI text, form labels, buttons, error messages, and navigation
- July 6, 2025. Implemented expense splitting system similar to Splitwise - participants can add expenses, split costs, track balances, and see settlement suggestions
- July 11, 2025. Successfully migrated from Replit Agent to standard Replit environment with enhanced authentication system
- July 11, 2025. Fixed authentication issues by implementing hybrid session management - supports both cookie-based and header-based session authentication for browser compatibility
- July 11, 2025. Added manual session ID authentication as fallback when browser cookies are blocked - session IDs stored in localStorage and sent via X-Session-ID header
- July 11, 2025. Fixed "Viagens que Estou Participando" section by correctly filtering out trips where user is the creator - now shows only trips where user is a participant but not the creator
- July 11, 2025. Enhanced test data with second test user (maria/demo123) and trip participation examples for better testing of all platform features
- July 11, 2025. Completely redesigned dashboard with modern, dynamic interface featuring gradient backgrounds, colorful stat cards, interactive filters, and improved user experience
- July 11, 2025. Added comprehensive error handling with toast notifications, debug logging, and graceful error states throughout the dashboard
- July 11, 2025. Implemented responsive design improvements for mobile and tablet devices with flexible layouts and better component organization
- July 11, 2025. Enhanced trip statistics calculation with real-time data processing for upcoming, in-progress, and completed trips with visual progress indicators
- July 11, 2025. Implemented "Desistir da Viagem" (quit trip) functionality - participants can leave trips with automatic organizer transfer to first participant if creator leaves
- July 11, 2025. Added backend API endpoint DELETE /api/trips/:id/participants/:userId for removing participants with proper permission checks and automatic trip management
- July 11, 2025. Enhanced storage interface with removeTripParticipant method that handles organizer transfer and automatic trip cancellation when no participants remain
- July 11, 2025. Added confirmation dialog in trip detail page for participants to leave trips with clear warnings and user feedback
- July 11, 2025. Fixed trip join request API endpoint - removed incorrect Zod schema validation for tripId (comes from URL params, not request body) and added duplicate request prevention
- July 11, 2025. Updated travel styles to match popular agency categories: Praia, Neve, Cruzeiros, Natureza e Ecoturismo, Culturais e Históricas, Aventura, Parques Temáticos - updated all components, forms, and test data
- July 11, 2025. Added "Viagens Urbanas / Cidades Grandes" travel style - updated create trip form, search filters, travel board, trip cards, and test user data (Tom changed to urbanas style)
- July 11, 2025. Removed collaborative editing functionality - deleted WebSocket connections, real-time editing components, and all related APIs for simplified architecture
- July 11, 2025. Completely redesigned create trip page with modern gamified interface using React DnD Kit for drag/drop functionality
- July 11, 2025. Implemented travel planning roadmap based on best practices: Research & Inspiration, Budget Planning, Dates & Duration, Group Formation, Logistics & Details
- July 11, 2025. Added interactive activities management with drag/drop prioritization, add/remove functionality, and real-time progress tracking
- July 11, 2025. Enhanced UX with Framer Motion animations, confetti celebrations, achievement system, and responsive gradient backgrounds
- July 11, 2025. Integrated comprehensive travel planning tips and roadmap guidance following industry best practices for trip organization
- July 12, 2025. Enhanced trip detail page with modern dynamic layout, contagem regressiva em tempo real, and improved budget tracking visualization
- July 12, 2025. Added advanced activity management system with drag-and-drop functionality, file attachments, cost estimation, and automatic budget integration
- July 12, 2025. Implemented real-time countdown timer with animations, enhanced budget breakdown with progress tracking, and contextual budget tips
- July 12, 2025. Modernized trip detail page with gradient backgrounds, backdrop blur effects, tabbed navigation, and improved user experience
- July 12, 2025. Expanded global destination coverage with 80+ international tourist destinations including Europe, Asia, Americas, Africa, and Oceania
- July 12, 2025. Enhanced destination descriptions with specific tourist landmarks (Cairo with Pyramids, Paris with Eiffel Tower, Tokyo with Shibuya Crossing, etc.)
- July 12, 2025. Improved cover image system with realistic travel agency-style destination images matching actual tourist attractions
- July 12, 2025. Successfully migrated from Replit Agent to standard Replit environment with all functionality preserved
- July 12, 2025. Created modern lighthouse-themed hero section for search page with animated SVG, gradient backgrounds, and glassmorphism effects
- July 12, 2025. Replaced "Navegue Pelos Seus Sonhos" title with emphasized main message about discovering destinations and connecting with travel companions
- July 12, 2025. Reduced hero section height by 50% and added statistical highlights (250+ trips, 1.2k travelers, 85+ destinations, 4.8★ rating)
- July 12, 2025. Positioned lighthouse visual element in bottom right corner for better layout balance
- July 12, 2025. Added comprehensive date filtering system with options for next week, next month, next 3 months, and specific months (Jan-Dec 2025)
- July 12, 2025. Implemented date range calculation logic with smart filtering based on trip start dates and enhanced active filters display
- July 12, 2025. Updated "cruzeiros" travel type to use ship icon instead of plane icon for better semantic accuracy
- July 12, 2025. Enhanced cruise trip handling - cruise trips now display cruise ship images instead of destination city images
- July 12, 2025. Added cruise ship image library with Mediterranean, Caribbean, Norwegian fjord, and Alaska cruise imagery
- July 12, 2025. Created test cruise trip "Cruzeiro pelo Mediterrâneo" to demonstrate cruise-specific features
- July 12, 2025. Implemented single standardized cruise ship image (https://images.unsplash.com/photo-1570647236643-68ff5e6b1efc) for all cruise destinations to ensure consistency and reliability
- July 12, 2025. Updated getCoverImageForDestination function to prioritize cruise-specific imagery for all trips with travelStyle="cruzeiros"
- July 12, 2025. Fixed cruise destination image mapping in both schema.ts and storage.ts to use single high-quality cruise ship image
- July 12, 2025. Updated cruise ship default image to use Brazilian travel guide image (https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg) for better compatibility and visual quality
- July 12, 2025. Replaced all cruise destination images in schema.ts and storage.ts to use new standardized cruise ship image from travel guide website
- July 12, 2025. Redesigned hero section with community focus - changed messaging from "Ilumine Sua Jornada" to "Viaje Junto, Gaste Menos" emphasizing shared experiences and cost reduction
- July 12, 2025. Updated lighthouse SVG to CommunityLighthouseSVG featuring people connections, community platform, and multiple colored beams representing shared experiences
- July 12, 2025. Modified statistics to show "65% Economia Média", "2.8k+ Viajantes Conectados", "1.2k+ Experiências Compartilhadas" focusing on community benefits
- July 12, 2025. Changed CTA buttons to "Encontrar Companheiros" and "Compartilhar Viagem" with Users and DollarSign icons for better community focus
- July 12, 2025. Updated floating elements around lighthouse to show Users (community), DollarSign (savings), and Heart (experiences) icons
- July 12, 2025. Enhanced subtitle to emphasize connecting travelers, cost sharing, and intelligent travel approach
- July 12, 2025. Updated background gradient to match reference image with deep blue tones (slate-900 → blue-950 → slate-800)
- July 12, 2025. Adjusted floating orbs opacity and colors to harmonize with darker background theme
- July 12, 2025. Enhanced navbar "Entrar" button with hover effect matching "Viaje Junto" gradient colors and dark background
- July 12, 2025. Completely redesigned "Destinos em Alta" section with modern glassmorphism design, gradient backgrounds, animated elements, and trending indicators
- July 12, 2025. Implemented new footer with comprehensive site navigation, social media links, platform statistics, and cohesive slate-based color scheme
- July 12, 2025. Enhanced destination cards with backdrop blur effects, improved typography, floating trend badges, and smooth hover animations
- July 12, 2025. Updated CTA section with improved gradient backgrounds, animated orbs, and better visual hierarchy matching overall design theme
- July 12, 2025. Added glassmorphism effects throughout sections using backdrop-blur and white/transparent overlays for modern aesthetic
- July 12, 2025. Convertido plano de fundo da página inicial para degradê claro (slate-50 → blue-50 → cyan-50) criando visual clean e moderno
- July 12, 2025. Substituídas todas as cores roxas/púrpuras por tons de azul para paleta harmoniosa (purple-400 → blue-400, purple-500 → indigo-500)
- July 12, 2025. Ajustados textos da hero section para slate-800 e slate-600 garantindo boa legibilidade no fundo claro
- July 12, 2025. Elementos de destaque mantidos em tons quentes (amarelo/laranja) para contrastar com o fundo azul claro
- July 12, 2025. Melhorias massivas de responsividade na página de detalhes da viagem - seção de informações principais, TripStatistics, CountdownTimer, e sidebar otimizados para dispositivos móveis
- July 12, 2025. Implementado sistema de grid responsivo adaptativo: 1 coluna (mobile) → 2 colunas (tablet) → 4 colunas (desktop) para melhor aproveitamento do espaço
- July 12, 2025. Ajustados tamanhos de fonte, padding e ícones para escalabilidade entre dispositivos (text-xs → text-sm → text-base, h-3 → h-4 → h-5)
- July 12, 2025. Otimização completa do modal de gerenciamento de atividades com largura 95% viewport, layouts responsivos e botões adaptativos
- July 12, 2025. Melhorada navegação por abas com distribuição flex-1 e textos adaptativos para diferentes tamanhos de tela
- July 12, 2025. Tradução completa de todas as mensagens de erro em inglês para português brasileiro (Failed to fetch → Falha ao buscar)
- July 12, 2025. Atualizado HTML principal com lang="pt-BR", título "PartiuTrip" e meta description em português para SEO
- July 12, 2025. Verificação e confirmação de que todos os botões "Cancel" e "Save" já estão traduzidos para "Cancelar" e "Salvar"
- July 12, 2025. Aplicado gradiente vermelho no botão "Desistir da Viagem" para aderir ao padrão visual do site (from-red-500 to-red-600 com hover from-red-600 to-red-700)
- 12 de julho de 2025. Migração completa do Replit Agent para ambiente Replit padrão
- 12 de julho de 2025. Documentação traduzida para português brasileiro e nome do projeto alterado para PartiuTrip
- 12 de julho de 2025. Verificação de segurança e boas práticas implementadas na migração
- 13 de julho de 2025. Migração bem-sucedida do Replit Agent para ambiente Replit padrão - todas as dependências instaladas, servidor funcionando, autenticação configurada
- 13 de julho de 2025. Reduzida altura da imagem cover na página de detalhes da viagem em 40% (h-96 → h-56) para melhor proporção visual
- 13 de julho de 2025. Redesign completo dos cards de estatísticas da viagem (TripStatistics) com visual moderno e clean: ícones em gradiente, efeitos hover, melhor hierarquia visual e animações sutis
- 13 de julho de 2025. Separação do orçamento base e custos de atividades - orçamento base agora exclui atividades, custos de atividades calculados separadamente das atividades planejadas
- 13 de julho de 2025. Expansão do sistema de categorias de despesas com 16 categorias detalhadas: transporte, hospedagem, alimentação, entretenimento, saúde, comunicação, gorjetas, lembranças, estacionamento, combustível, pedágios, emergências, outros
- 13 de julho de 2025. Atualização dos dados de teste para refletir a nova estrutura orçamentária - removidas atividades do orçamento base em todas as viagens de teste
- 13 de julho de 2025. Reestruturação completa das categorias de orçamento - "atividades" excluída do orçamento base, categorias relacionadas agrupadas (combustível, estacionamento, pedágios em "transporte"), sistema simplificado com 6 categorias principais
- 13 de julho de 2025. Implementação do editor de orçamento com modal interativo - criadores de viagem podem editar orçamento total ou detalhado por categoria, validação automática e cálculo por pessoa
- 13 de julho de 2025. Separação clara entre categorias de orçamento base (6 categorias) e categorias de despesas compartilhadas (16+ categorias) para maior flexibilidade e organização
- 13 de julho de 2025. Migração completa do Replit Agent para ambiente Replit padrão bem-sucedida - todos os componentes funcionando corretamente, autenticação configurada, dados de teste carregados
- 13 de julho de 2025. Simplificação da categoria de transporte no orçamento - alterada de "Transporte (Passagens, Combustível, Pedágios, Estacionamento)" para apenas "Transporte" para melhor usabilidade
- 13 de julho de 2025. Unificação das categorias de despesas com as categorias de orçamento - sistema de gestão e divisão de despesas agora usa as mesmas 6 categorias do orçamento (transport, accommodation, food, activities, insurance, medical, other) garantindo consistência
- 13 de julho de 2025. Correção do sistema de atualização de saldos - implementados cabeçalhos de cache HTTP para prevenir cache do navegador, adicionada atualização automática a cada 5 segundos, botão de atualização manual e logging detalhado para garantir dados em tempo real
- 13 de julho de 2025. Correção crítica na exibição de saldos - problema resolvido onde a função calculateSettlements estava modificando os valores originais dos saldos, causando exibição incorreta de R$ 0,00. Implementada clonagem de dados para preservar valores originais e garantir formatação correta dos saldos (positivos/negativos)
- 13 de julho de 2025. Migração completa e bem-sucedida do Replit Agent para ambiente Replit padrão - todas as funcionalidades preservadas, autenticação configurada, dados de teste funcionando
- 13 de julho de 2025. Redesign completo dos cards de viagem do dashboard com visual moderno: imagens cover com overlay, badges de status coloridos, barra de progresso de participantes, botões com gradientes, hover effects e melhor hierarquia visual
- 13 de julho de 2025. Implementação de skeleton loading melhorado para cards de viagem com gradientes e estrutura visual consistente
- 13 de julho de 2025. Adicionado cálculo automático de custo por pessoa nos cards de viagem e melhorias no estado vazio com call-to-actions mais atraentes
- 13 de julho de 2025. Corrigido sistema de geração automática de imagens de destino - substituída imagem quebrada das pirâmides por uma funcional, implementada busca inteligente que reconhece "Egito" em português e gera automaticamente imagem das pirâmides
- 13 de julho de 2025. Implementado sistema de busca normalizada para destinos icônicos - sistema agora detecta automaticamente "Egito", "Cairo", "Egypt" e aplica imagem realista das pirâmides do Egito (photo-1600298881974-6be191ceeda1)
- 13 de julho de 2025. Adicionados logs detalhados para depuração do sistema de imagens automáticas - sistema mostra no console qual imagem foi selecionada e por que critério (match exato, parcial, fallback)
- 13 de julho de 2025. Expansão massiva do sistema de imagens de destinos turísticos - adicionados 80+ destinos internacionais organizados como agência de turismo: Europa (Paris=Torre Eiffel, Roma=Coliseu, Londres=Big Ben), Ásia (Tokyo=Shibuya, Dubai=Burj Khalifa), Américas (NY=Estátua da Liberdade, Rio=Cristo Redentor), África (Cairo=Pirâmides, Marrakech=Medina), Oceania (Sydney=Opera House)
- 13 de julho de 2025. Implementação de sistema inteligente de correspondência de destinos - reconhece nomes em português, inglês e variações (Paris/Torre Eiffel, Roma/Coliseu, Tokyo/Tóquio/Japan/Japão) com imagens icônicas de marcos turísticos específicos
- 13 de julho de 2025. Criação de biblioteca abrangente de imagens de cruzeiros - 15+ destinos marítimos (Mediterrâneo, Caribe, Fjords Noruegueses, Alasca, Costa Brasileira) todos usando imagem padronizada de navio de cruzeiro brasileiro
- 13 de julho de 2025. Atualização do esquema de destinos em shared/schema.ts com categorização por continente e tipo de experiência turística - estrutura organizada para facilitar busca e descoberta de destinos
- 13 de julho de 2025. Migração final e bem-sucedida do Replit Agent para ambiente Replit padrão - todas as funcionalidades preservadas, autenticação híbrida funcionando, dados de teste carregados, servidor Express rodando corretamente na porta 5000
- 13 de julho de 2025. Atualização completa da identidade visual - mudança de marca de "ViajaJunto" para "PartiuTrip" em toda a aplicação, modernização da seção de funcionalidades com design glassmorphism, cards com gradientes animados, efeitos hover aprimorados e links do rodapé corrigidos para páginas existentes (/search, /create-trip, /dashboard, /profile, /auth)
- 13 de julho de 2025. Refinamento da identidade visual - slogan principal alterado para "Viaje Junto, Gaste Menos", marca consolidada como "PartiuTrip" no rodapé e seções de funcionalidades, copyright atualizado para "PartiuTrip"
- 13 de julho de 2025. Correção de problema de interatividade no rodapé - adicionado z-index apropriado (z-50) ao footer, z-index relativo (z-10) aos links para garantir que sejam clicáveis, reduzido z-index do cursor animado para z-40 para evitar sobreposição
- 13 de julho de 2025. Modernização dos botões de ação principais no dashboard - implementada seção "Ações Rápidas" com botões em gradiente para Nova Viagem, Buscar Viagens, Editar Perfil e Meu Progresso, melhorada UX com botões organizados e acessíveis em diferentes pontos do dashboard
- 13 de julho de 2025. Aprimoramento da UX dos botões de ação na seção de perfil do usuário - reorganizado layout em grid responsivo (2 colunas mobile, 4 desktop), botões com altura fixa (h-12), gradientes únicos por função, hover effects com escala e sombra, tipografia melhorada
- 13 de julho de 2025. Implementação de sistema de notificações inteligente - botão de notificações com popover interativo, badge de contador dinâmico, listagem de viagens próximas e solicitações pendentes, interface clean com scroll e estado vazio, cálculo automático de dias restantes para viagens
- 13 de julho de 2025. Modernização dos cards de viagem na página inicial - implementado design visual igual aos cards do dashboard com TripCard component, gradientes de fundo, animações Framer Motion e melhor hierarquia visual
- 13 de julho de 2025. Redesign dos botões de ação nos cards de viagem - aplicado visual moderno com gradientes azul/indigo, efeitos hover com escala, sombras coloridas, ícones informativos e UX aprimorada com animações
- 13 de julho de 2025. Atualização dos cards de viagens recentes na home page - agora utilizam o mesmo design moderno dos TripCard do dashboard com glassmorphism, animações Framer Motion, gradientes e layout responsivo
- 13 de julho de 2025. Implementação completa da página de perfil com design moderno e UX excelente - edição de dados pessoais, estatísticas de viagem, sistema de código de indicação, lista de amigos indicados, APIs backend para perfil/estatísticas/indicações
- 13 de julho de 2025. Atualização do logo da barra superior - substituído ícone de avião + texto "ViajaJunto" pelo logo completo "PartiuTrip" com fundo transparente, altura h-10 e largura máxima 200px para melhor visualização
- 13 de julho de 2025. Atualização final do logo da navbar - implementado novo logo com fundo transparente otimizado para melhor contraste e visualização na barra superior
- 13 de julho de 2025. Redesign completo da barra superior com UX moderno - backdrop blur, gradientes nos botões, avatar com ring, logo aumentado para h-20, transições suaves, hover effects e paleta de cores azul/indigo consistente
- 13 de julho de 2025. Atualização do usuário Tom para "Tom Tubin" de "Porto Alegre, RS" e criação de sistema robusto de dados de teste com 4 usuários adicionais (carlos, ana, ricardo, julia)
- 13 de julho de 2025. Implementação de 10 viagens históricas completadas em 2025 (Pantanal, Carnaval Salvador, Mantiqueira, Maragogi, Ouro Preto, Amazônia, Florianópolis, Serra Gaúcha, Lençóis Maranhenses, Caruaru) com Tom participando de todas
- 13 de julho de 2025. Criação de 4 viagens futuras ambiciosas (Réveillon Copacabana, Patagônia Argentina, Machu Picchu, Safári Quênia) com Tom como criador ou participante
- 13 de julho de 2025. Diversificação de estilos de viagem e destinos para demonstrar todas as funcionalidades da plataforma - mix de viagens nacionais e internacionais com diferentes orçamentos e durações
- 13 de julho de 2025. Atualização do logo para nova versão com fundo transparente - substituído por versão atualizada do logo PartiuTrip (1752377252367.png) com altura h-12 (48px) e largura máxima 220px para tamanho otimizado
- 13 de julho de 2025. Migração completa do Replit Agent para ambiente Replit padrão - sistema de avaliações de usuários e destinos implementado, sistema de verificação de usuários adicionado, banco de dados atualizado com novas tabelas (userRatings, destinationRatings, verificationRequests), APIs REST completas para ratings e verificação
- 13 de julho de 2025. Correção do link do perfil na navbar - alterado de "/perfil" para "/profile" para corresponder à rota correta registrada no App.tsx
- 13 de julho de 2025. Implementação do preloader customizado com avião circulando globo terrestre - criado LoadingSpinner com variante "travel" inspirada no logo do site, incluindo globo com continentes, dois aviões circulando em direções opostas, linhas orbitais animadas e texto personalizado "Preparando sua viagem"
- 13 de julho de 2025. Atualização das páginas dashboard e busca para usar o novo preloader de viagem - substituído skeleton loading por preloader centralizado com animação de globo e avião
- 13 de julho de 2025. Criação de página de demonstração do preloader (/preloader-demo) com teste interativo das variantes simple e travel do LoadingSpinner
- 13 de julho de 2025. Correção do preloader conforme feedback do usuário - avião alterado para cor dourada/ouro (#FFD700) circulando no sentido horário, globo terrestre mantido em azul com continentes verdes, removido segundo avião para simplificar animação
- 13 de julho de 2025. Integração do preloader Lottie personalizado - substituído preloader CSS/SVG por animação Lottie profissional fornecida pelo usuário, componente LoadingSpinner atualizado para usar lottie-react, melhor qualidade visual e performance
- 13 de julho de 2025. Implementação universal do preloader de viagem - aplicado o preloader Lottie com variante "travel" em todas as páginas (dashboard, busca, perfil, detalhes da viagem, chat, criação de viagem), adicionadas mensagens contextuais ("Carregando suas viagens...", "Buscando viagens incríveis...", etc.), overlay de loading na página de criação com backdrop blur
- 13 de julho de 2025. Melhorias massivas de UX nos cards de orçamento da página de detalhes da viagem - redesign completo com gradientes suaves, bordas arredondadas xl, spacing otimizado, efeitos hover com sombras dinâmicas, cores harmoniosas (azul para orçamento base, roxo para atividades, verde esmeralda para total), transições smooth de 300ms, melhor hierarquia visual e responsividade aprimorada
- 13 de julho de 2025. Redesign profissional e minimalista do resumo financeiro - substituído design colorido por interface limpa com tons de cinza, tipografia tabular-nums para alinhamento perfeito de números, separadores sutis, card de custo individual destacado em azul suave, progresso das despesas com indicadores visuais claros, header com fundo cinza claro e bordas refinadas, design corporativo moderno seguindo padrões de aplicações financeiras
- 13 de julho de 2025. Redesign completo da página de detalhes da viagem com visual profissional e moderno - removidos gradientes excessivos e backdrop blur, simplificado fundo para cinza neutro (bg-gray-50), header clean com imagem de capa reduzida, informações organizadas hierarquicamente, navegação por abas simplificada com design minimalista, cards uniformes com sombras sutis (shadow-sm), botões padronizados sem gradientes coloridos, layout mais limpo e profissional seguindo padrões de design corporativo
- 13 de julho de 2025. Otimização dos cards de estatísticas da viagem - redesign compacto em uma linha com padding reduzido (p-3), ícones menores (h-3.5), layout grid-cols-4 gap-3, visual clean e minimalista mantendo funcionalidade completa
- 13 de julho de 2025. Implementação de countdown timer dinâmico com gradientes que mudam conforme dias restantes: vermelho intenso (≤7 dias urgente), laranja/amarelo (≤30 dias próximo), verde/azul (≤90 dias médio prazo), azul/roxo (>90 dias planejamento), transições suaves duration-1000 e acentos de texto harmonizados
- 13 de julho de 2025. Otimização responsiva dos cards de estatísticas - implementado layout adaptativo grid-cols-2 sm:grid-cols-4, padding responsivo p-3 sm:p-4, ícones h-4 w-4, texto base sm:text-lg, gaps 3 sm:gap-4, w-full para aproveitamento completo do espaço da página
- 13 de julho de 2025. Ajuste dos botões de ação nos cards de viagem - reduzidos para tamanho compacto (size="sm", h-8), texto text-xs, ícones w-3 h-3, padding reduzido (mt-4 pt-3), gap-2, mantendo funcionalidade completa com visual clean e otimizado para espaço dos cards