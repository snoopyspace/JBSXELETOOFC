import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft } from "lucide-react";

const TERMOS_CONTENT = `Termo de Aceite – Condições de Compra
JBSX Eletro – Eletrônicos Premium

Ao finalizar uma compra na JBSX Eletro, o cliente declara ter lido, compreendido e concordado integralmente com as Políticas de Troca, Devolução e Garantia, bem como com as condições descritas neste Termo de Aceite, elaborado conforme as disposições do Código de Defesa do Consumidor.

1. Aceite das Condições de Compra

Ao concluir o pedido, o cliente declara que:
• leu e concorda com a Política de Troca, Devolução e Garantia da JBSX Eletro;
• está ciente das condições específicas aplicáveis a produtos eletrônicos e importados;
• reconhece que alguns produtos podem possuir características técnicas, requisitos de ativação ou regulamentação específica.

2. Direito de Arrependimento

O cliente declara estar ciente de que, conforme o art. 49 do Código de Defesa do Consumidor, poderá exercer o direito de arrependimento no prazo de até 7 (sete) dias corridos após o recebimento do produto, desde que:
• o produto esteja sem uso;
• esteja na embalagem original;
• acompanhe todos os acessórios e itens enviados.

Produtos com sinais de uso, ativação ou ausência de itens originais poderão ter a devolução recusada.

3. Ativação de Produtos Eletrônicos

O cliente declara estar ciente de que alguns produtos eletrônicos, incluindo dispositivos das marcas Apple e DJI, possuem sistemas de ativação digital, registro de uso ou vinculação a contas pessoais.

Uma vez ativados ou utilizados, determinados produtos não poderão ser devolvidos por arrependimento, exceto em caso de defeito de fabricação.

4. Equipamentos de Voo (Drones)

Ao adquirir drones ou equipamentos de voo, o cliente declara estar ciente de que:
• o equipamento poderá exigir registro ou autorização para uso no Brasil;
• a operação pode estar sujeita a regulamentações de órgãos como:
  - Agência Nacional de Aviação Civil
  - Departamento de Controle do Espaço Aéreo
  - Agência Nacional de Telecomunicações

O cliente reconhece que a responsabilidade pela operação do drone, registro e cumprimento das normas legais é exclusivamente do operador do equipamento.

5. Produtos Importados e Homologação Nacional

O cliente declara estar ciente de que alguns produtos comercializados pela JBSX Eletro podem ser produtos importados, podendo:
• não possuir homologação nacional;
• não possuir assistência técnica oficial no Brasil.

O comprador declara ter ciência dessas condições e concorda com os procedimentos de análise técnica e garantia previstos pela loja.

6. Responsabilidade de Uso do Equipamento

O cliente reconhece que a JBSX Eletro atua exclusivamente na comercialização dos produtos, não sendo responsável pela forma de utilização dos equipamentos adquiridos.

Assim, o cliente declara estar ciente de que:
• é responsável pelo uso adequado do produto;
• deve respeitar a legislação aplicável e regulamentações técnicas;
• assume integral responsabilidade por eventuais danos, multas ou penalidades decorrentes da utilização do equipamento.

A JBSX Eletro não se responsabiliza por danos causados pelo uso indevido ou operação inadequada dos produtos.

7. Aceite Final

Ao concluir a compra, o cliente declara que:
✔ leu e concorda com todas as condições deste termo
✔ aceita a Política de Troca, Devolução e Garantia da JBSX Eletro
✔ compreende as condições específicas aplicáveis a produtos eletrônicos premium e importados

Este aceite é considerado válido e vinculante para todas as compras realizadas na JBSX Eletro`;

