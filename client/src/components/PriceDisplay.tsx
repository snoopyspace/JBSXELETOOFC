import { QrCode } from "lucide-react";

interface PriceDisplayProps {
  price: number;
  /** Tamanho do preço principal: "sm" | "md" | "lg" | "xl" */
  size?: "sm" | "md" | "lg" | "xl";
  /** Mostrar texto de parcelamento no cartão */
  showInstallment?: boolean;
  /** Mostrar link "Consultar parcelamento no WhatsApp" */
  showWhatsAppLink?: boolean;
  className?: string;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const sizeMap = {
  sm: { price: "text-base", tag: "text-[10px]", installment: "text-[10px]" },
  md: { price: "text-lg", tag: "text-xs", installment: "text-xs" },
  lg: { price: "text-2xl", tag: "text-xs", installment: "text-xs" },
  xl: { price: "text-3xl", tag: "text-sm", installment: "text-sm" },
};

export function PriceDisplay({
  price,
  size = "md",
  showInstallment = true,
  showWhatsAppLink = false,
  className = "",
}: PriceDisplayProps) {
  const s = sizeMap[size];
  const whatsappMsg = encodeURIComponent(
    `Olá! Gostaria de consultar as condições de parcelamento no cartão para o produto de R$ ${formatBRL(price).replace("R$\u00a0", "")}.`
  );
  const whatsappUrl = `https://wa.me/5585991272027?text=${whatsappMsg}`;

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {/* Preço principal com tag PIX */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`font-bold text-cyan-400 ${s.price}`}>
          {formatBRL(price)}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 bg-green-500/20 text-green-400 border border-green-500/40 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide ${s.tag}`}
        >
          <QrCode className="w-3 h-3" />
          no PIX
        </span>
      </div>

      {/* Texto de parcelamento */}
      {showInstallment && (
        <p className={`text-slate-400 leading-snug ${s.installment}`}>
          Cartão em até 12x sob consulta, com acréscimo das taxas.
        </p>
      )}

      {/* Link WhatsApp para parcelamento */}
      {showWhatsAppLink && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-cyan-300 hover:text-cyan-200 underline underline-offset-2 transition-colors mt-0.5 ${s.installment}`}
        >
          Quer parcelar? Consulte condições em até 12x no cartão pelo WhatsApp.
        </a>
      )}
    </div>
  );
}
