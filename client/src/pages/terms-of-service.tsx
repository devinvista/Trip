import { ArrowLeft, Scale, Users, CreditCard, Shield, AlertTriangle, Mail, FileText } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <div className="flex items-center space-x-3">
            <Scale className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Termos de Uso
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Última atualização: 14 de julho de 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-8">
            {/* Aceitação */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Ao acessar ou utilizar a plataforma PartiuTrip ("Plataforma"), você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar, não utilize nossos serviços.
              </p>
            </section>

            {/* Elegibilidade */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                2. Elegibilidade
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Você deve:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Ter pelo menos 18 anos</li>
                <li>Ser pessoa física</li>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Ser responsável pela segurança de sua conta</li>
              </ul>
            </section>

            {/* Natureza da Plataforma */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                3. Natureza da Plataforma
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O PartiuTrip é uma plataforma de conexão entre viajantes para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                <li>Planejamento colaborativo de viagens</li>
                <li>Compartilhamento de custos e despesas</li>
                <li>Interação entre usuários com interesses similares</li>
              </ul>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Não somos uma agência de viagens nem responsáveis por acordos entre usuários
                </p>
              </div>
            </section>

            {/* Responsabilidades */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                4. Responsabilidades do Usuário
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    a) Compartilhamento de Custos:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Todas as transações financeiras são de responsabilidade exclusiva dos usuários</li>
                    <li>A plataforma apenas fornece ferramentas de cálculo, sem intermediar pagamentos</li>
                    <li>Recomendamos acordos por escrito entre participantes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    b) Conduta em Viagens:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Agir com respeito e segurança durante as viagens</li>
                    <li>Cumprir leis locais e regulamentos de viagem</li>
                    <li>Não discriminar com base em raça, gênero, religião ou orientação sexual</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    c) Conteúdo Gerado:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Garantir que fotos/informações compartilhadas não violam direitos de terceiros</li>
                    <li>Não publicar conteúdo ilegal, ofensivo ou comercial não autorizado</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sistema Financeiro */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                5. Sistema Financeiro
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    a) Ferramentas de Cálculo:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>As funcionalidades de divisão de despesas são sugestões matemáticas</li>
                    <li>Não validamos transações nem armazenamos dados financeiros sensíveis</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    b) Comprovantes:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Recibos compartilhados permanecem propriedade dos usuários</li>
                    <li>Excluímos automaticamente documentos após 180 dias</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacidade */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                6. Privacidade e Dados
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    a) Coletamos:
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Dados de perfil e preferências de viagem</li>
                    <li>Informações sobre planos de viagem</li>
                    <li>Registros de interações na plataforma</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    b) Compartilhamos:
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Informações básicas com potenciais companheiros de viagem</li>
                    <li>Dados agregados/anônimos para estatísticas</li>
                    <li>Nunca vendemos dados pessoais a terceiros</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Segurança */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                9. Segurança
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Autenticação</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Dois fatores opcional disponível
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Criptografia</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Dados em trânsito e repouso
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Monitoramento</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Contínuo de segurança
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sessões</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Automáticas após 30 minutos
                  </p>
                </div>
              </div>
            </section>

            {/* Isenções */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                11. Isenções de Responsabilidade
              </h2>
              
              <div className="p-6 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <p className="text-orange-800 dark:text-orange-200 mb-4 font-medium">
                  O PartiuTrip:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-orange-800 dark:text-orange-200">
                  <li>Não valida identidade dos usuários (verificação opcional disponível)</li>
                  <li>Não garante segurança em encontros presenciais</li>
                  <li>Não se responsabiliza por perdas financeiras entre usuários</li>
                  <li>Não endossa conteúdo gerado por usuários</li>
                </ul>
              </div>
            </section>

            {/* Lei Aplicável */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-blue-600" />
                14. Lei Aplicável
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas no foro de Porto Alegre, RS.
              </p>
            </section>

            {/* Contato */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                15. Contato
              </h2>
              
              <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 mb-2">
                  Dúvidas ou reclamações:
                </p>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Email: juridico@partiutrip.com
                </p>
              </div>
            </section>

            {/* Recomendações de Segurança */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-600" />
                Recomendações de Segurança
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Encontros Presenciais:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Sempre encontre-se inicialmente em locais públicos</li>
                    <li>• Informe amigos/família sobre seus planos</li>
                    <li>• Confira documentos de identificação</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Transações Financeiras:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Use plataformas de pagamento rastreáveis</li>
                    <li>• Guarde comprovantes digitais</li>
                    <li>• Estabeleça limites claros de responsabilidade</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Proteção de Dados:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Não compartilhe documentos completos na plataforma</li>
                    <li>• Use senhas complexas e únicas</li>
                    <li>• Revise periodicamente suas permissões</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Denúncias:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Reporte comportamentos suspeitos imediatamente</li>
                    <li>• Bloqueie usuários que violem suas normas pessoais</li>
                    <li>• Colabore com investigações quando solicitado</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}