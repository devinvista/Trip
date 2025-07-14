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
- **Banco de Dados**: MySQL com Drizzle ORM

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
- 13 de julho de 2025. Migração completa do modelo de dados de PostgreSQL para MySQL - todos os schemas migrados para mysqlTable, tipos atualizados (serial→int autoincrement, text→varchar, jsonb→json, numeric→decimal), servidor funcionando corretamente no ambiente Replit padrão
- 13 de julho de 2025. Migração completa do Replit Agent para ambiente Replit padrão concluída - efeito do cursor que seguia o mouse removido da homepage, novo SVG do globo terrestre com avião dourado criado inspirado no logo PartiuTrip, todas as dependências instaladas e funcionando corretamente
- 13 de julho de 2025. Atualização completa da identidade visual - mudança de marca de "ViajaJunto" para "PartiuTrip" em toda a aplicação, modernização da seção de funcionalidades com design glassmorphism, cards com gradientes animados, efeitos hover aprimorados e links do rodapé corrigidos para páginas existentes (/search, /create-trip, /dashboard, /profile, /auth)
- 13 de julho de 2025. Redesign completo do globo interativo inspirado no preloader - criado componente CommunityLighthouseSVG com globo terrestre realista, aviões dourados orbitando, continentes em verde, anéis orbitais dourados, ícones de viagem interativos (mala, câmera, bússola, mapa) com efeitos hover, botões flutuantes com tooltips, estatísticas animadas e UX aprimorada com animações Framer Motion
- 13 de julho de 2025. Substituição completa do SVG customizado pelo preloader Lottie - implementado componente TravelAnimation usando AnimatedPreloader oficial do site, melhorada UX com botões flutuantes repositionados ao redor da animação, tooltips informativos aprimorados, badges de estatísticas animadas e integração harmoniosa com a identidade visual PartiuTrip
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
- 13 de julho de 2025. Migração final bem-sucedida do Replit Agent para ambiente Replit padrão - todas as funcionalidades preservadas, autenticação híbrida funcionando, dados de teste carregados, servidor Express rodando corretamente
- 13 de julho de 2025. Migração completa do modelo de dados de PostgreSQL para MySQL - todos os schemas migrados para mysqlTable, tipos atualizados (serial→int autoincrement, text→varchar, jsonb→json, numeric→decimal), servidor funcionando corretamente no ambiente Replit padrão
- 13 de julho de 2025. Otimização do countdown timer para melhor adequação ao tamanho reduzido da imagem de capa - componente mais compacto com padding reduzido, tamanhos de fonte ajustados e layout otimizado para espaço limitado
- 13 de julho de 2025. Correção do link do perfil na navbar - alterado de "/perfil" para "/profile" para corresponder à rota correta registrada no App.tsx
- 13 de julho de 2025. Implementação do preloader customizado com avião circulando globo terrestre - criado LoadingSpinner com variante "travel" inspirada no logo do site, incluindo globo com continentes, dois aviões circulando em direções opostas, linhas orbitais animadas e texto personalizado "Preparando sua viagem"
- 13 de julho de 2025. Atualização das páginas dashboard e busca para usar o novo preloader de viagem - substituído skeleton loading por preloader centralizado com animação de globo e avião
- 13 de julho de 2025. Criação de página de demonstração do preloader (/preloader-demo) com teste interativo das variantes simple e travel do LoadingSpinner
- 13 de julho de 2025. Correção do preloader conforme feedback do usuário - avião alterado para cor dourada/ouro (#FFD700) circulando no sentido horário, globo terrestre mantido em azul com continentes verdes, removido segundo avião para simplificar animação
- 13 de julho de 2025. Integração do preloader Lottie personalizado - substituído preloader CSS/SVG por animação Lottie profissional fornecida pelo usuário, componente LoadingSpinner atualizado para usar lottie-react, melhor qualidade visual e performance
- 13 de julho de 2025. Implementação universal do preloader de viagem - aplicado o preloader Lottie com variante "travel" em todas as páginas (dashboard, busca, perfil, detalhes da viagem, chat, criação de viagem), adicionadas mensagens contextuais ("Carregando suas viagens...", "Buscando viagens incríveis...", etc.), overlay de loading na página de criação com backdrop blur
- 13 de julho de 2025. Otimização completa do dashboard com design moderno e profissional - cards de estatísticas redesenhados com paleta limpa (slate/azul), efeitos hover suaves (-translate-y-1), ícones coloridos em fundos suaves, tipografia legível (text-2xl font-bold), bordas sutis (border-slate-200/60), cards de viagem com altura reduzida (h-44), badges com backdrop-blur, botões uniformizados (bg-blue-600), espaçamentos otimizados (p-5), transições suaves (duration-300), visual clean e intuitivo seguindo princípios de UX/UI modernos
- 13 de julho de 2025. Implementação de layout responsivo otimizado para cards de estatísticas - grid responsivo (grid-cols-2 lg:grid-cols-4) mantendo cards em linha horizontal, padding adaptativo (p-3 sm:p-4 lg:p-5), tipografia escalonada (text-xl sm:text-2xl), gaps responsivos (gap-3 sm:gap-4 lg:gap-6), otimização para dispositivos móveis, tablets e desktop mantendo hierarquia visual consistente
- 13 de julho de 2025. Redesign completo da seção de filtros com UX/UI moderna e profissional - header informativo com ícone e descrição, botões de filtro estilizados com emojis temáticos (🗂️ Todas, 🚀 Próximas, ✈️ Em Andamento, ✅ Concluídas), cores diferenciadas por categoria (slate, emerald, blue, violet), contador de resultados em tempo real, efeitos hover com scale e sombras coloridas, indicador visual de filtro ativo, layout responsivo com contador mobile, backdrop blur e glassmorphism effects
- 13 de julho de 2025. Melhorias massivas de UX nos cards de orçamento da página de detalhes da viagem - redesign completo com gradientes suaves, bordas arredondadas xl, spacing otimizado, efeitos hover com sombras dinâmicas, cores harmoniosas (azul para orçamento base, roxo para atividades, verde esmeralda para total), transições smooth de 300ms, melhor hierarquia visual e responsividade aprimorada
- 13 de julho de 2025. Redesign profissional e minimalista do resumo financeiro - substituído design colorido por interface limpa com tons de cinza, tipografia tabular-nums para alinhamento perfeito de números, separadores sutis, card de custo individual destacado em azul suave, progresso das despesas com indicadores visuais claros, header com fundo cinza claro e bordas refinadas, design corporativo moderno seguindo padrões de aplicações financeiras
- 13 de julho de 2025. Redesign completo da página de detalhes da viagem com visual profissional e moderno - removidos gradientes excessivos e backdrop blur, simplificado fundo para cinza neutro (bg-gray-50), header clean com imagem de capa reduzida, informações organizadas hierarquicamente, navegação por abas simplificada com design minimalista, cards uniformes com sombras sutis (shadow-sm), botões padronizados sem gradientes coloridos, layout mais limpo e profissional seguindo padrões de design corporativo
- 13 de julho de 2025. Otimização dos cards de estatísticas da viagem - redesign compacto em uma linha com padding reduzido (p-3), ícones menores (h-3.5), layout grid-cols-4 gap-3, visual clean e minimalista mantendo funcionalidade completa
- 13 de julho de 2025. Implementação de countdown timer dinâmico com gradientes que mudam conforme dias restantes: vermelho intenso (≤7 dias urgente), laranja/amarelo (≤30 dias próximo), verde/azul (≤90 dias médio prazo), azul/roxo (>90 dias planejamento), transições suaves duration-1000 e acentos de texto harmonizados
- 13 de julho de 2025. Otimização responsiva dos cards de estatísticas - implementado layout adaptativo grid-cols-2 sm:grid-cols-4, padding responsivo p-3 sm:p-4, ícones h-4 w-4, texto base sm:text-lg, gaps 3 sm:gap-4, w-full para aproveitamento completo do espaço da página
- 13 de julho de 2025. Ajuste dos botões de ação nos cards de viagem - reduzidos para tamanho compacto (size="sm", h-8), texto text-xs, ícones w-3 h-3, padding reduzido (mt-4 pt-3), gap-2, mantendo funcionalidade completa com visual clean e otimizado para espaço dos cards
- 13 de julho de 2025. Ajuste do degradê das estatísticas na página de busca - substituídas cores variadas (amarelo, roxo, verde) por tons harmoniosos de azul (blue-200, blue-300, blue-400, cyan-300) criando paleta visual coesa e moderna
- 13 de julho de 2025. Implementação de filtro temporal na página de busca - sistema agora exibe apenas viagens futuras ou em andamento, ocultando automaticamente viagens concluídas (tripEndDate < currentDate) para melhor relevância e experiência do usuário
- 13 de julho de 2025. Redesign completo do hero section da página de busca - substituído design complexo com gradientes e lighthouse por visual moderno, clean e profissional: fundo branco, tipografia limpa, badge informativo azul, estatísticas simplificadas, melhor hierarquia visual e UX aprimorada seguindo padrões de design corporativo
- 13 de julho de 2025. Implementação de galeria de destinos no hero section - adicionadas imagens de fundo sutis (opacity-5) com destinos icônicos, galeria circular de preview com destinos (Paris, Rio, Tokyo, Nova York, Maldivas), contador "+80" indicando variedade de destinos, melhor apelo visual mantendo design clean e profissional
- 13 de julho de 2025. Refinamento da galeria de destinos - substituídas imagens internacionais por destinos brasileiros icônicos (Rio de Janeiro, Fernando de Noronha, Chapada Diamantina, Pantanal, Bonito), removidas estatísticas do hero section para foco no conteúdo essencial, visual mais limpo e centrado na experiência de busca
- 13 de julho de 2025. Inclusão das Pirâmides de Gizé na galeria de destinos - adicionada imagem icônica das pirâmides no fundo e preview circular, texto atualizado para incluir "Pirâmides de Gizé" junto com destinos brasileiros, criando mix atrativo de destinos nacionais e internacionais
- 13 de julho de 2025. Implementação completa do sistema de atividades inspirado no TripAdvisor - adicionadas páginas /activities e /activities/:id com design responsivo, sistema de avaliações com estrelas, filtros avançados, 8 atividades de exemplo (catamaran, trilha, tour gastronômico, rafting, etc.), APIs REST completas para atividades/avaliações/reservas, integração no menu de navegação e opções da página de busca
- 13 de julho de 2025. Redesign completo da navbar com design profissional e moderno - removidos elementos excessivos, implementado layout responsivo simplificado, menus dropdown otimizados, navegação mobile aprimorada com melhor organização, backdrop blur e gradientes sutis
- 13 de julho de 2025. Modernização dos filtros do dashboard com visual limpo e minimalista - substituído design complexo com gradientes coloridos por interface simples tipo tabs, fundo cinza claro (bg-slate-100), contador de resultados integrado, melhor usabilidade mobile com overflow-x-auto
- 13 de julho de 2025. Aprimoramento dos filtros com cores nos números em destaque e responsividade otimizada - adicionadas cores diferenciadas por categoria (azul, verde esmeralda, laranja, cinza), implementado padding responsivo (px-2 sm:px-3), tamanhos de fonte adaptativos (text-xs sm:text-sm), badges coloridos para contadores com truncate para textos longos em dispositivos móveis
- 13 de julho de 2025. Correção de elementos flutuantes na página inicial - adicionados z-index apropriados (z-20 para elementos, z-30 para tooltips) para evitar sobreposição com a navbar e outros elementos da interface
- 13 de julho de 2025. Otimização completa dos botões de ação nos cards de viagem - redesign responsivo com layout em colunas para mobile, botões de tamanho adaptativo (text-xs, h-3 w-3), grid system para melhor aproveitamento do espaço, separação lógica entre ações primárias e secundárias, UX otimizada para diferentes papéis de usuário (criador vs participante)
- 13 de julho de 2025. Modernização completa dos botões da navbar com design profissional e UX/UI excelente - botões de guest navigation com efeitos shimmer, glow, gradientes avançados, escalabilidade hover (scale-105), ícone de seta animado, backdrop blur, bordas dinâmicas e transições suaves de 300-700ms; botões mobile com glow effects, shimmer animations, bordas coloridas e micro-interações refinadas
- 13 de julho de 2025. Migração completa e bem-sucedida de PostgreSQL para MySQL - banco de dados migrado para servidor MySQL em srv1661.hstgr.io, todos os schemas atualizados para mysqlTable, conexão estabelecida com sucesso, dados de teste carregados, aplicação funcionando corretamente
- 13 de julho de 2025. Atualização completa da documentação para refletir migração MySQL - replit.md atualizado com arquitetura backend, dependências, configuração de ambiente, criado arquivo MYSQL_MIGRATION.md com documentação detalhada da migração, todos os comentários de código atualizados para MySQL
- 14 de julho de 2025. Otimização massiva do layout dos cards na página de detalhes da viagem para maximizar espaço do chat - mudança do grid de 3 para 4 colunas (main content ocupa 3 colunas, sidebar 1 coluna), redução da altura da imagem de capa (h-48→h-32, h-56→h-40), compactação de espaçamentos (p-6→p-4, gap-6→gap-4, space-y-6→space-y-4), redução de padding nos cards do orçamento (p-6→p-4, py-3→py-2), diminuição de fontes (text-base→text-sm, text-2xl→text-lg), otimização dos botões de ação (w-40→w-32, gap-3→gap-2), compactação geral do header (mb-8→mb-4, space-y-4→space-y-3), resultando em muito mais espaço vertical e horizontal disponível para o chat
- 14 de julho de 2025. Migração completa e bem-sucedida do Replit Agent para ambiente Replit padrão - todas as funcionalidades preservadas, servidor Express funcionando corretamente, autenticação híbrida operacional, dados de teste carregados com sucesso, aplicação PartiuTrip rodando sem erros na porta 5000
- 14 de julho de 2025. Campo telefone tornado obrigatório para usuários - adicionado campo phone no schema de usuários MySQL, formulário de cadastro atualizado com validação (min 10, max 20 caracteres), página de perfil com campo telefone editável, dados de teste atualizados com números de telefone para todos os usuários (Tom, Maria, Carlos, Ana, Ricardo, Julia), tipos TypeScript atualizados para incluir campo phone obrigatório
- 14 de julho de 2025. Implementada formatação automática de telefone (xx) xxxxx-xxxx - função formatPhoneNumber aplicada nos campos de telefone das páginas de cadastro e perfil, formatação automática durante digitação mantendo apenas números, limitado a 11 dígitos, experiência de usuário otimizada com formatação visual em tempo real
- 14 de julho de 2025. Sistema de login com múltiplos identificadores implementado - usuários podem agora fazer login com username, email ou telefone (com ou sem formatação), backend atualizado com método getUserByPhone, estratégia de autenticação Passport.js modificada para aceitar campo 'identifier', sistema de busca inteligente que remove formatação do telefone para comparação, interface de login atualizada para "Usuário, Email ou Telefone"
- 14 de julho de 2025. Migração completa e definitiva do Replit Agent para ambiente Replit padrão - todas as funcionalidades preservadas, servidor Express rodando corretamente na porta 5000, conexão MySQL estabelecida, sistema de autenticação funcionando, dados de teste carregados, aplicação PartiuTrip totalmente operacional
- 14 de julho de 2025. Redesign completo da página de perfil com interface moderna e profissional - implementado header dinâmico com banner gradiente, avatar interativo com medalhas de nível, navegação por abas com 5 seções (Estatísticas, PartiuAmigos, Conexões, Conquistas, Configurações), sistema de gamificação com níveis de viajante (Iniciante, Aventureiro, Explorador, Embaixador), programa de indicações PartiuAmigos com compartilhamento WhatsApp/Email, sistema de conquistas baseado em viagens completadas, cards de estatísticas animados com Motion, integração completa com paleta de cores institucional (#1B2B49, #41B6FF, #FFA500, #AAB0B7, #F5F9FC), backdrop blur effects, formulário de edição de perfil com validação em tempo real, sistema de progresso do viajante com barras de progresso, seção de conexões de viagem, pontuação XP gamificada, e design responsivo otimizado para todos os dispositivos
- 14 de julho de 2025. Implementação completa do sistema de código de indicação obrigatório - formato atualizado para PARTIU-{USUARIO}{ID} (ex: PARTIU-TOM01), campo obrigatório adicionado ao formulário de cadastro com validação em tempo real, endpoint /api/user/validate-referral criado para validação backend, sistema de autenticação atualizado para aceitar campo referredBy, interface de cadastro modernizada com campo código de indicação usando ícone Gift, validação de formato regex implementada, integração completa entre frontend e backend para processo de cadastro com código obrigatório
- 14 de julho de 2025. Migração final e definitiva do Replit Agent para ambiente Replit padrão concluída com sucesso - todas as funcionalidades preservadas, servidor Express rodando corretamente na porta 5000, conexão MySQL estabelecida, sistema de autenticação híbrida funcionando perfeitamente, dados de teste carregados, aplicação PartiuTrip totalmente operacional e pronta para uso
- 14 de julho de 2025. Migração final e definitiva do Replit Agent para ambiente Replit padrão concluída com sucesso - todas as funcionalidades da aplicação PartiuTrip preservadas e operacionais, servidor Express rodando estável na porta 5000, conexão MySQL estabelecida e funcionando, sistema de autenticação híbrida operacional, dados de teste carregados, aplicação totalmente funcional e pronta para uso