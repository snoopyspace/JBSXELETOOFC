import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Package, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function PoliticaEnvio() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button onClick={() => setLocation("/")} variant="ghost" className="text-cyan-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <Truck className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold text-white">Política de Envio</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-6 md:p-10 space-y-8 text-slate-300 leading-relaxed">
          <div className="border-b border-cyan-500/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Política de Envio</h2>
            <p className="text-slate-400 text-sm">JBSX ELETRO LTDA - CNPJ: 64.760.199/0001-39</p>
          </div>

          {/* 1. Área de atuação */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-cyan-400">1. Área de Atuação</h3>
            </div>
            <p>A JBSX Eletro realiza entregas em todo o território nacional.</p>
          </section>

          {/* 2. Tipos de envio */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-cyan-400">2. Tipos de Envio</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h4 className="font-semibold text-white mb-2">Produtos disponíveis no Brasil</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Postagem em até 2 dias úteis</li>
                  <li>Entrega entre 3 e 10 dias úteis</li>
                </ul>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h4 className="font-semibold text-white mb-2">Produtos sob encomenda (importação legal)</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Prazo médio: 10 a 25 dias úteis</li>
                  <li>Sujeito a variações logísticas e fiscalização</li>
                </ul>
              </div>
              <p className="text-sm text-green-400 font-medium">Todos os processos seguem conformidade com a legislação brasileira.</p>
            </div>
          </section>

          {/* 3. Rastreamento */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">3. Rastreamento</h3>
            <p>Todos os pedidos possuem código de rastreio, enviado ao cliente após a postagem via e-mail e WhatsApp.</p>
          </section>

          {/* 4. Frete */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">4. Frete</h3>
            <p>O valor do frete é calculado automaticamente no checkout, com base no endereço de entrega e peso do produto.</p>
          </section>

          {/* 5. Tributos e importação */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">5. Tributos e Importação</h3>
            <p className="mb-3">Para produtos importados:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Podem ocorrer tributações conforme legislação brasileira</li>
              <li>Caso aplicável, o cliente será informado previamente</li>
            </ul>
          </section>

          {/* 6. Responsabilidade */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">6. Responsabilidade</h3>
            <p className="mb-3">Após a postagem:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>A entrega é responsabilidade da transportadora</li>
              <li>O cliente deve acompanhar o rastreamento</li>
            </ul>
          </section>

          {/* 7. Tentativas de entrega */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">7. Tentativas de Entrega</h3>
            <p className="mb-3">Caso não haja recebimento:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Serão realizadas novas tentativas</li>
              <li>O pedido poderá retornar ao remetente</li>
            </ul>
          </section>

          {/* 8. Atrasos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-cyan-400">8. Atrasos</h3>
            </div>
            <p className="mb-3">Podem ocorrer atrasos por:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Greves</li>
              <li>Condições climáticas</li>
              <li>Fiscalização alfandegária</li>
              <li>Problemas logísticos</li>
            </ul>
          </section>

          {/* 9. Segurança */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">9. Segurança</h3>
            <p>Todos os pedidos são enviados com embalagem adequada e proteção para garantir a integridade do produto durante o transporte.</p>
          </section>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-cyan-500/10">
            Última atualização: Março de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
