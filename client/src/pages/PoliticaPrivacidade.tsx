import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone } from "lucide-react";
import { useLocation } from "wouter";

export default function PoliticaPrivacidade() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button onClick={() => setLocation("/")} variant="ghost" className="text-cyan-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <Shield className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold text-white">Política de Privacidade</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-6 md:p-10 space-y-8 text-slate-300 leading-relaxed">
          {/* Identificação */}
          <div className="border-b border-cyan-500/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Política de Privacidade</h2>
            <div className="text-sm space-y-1 text-slate-400">
              <p><strong className="text-slate-300">JBSX ELETRO LTDA</strong></p>
              <p>CNPJ: 64.760.199/0001-39</p>
              <p>Endereço: Rua Ricardo Castro Macedo, 1907, Loja 211, Luciano Cavalcante, Fortaleza/CE, CEP 60813-680</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> sac@jbsxeletro.com.br</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> (85) 99175-1934</p>
            </div>
          </div>

          {/* 1. Introdução */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">1. Introdução</h3>
            <p>A JBSX Eletro respeita a privacidade dos usuários e está comprometida com a proteção de dados pessoais, em conformidade com a Lei n.º 13.709/2018 (LGPD) e diretrizes de transparência exigidas por plataformas de publicidade como o Google Ads.</p>
          </section>

          {/* 2. Dados coletados */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">2. Dados Coletados</h3>
            <p className="mb-3">Podemos coletar:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Nome completo</li>
              <li>CPF ou CNPJ</li>
              <li>E-mail</li>
              <li>Telefone / WhatsApp</li>
              <li>Endereço completo</li>
              <li>Dados de navegação (IP, cookies, localização aproximada)</li>
              <li>Informações de pagamento (processadas por intermediadores seguros)</li>
            </ul>
          </section>

          {/* 3. Finalidade */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">3. Finalidade do Tratamento</h3>
            <p className="mb-3">Os dados são utilizados para:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Processamento e envio de pedidos</li>
              <li>Emissão de nota fiscal</li>
              <li>Atendimento ao cliente</li>
              <li>Comunicação sobre pedidos e suporte</li>
              <li>Personalização de anúncios (Google Ads e Meta Ads)</li>
              <li>Prevenção a fraudes e segurança</li>
            </ul>
          </section>

          {/* 4. Compartilhamento */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">4. Compartilhamento de Dados</h3>
            <p className="mb-3">Seus dados poderão ser compartilhados com:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Plataformas de pagamento (ex: Mercado Pago, Stripe, etc.)</li>
              <li>Transportadoras e Correios</li>
              <li>Plataformas de marketing (Google Ads, Google Analytics)</li>
              <li>Autoridades legais, quando necessário</li>
            </ul>
            <p className="mt-3 font-semibold text-white">A JBSX Eletro não comercializa dados pessoais.</p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">5. Cookies</h3>
            <p className="mb-3">Utilizamos cookies para:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Melhorar navegação</li>
              <li>Medir desempenho do site</li>
              <li>Personalizar anúncios</li>
            </ul>
            <p className="mt-3">O usuário pode desativar cookies nas configurações do navegador.</p>
          </section>

          {/* 6. Segurança */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">6. Segurança</h3>
            <p>Adotamos medidas técnicas e administrativas para proteger os dados contra acessos não autorizados, vazamentos ou alterações.</p>
          </section>

          {/* 7. Direitos */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">7. Direitos do Usuário</h3>
            <p className="mb-3">Nos termos da LGPD, o usuário pode:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Solicitar acesso aos dados</li>
              <li>Corrigir dados</li>
              <li>Solicitar exclusão</li>
              <li>Revogar consentimento</li>
            </ul>
            <p className="mt-3">Solicitações: <a href="mailto:sac@jbsxeletro.com.br" className="text-cyan-400 hover:text-pink-400 transition-colors">sac@jbsxeletro.com.br</a></p>
          </section>

          {/* 8. Retenção */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">8. Retenção</h3>
            <p>Os dados são armazenados pelo período necessário para cumprimento de obrigações legais e operacionais.</p>
          </section>

          {/* 9. Alterações */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">9. Alterações</h3>
            <p>Esta política pode ser atualizada a qualquer momento. Recomendamos que o usuário consulte esta página periodicamente.</p>
          </section>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-cyan-500/10">
            Última atualização: Março de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
