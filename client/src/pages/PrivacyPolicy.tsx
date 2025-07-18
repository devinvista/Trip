import { Link } from "wouter";
import { ChevronLeft, Shield, Database, Eye, Clock, Cookie, UserCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-gray-600 mt-2">Última atualização: 14 de julho de 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">1. Introdução</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A PartiuTrip ("nós", "nosso") valoriza sua privacidade. Esta Política explica como coletamos, usamos, compartilhamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Ao usar nossa plataforma, você concorda com estas práticas.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">2. Dados Coletados</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">a) Dados fornecidos por você:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Identificação:</strong> Nome, e-mail, telefone, foto de perfil</li>
                  <li><strong>Preferências de viagem:</strong> Estilo (praia, aventura, etc.), destinos de interesse, orçamento médio</li>
                  <li><strong>Conteúdo gerado:</strong> Mensagens, planos de viagem, atividades, upload de recibos</li>
                  <li><strong>Dados financeiros:</strong> Valores de despesas compartilhadas (não coletamos dados bancários ou cartões)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">b) Coletados automaticamente:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Dados técnicos:</strong> IP, tipo de navegador, dispositivo</li>
                  <li><strong>Uso da plataforma:</strong> Páginas visitadas, interações, tempo de sessão</li>
                  <li><strong>Localização aproximada:</strong> Com base no IP (para sugestões de destinos)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Processing Purposes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalidades do Tratamento</h2>
            <p className="text-gray-700 mb-4">Usamos seus dados para:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Finalidade</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Criar e gerenciar sua conta</td>
                    <td className="border border-gray-300 px-4 py-2">Execução de contrato (Art. 7º, V)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Conectar você a companheiros de viagem</td>
                    <td className="border border-gray-300 px-4 py-2">Legítimo interesse (Art. 7º, IX)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Calcular divisão de despesas</td>
                    <td className="border border-gray-300 px-4 py-2">Consentimento (Art. 7º, I)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Enviar notificações sobre viagens</td>
                    <td className="border border-gray-300 px-4 py-2">Execução de contrato</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Melhorar nossos serviços</td>
                    <td className="border border-gray-300 px-4 py-2">Legítimo interesse</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Cumprir obrigações legais</td>
                    <td className="border border-gray-300 px-4 py-2">Obrigação legal (Art. 7º, II)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">4. Compartilhamento de Dados</h2>
            </div>
            <p className="text-gray-700 mb-4">Compartilhamos informações apenas quando necessário:</p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Com outros usuários:</strong> Perfil básico (nome, foto) e mensagens para participantes da mesma viagem</li>
              <li><strong>Com prestadores de serviço:</strong> Hospedagem em nuvem (AWS Brasil), ferramentas de análise (Google Analytics anonimizado)</li>
              <li><strong>Com autoridades:</strong> Para cumprir ordens judiciais ou leis aplicáveis</li>
            </ul>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-green-800 font-semibold">Nunca vendemos seus dados pessoais.</p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">5. Segurança de Dados</h2>
            </div>
            <p className="text-gray-700 mb-3">Implementamos:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Criptografia:</strong> Dados em trânsito (HTTPS) e em repouso</li>
              <li><strong>Acesso restrito:</strong> Apenas pessoal autorizado</li>
              <li><strong>Monitoramento contínuo:</strong> Para detectar violações</li>
              <li><strong>Backups diários:</strong> Em servidores seguros no Brasil</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">6. Retenção de Dados</h2>
            </div>
            <p className="text-gray-700 mb-3">Mantemos seus dados:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Conta ativa:</strong> Enquanto você usar a plataforma</li>
              <li><strong>Após inatividade:</strong> 2 anos (exceto dados legais)</li>
              <li><strong>Recibos:</strong> Excluídos automaticamente após 180 dias</li>
              <li><strong>Exclusão total:</strong> Solicitação via Seção 8</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">7. Cookies e Tecnologias Similares</h2>
            </div>
            <p className="text-gray-700 mb-3">Usamos:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Cookies essenciais:</strong> Para login e funcionalidades básicas</li>
              <li><strong>Cookies analíticos:</strong> Google Analytics (dados agregados)</li>
              <li><strong>Controle:</strong> Gerencie preferências no banner de cookies ou configurações do navegador</li>
            </ul>
          </section>

          {/* LGPD Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">8. Seus Direitos LGPD</h2>
            </div>
            <p className="text-gray-700 mb-4">Você pode solicitar:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Direito</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Como exercer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Acesso aos dados</td>
                    <td className="border border-gray-300 px-4 py-2">Via portal do usuário ou e-mail</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Correção de dados</td>
                    <td className="border border-gray-300 px-4 py-2">Atualize seu perfil ou solicite</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Exclusão ("esquecimento")</td>
                    <td className="border border-gray-300 px-4 py-2">Solicite em privacidade@partiutrip.com</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Portabilidade</td>
                    <td className="border border-gray-300 px-4 py-2">Receba dados em formato legível</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Revogar consentimento</td>
                    <td className="border border-gray-300 px-4 py-2">Ajuste configurações de conta</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-gray-700 mt-4"><strong>Prazo de resposta:</strong> 15 dias úteis.</p>
          </section>

          {/* Minors */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Menores de Idade</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Idade mínima:</strong> 18 anos</li>
              <li><strong>Verificação:</strong> Solicitamos confirmação de idade no cadastro</li>
              <li><strong>Menores inadvertidos:</strong> Excluiremos dados se identificados</li>
            </ul>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Alterações nesta Política</h2>
            <p className="text-gray-700 mb-3">Notificaremos sobre mudanças:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Comunicação:</strong> E-mail ou notificação na plataforma</li>
              <li><strong>Aceitação:</strong> Uso contínuo após 30 dias implica concordância</li>
            </ul>
          </section>

          {/* DPO Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">11. Encarregado de Dados (DPO)</h2>
            </div>
            <p className="text-gray-700">
              Entre em contato para exercer seus direitos:<br />
              E-mail: <a href="mailto:dpo@partiutrip.com" className="text-blue-600 hover:underline">dpo@partiutrip.com</a>
            </p>
          </section>

          {/* Specific Measures */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Medidas Específicas do PartiuTrip</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">1. Compartilhamento de custos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Dados financeiros são exclusivamente para cálculo</li>
                  <li>Recibos compartilhados têm acesso restrito aos participantes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">2. Sistema de mensagens:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Moderamos proativamente conteúdo ofensivo</li>
                  <li>Mensagens são armazenadas por 2 anos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">3. Perfil público:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Controle de visibilidade nas configurações</li>
                  <li>Dados sensíveis (e.g., telefone) são sempre privados</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">4. Upload de documentos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Recibos são armazenados com criptografia de ponta a ponta</li>
                  <li>Metadados (localização, data) são removidos automaticamente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <section className="text-center text-gray-600 text-sm border-t pt-6">
            <p>
              Esta política foi elaborada para refletir os princípios de transparência da LGPD e as práticas de plataformas líderes de viagens. Para dúvidas, contate nosso DPO.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}