import { Link } from "wouter";
import { ChevronLeft, Shield, Users, CreditCard, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
          <p className="text-gray-600 mt-2">Última atualização: 14 de julho de 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">1. Aceitação dos Termos</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Ao acessar ou utilizar a plataforma PartiuTrip ("Plataforma"), você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar, não utilize nossos serviços.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">2. Elegibilidade</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">Você deve:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Ter pelo menos 18 anos</li>
              <li>Ser pessoa física</li>
              <li>Fornecer informações precisas e atualizadas</li>
              <li>Ser responsável pela segurança de sua conta</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">3. Natureza da Plataforma</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">O PartiuTrip é uma plataforma de conexão entre viajantes para:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Planejamento colaborativo de viagens</li>
              <li>Compartilhamento de custos e despesas</li>
              <li>Interação entre usuários com interesses similares</li>
              <li>Não somos uma agência de viagens nem responsáveis por acordos entre usuários</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilidades do Usuário</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Você concorda em:</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">a) Compartilhamento de Custos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Todas as transações financeiras são de responsabilidade exclusiva dos usuários</li>
                  <li>A plataforma apenas fornece ferramentas de cálculo, sem intermediar pagamentos</li>
                  <li>Recomendamos acordos por escrito entre participantes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">b) Conduta em Viagens:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Agir com respeito e segurança durante as viagens</li>
                  <li>Cumprir leis locais e regulamentos de viagem</li>
                  <li>Não discriminar com base em raça, gênero, religião ou orientação sexual</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">c) Conteúdo Gerado:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Garantir que fotos/informações compartilhadas não violam direitos de terceiros</li>
                  <li>Não publicar conteúdo ilegal, ofensivo ou comercial não autorizado</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">5. Sistema Financeiro</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">a) Ferramentas de Cálculo:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>As funcionalidades de divisão de despesas são sugestões matemáticas</li>
                  <li>Não validamos transações nem armazenamos dados financeiros sensíveis</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">b) Comprovantes:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Recibos compartilhados permanecem propriedade dos usuários</li>
                  <li>Excluímos automaticamente documentos após 180 dias</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacidade e Dados</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">a) Coletamos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Dados de perfil e preferências de viagem</li>
                  <li>Informações sobre planos de viagem</li>
                  <li>Registros de interações na plataforma</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">b) Compartilhamos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Informações básicas com potenciais companheiros de viagem</li>
                  <li>Dados agregados/anônimos para estatísticas</li>
                  <li>Nunca vendemos dados pessoais a terceiros</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">7. Comunicações</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">a) Entre Usuários:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Mensagens são moderadas proativamente</li>
                  <li>Reservamo-nos o direito de remover conteúdo inadequado</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">b) Da Plataforma:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Enviaremos comunicações sobre suas viagens e atualizações importantes</li>
                  <li>Você pode gerir preferências de notificação</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Additional sections - condensed for brevity */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Propriedade Intelectual</h2>
            <div className="space-y-3">
              <p className="text-gray-700"><strong>Conteúdo do Usuário:</strong> Você mantém os direitos sobre seu conteúdo e concede licença não exclusiva para exibição na plataforma.</p>
              <p className="text-gray-700"><strong>Plataforma:</strong> Todo código, design e tecnologia são propriedade do PartiuTrip. É proibida a reprodução não autorizada.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Segurança</h2>
            <p className="text-gray-700 mb-3">Implementamos:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Autenticação de dois fatores opcional</li>
              <li>Criptografia de dados em trânsito e repouso</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Sessões automáticas após 30 minutos de inatividade</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">10. Isenções de Responsabilidade</h2>
            </div>
            <p className="text-gray-700 mb-3">O PartiuTrip:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Não valida identidade dos usuários (verificação opcional disponível)</li>
              <li>Não garante segurança em encontros presenciais</li>
              <li>Não se responsabiliza por perdas financeiras entre usuários</li>
              <li>Não endossa conteúdo gerado por usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Lei Aplicável</h2>
            <p className="text-gray-700">
              Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas no foro de Porto Alegre-RS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700">
              Dúvidas ou reclamações:<br />
              Email: <a href="mailto:juridico@partiutrip.com" className="text-blue-600 hover:underline">juridico@partiutrip.com</a>
            </p>
          </section>

          {/* Safety recommendations */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recomendações de Segurança</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Encontros Presenciais:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Sempre encontre-se inicialmente em locais públicos</li>
                  <li>Informe amigos/família sobre seus planos</li>
                  <li>Confira documentos de identificação</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Transações Financeiras:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Use plataformas de pagamento rastreáveis</li>
                  <li>Guarde comprovantes digitais</li>
                  <li>Estabeleça limites claros de responsabilidade</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Proteção de Dados:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Não compartilhe documentos completos na plataforma</li>
                  <li>Use senhas complexas e únicas</li>
                  <li>Revise periodicamente suas permissões</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}