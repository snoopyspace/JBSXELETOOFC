import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function TermosUso() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button onClick={() => setLocation("/")} variant="ghost" className="text-cyan-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <FileText className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold text-white">Termos de Uso</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-6 md:p-10 space-y-8 text-slate-300 leading-relaxed">
          <div className="border-b border-cyan-500/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Termos de Uso</h2>
            <p className="text-slate-400 text-sm">JBSX ELETRO LTDA - CNPJ: 64.760.199/0001-39</p>
          </div>

          {/* 1. Identificação */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">1. Identificação</h3>
            <p>Este site é operado por:</p>
            <div className="mt-2 bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 text-sm space-y-1">
              <p><strong className="text-white">JBSX ELETRO LTDA</strong></p>
              <p>CNPJ: 64.760.199/0001-39</p>
              <p>Endereço: Rua Ricardo Castro Macedo, 1907, Loja 211, Luciano Cavalcante, Fortaleza/CE, CEP 60813-680</p>
            </div>
          </section>

          {/* 2. Objeto */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">2. Objeto</h3>
            <p>A empresa atua na comercialização de produtos eletrônicos e acessórios tecnológicos, incluindo produtos importados de forma legal e com fornecedores verificados.</p>
          </section>

          {/* 3. Autenticidade - CRÍTICO GOOGLE ADS */}
          <section className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">3. Autenticidade dos Produtos</h3>
            </div>
            <p className="mb-4 text-white font-medium">A JBSX Eletro declara que:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <span>Comercializa <strong className="text-white">exclusivamente produtos originais</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <span>Trabalha com <strong className="text-white">fornecedores confiáveis e verificados</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <span><strong className="text-white">Não comercializa produtos falsificados ou réplicas</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <span>Oferece <strong className="text-white">garantia conforme fabricante ou importador</strong></span>
              </li>
            </ul>
          </section>

          {/* 4. Pagamentos */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">4. Pagamentos</h3>
            <p>Os pagamentos são processados por plataformas seguras, não havendo armazenamento direto de dados financeiros sensíveis.</p>
          </section>

          {/* 5. Nota fiscal */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">5. Nota Fiscal</h3>
            <p>Todas as vendas são acompanhadas de nota fiscal conforme legislação brasileira.</p>
          </section>

          {/* 6. Garantia */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">6. Garantia</h3>
            <p>Os produtos possuem garantia conforme especificado na página de cada item, respeitando as normas do fabricante e/ou importador.</p>
          </section>

          {/* 7. Trocas e devoluções */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">7. Trocas e Devoluções</h3>
            <p className="mb-3">Nos termos do Código de Defesa do Consumidor:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Prazo de 7 dias para arrependimento a partir do recebimento</li>
              <li>Produto deve estar sem uso e em sua embalagem original</li>
              <li>Solicitar troca/devolução via e-mail: sac@jbsxeletro.com.br</li>
            </ul>
          </section>

          {/* 8. Responsabilidade do usuário */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">8. Responsabilidade do Usuário</h3>
            <p className="mb-3">O usuário se compromete a:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Fornecer dados verídicos</li>
              <li>Não utilizar o site para atividades ilícitas</li>
            </ul>
          </section>

          {/* 9. Limitação de responsabilidade */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">9. Limitação de Responsabilidade</h3>
            <p className="mb-3">A empresa não se responsabiliza por:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Uso indevido do produto</li>
              <li>Atrasos logísticos</li>
              <li>Fatores externos à operação</li>
            </ul>
          </section>

          {/* 10. Propriedade intelectual */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">10. Propriedade Intelectual</h3>
            <p>Todo conteúdo do site é protegido por direitos autorais.</p>
          </section>

          {/* 11. Privacidade */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">11. Privacidade</h3>
            <p>O uso de dados segue a <button onClick={() => setLocation("/politica-privacidade")} className="text-cyan-400 hover:text-pink-400 transition-colors underline">Política de Privacidade</button>.</p>
          </section>

          {/* 12. Alterações */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">12. Alterações</h3>
            <p>Os termos podem ser modificados a qualquer momento. Recomendamos consulta periódica.</p>
          </section>

          {/* 13. Foro */}
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">13. Foro</h3>
            <p>Fica eleito o foro da comarca de Fortaleza/CE para dirimir quaisquer questões oriundas destes Termos de Uso.</p>
          </section>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-cyan-500/10">
            Última atualização: Março de 2026
          </div>
        </div>
      </div>
    </div>
  );
}