const POLITICA_CONTENT = `Política de Troca, Devolução e Garantia
JBSX Eletro – Eletrônicos Premium

A presente Política de Troca, Devolução e Garantia regula as condições aplicáveis às compras realizadas na JBSX Eletro, observando as disposições do Código de Defesa do Consumidor, bem como as particularidades da comercialização de produtos eletrônicos premium e importados, incluindo equipamentos das marcas Apple, DJI, Hollyland, entre outras.

1. Direito de Arrependimento (7 dias)

Conforme previsto no art. 49 do Código de Defesa do Consumidor, o cliente poderá solicitar troca ou devolução do produto no prazo de até 7 (sete) dias corridos, contados a partir do recebimento.

Para que a devolução seja aceita, o produto deverá:
• Estar sem sinais de uso;
• Estar na embalagem original;
• Conter todos os acessórios, manuais e itens enviados;
• Estar acompanhado da nota fiscal ou comprovante de compra.

Após o recebimento do produto pela JBSX Eletro, será realizada análise de conferência.

Caso aprovado:
• O cliente poderá optar por reembolso, conforme forma de pagamento utilizada; ou
• Troca por outro produto disponível em estoque.

Produtos que apresentem sinais de uso, danos ou ausência de itens originais poderão ter a devolução recusada.

2. Produtos Eletrônicos de Uso Sensível

Alguns produtos eletrônicos possuem ativação digital, registro interno de uso ou telemetria.

2.1 Drones DJI e Equipamentos de Voo

Produtos da DJI possuem registro interno de ativação, telemetria e histórico de voo.

Para que seja aceita troca ou devolução por arrependimento:
• o drone não pode ter sido ativado;
• não pode possuir registro de voo;
• não pode estar vinculado a conta do usuário;
• deve estar com lacres originais e sem sinais de uso.

Após ativação ou realização de voo, o equipamento não poderá ser devolvido por arrependimento, exceto em caso de defeito técnico comprovado.

O uso de drones no Brasil pode estar sujeito a normas e regulamentações de órgãos competentes, incluindo:
• Agência Nacional de Aviação Civil
• Departamento de Controle do Espaço Aéreo
• Agência Nacional de Telecomunicações

A responsabilidade pelo registro, operação e uso do drone conforme legislação brasileira é exclusivamente do comprador.

3. Produtos Apple e Dispositivos com Registro de Ativação

Produtos da Apple possuem sistemas de ativação e vinculação ao Apple ID.

Para troca ou devolução:
• o produto não pode ter sido ativado;
• não pode estar vinculado ao Apple ID;
• deve estar sem uso e na embalagem original.

Produtos ativados ou vinculados a contas pessoais não poderão ser aceitos para devolução, exceto em caso de defeito de fabricação.

4. Garantia do Fabricante

Todos os produtos comercializados pela JBSX Eletro possuem garantia de 12 (doze) meses do fabricante, conforme políticas estabelecidas por cada marca.

O atendimento poderá ocorrer por meio de:
• assistência técnica autorizada, quando disponível no Brasil;
• assistência técnica especializada.

Os prazos de reparo ou substituição seguem as políticas do fabricante responsável.

5. Produtos Importados sem Assistência Técnica no Brasil

Alguns produtos comercializados pela JBSX Eletro são importados e podem não possuir assistência técnica oficial no Brasil.

Nesses casos:
1. O produto deverá ser enviado para análise técnica pela JBSX Eletro.
2. O prazo de análise é de até 20 (vinte) dias.
3. Confirmada a necessidade de acionamento da garantia, o produto poderá ser encaminhado ao fabricante ou fornecedor internacional.

O prazo de reparo ou substituição dependerá do fabricante, podendo variar conforme logística internacional e disponibilidade de peças.

6. Produtos sem Homologação Nacional

Alguns dispositivos eletrônicos importados podem não possuir homologação ou certificação nacional, especialmente perante a Agência Nacional de Telecomunicações.

Ao adquirir tais produtos, o cliente declara estar ciente de que:
• o produto pode ter sido importado diretamente;
• pode não possuir homologação nacional;
• a utilização poderá estar sujeita a regras específicas de uso no Brasil.

A JBSX Eletro não se responsabiliza por eventuais limitações de uso decorrentes de regulamentações técnicas ou exigências de homologação nacional, sendo responsabilidade do comprador verificar a compatibilidade e regulamentação aplicável ao produto.

7. Responsabilidade Operacional do Equipamento

A JBSX Eletro atua exclusivamente na comercialização de produtos eletrônicos, não sendo responsável pela forma de utilização dos equipamentos adquiridos pelos clientes.

Ao adquirir qualquer produto, especialmente drones, equipamentos de gravação, transmissão ou telecomunicação, o comprador declara estar ciente de que:
• é integralmente responsável pela operação do equipamento;
• deve respeitar a legislação vigente e regulamentações aplicáveis;
• deve observar eventuais regras de registro, licenciamento ou autorização de uso perante órgãos competentes.

A JBSX Eletro não se responsabiliza por:
• uso inadequado do equipamento;
• utilização em desacordo com normas legais ou regulamentares;
• multas, sanções administrativas ou penalidades aplicadas por órgãos reguladores;
• danos materiais ou pessoais decorrentes da operação do produto.

A responsabilidade pelo uso, operação, manutenção e cumprimento da legislação aplicável é exclusivamente do comprador ou operador do equipamento.

8. Situações que invalidam a garantia

A garantia poderá ser recusada quando constatado:
• mau uso do produto;
• quedas ou impactos;
• danos físicos ou estéticos;
• contato com líquidos quando o produto não possui certificação adequada;
• abertura ou reparo por assistência não autorizada;
• remoção de lacres de segurança.

Nestes casos, poderá ser apresentado orçamento para reparo, mediante aprovação do cliente.

9. Procedimento para Solicitação

Para solicitar troca, devolução ou garantia, o cliente deverá entrar em contato com a JBSX Eletro, informando:
• nome completo
• número do pedido ou nota fiscal
• descrição do problema
• fotos ou vídeos do produto (quando aplicável)

Após análise inicial, serão fornecidas orientações para envio e continuidade do atendimento.

10. Disposições Finais

A JBSX Eletro reserva-se o direito de recusar solicitações que não atendam às condições estabelecidas nesta política.

Esta política poderá ser atualizada a qualquer momento, visando adequação às normas legais e melhoria contínua dos serviços.`;

