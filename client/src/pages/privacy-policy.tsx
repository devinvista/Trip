import { ArrowLeft, Shield, Users, Database, Clock, Mail, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Política de Privacidade
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
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                1. Introdução
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                A PartiuTrip ("nós", "nosso") valoriza sua privacidade. Esta Política explica como coletamos, usamos, compartilhamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Ao usar nossa plataforma, você concorda com estas práticas.
              </p>
            </section>

            {/* Dados Coletados */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                2. Dados Coletados
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    a) Dados fornecidos por você:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Identificação:</strong> Nome, e-mail, telefone, foto de perfil</li>
                    <li><strong>Preferências de viagem:</strong> Estilo (praia, aventura, etc.), destinos de interesse, orçamento médio</li>
                    <li><strong>Conteúdo gerado:</strong> Mensagens, planos de viagem, atividades, upload de recibos</li>
                    <li><strong>Dados financeiros:</strong> Valores de despesas compartilhadas (não coletamos dados bancários ou cartões)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    b) Coletados automaticamente:
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Dados técnicos:</strong> IP, tipo de navegador, dispositivo</li>
                    <li><strong>Uso da plataforma:</strong> Páginas visitadas, interações, tempo de sessão</li>
                    <li><strong>Localização aproximada:</strong> Com base no IP (para sugestões de destinos)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Finalidades */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                3. Finalidades do Tratamento
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-900 dark:text-white font-medium">
                        Finalidade
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-900 dark:text-white font-medium">
                        Base Legal (LGPD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Criar e gerenciar sua conta
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Execução de contrato (Art. 7º, V)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Conectar você a companheiros de viagem
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Legítimo interesse (Art. 7º, IX)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Calcular divisão de despesas
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Consentimento (Art. 7º, I)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Enviar notificações sobre viagens
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Execução de contrato
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Melhorar nossos serviços
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Legítimo interesse
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Cumprir obrigações legais
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Obrigação legal (Art. 7º, II)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Compartilhamento */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                4. Compartilhamento de Dados
              </h2>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Compartilhamos informações apenas quando necessário:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Com outros usuários:</strong> Perfil básico (nome, foto) e mensagens para participantes da mesma viagem</li>
                <li><strong>Com prestadores de serviço:</strong> Hospedagem em nuvem (AWS Brasil), ferramentas de análise (Google Analytics anonimizado)</li>
                <li><strong>Com autoridades:</strong> Para cumprir ordens judiciais ou leis aplicáveis</li>
              </ul>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Nunca vendemos seus dados pessoais.
                </p>
              </div>
            </section>

            {/* Segurança */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                5. Segurança de Dados
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Criptografia</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Dados em trânsito (HTTPS) e em repouso
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Acesso restrito</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Apenas pessoal autorizado
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Monitoramento</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Contínuo para detectar violações
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Backups</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Diários em servidores seguros no Brasil
                  </p>
                </div>
              </div>
            </section>

            {/* Retenção */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-blue-600" />
                6. Retenção de Dados
              </h2>
              
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Conta ativa:</strong> Enquanto você usar a plataforma</li>
                <li><strong>Após inatividade:</strong> 2 anos (exceto dados legais)</li>
                <li><strong>Recibos:</strong> Excluídos automaticamente após 180 dias</li>
                <li><strong>Exclusão total:</strong> Solicitação via Seção 8</li>
              </ul>
            </section>

            {/* Direitos LGPD */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                8. Seus Direitos LGPD
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-900 dark:text-white font-medium">
                        Direito
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-gray-900 dark:text-white font-medium">
                        Como exercer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Acesso aos dados
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Via portal do usuário ou e-mail
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Correção de dados
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Atualize seu perfil ou solicite
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Exclusão ("esquecimento")
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Solicite em privacidade@partiutrip.com
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Portabilidade
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Receba dados em formato legível
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Revogar consentimento
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">
                        Ajuste configurações de conta
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Prazo de resposta: 15 dias úteis.
                </p>
              </div>
            </section>

            {/* Contato */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                11. Encarregado de Dados (DPO)
              </h2>
              
              <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 mb-2">
                  Entre em contato para exercer seus direitos:
                </p>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  E-mail: dpo@partiutrip.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}