export default function Terms() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialTab = params.get("tab") === "policy" ? "policy" : "terms";
  const [activeTab, setActiveTab] = useState<"terms" | "policy">(initialTab);

  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();

      if (trimmed === "") {
        return <div key={index} className="h-2" />;
      }

      // Títulos principais
      if (trimmed.match(/^(Termo de Aceite|Política de Troca)/)) {
        return (
          <h1 key={index} className="text-3xl font-bold text-cyan-400 mb-2 mt-6">
            {trimmed}
          </h1>
        );
      }

      // Subtítulos
      if (trimmed === "JBSX Eletro – Eletrônicos Premium") {
        return (
          <h2 key={index} className="text-xl font-semibold text-pink-400 mb-4">
            {trimmed}
          </h2>
        );
      }

      // Seções numeradas
      if (trimmed.match(/^\d+\./)) {
        return (
          <h3 key={index} className="text-lg font-bold text-cyan-400 mt-6 mb-3">
            {trimmed}
          </h3>
        );
      }

      // Subseções
      if (trimmed.match(/^\d+\.\d+/)) {
        return (
          <h4 key={index} className="text-md font-semibold text-pink-300 mt-4 mb-2">
            {trimmed}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        return (
          <p key={index} className="text-slate-300 ml-4 mb-2 leading-relaxed">
            {trimmed}
          </p>
        );
      }

      // Checkmarks
      if (trimmed.startsWith("✔")) {
        return (
          <p key={index} className="text-cyan-300 font-semibold mb-2 ml-4">
            {trimmed}
          </p>
        );
      }

      // Regular paragraphs
      return (
        <p key={index} className="text-slate-300 mb-3 leading-relaxed text-justify">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-slate-800 rounded-lg text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Termos e Condições
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "terms"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/50"
                : "bg-slate-800 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50"
            }`}
          >
            Termo de Aceite
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "policy"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/50"
                : "bg-slate-800 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50"
            }`}
          >
            Política de Troca
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-8 shadow-lg max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {activeTab === "terms" ? formatContent(TERMOS_CONTENT) : formatContent(POLITICA_CONTENT)}
          </div>
        </div>
      </div>
    </div>
  );
}
