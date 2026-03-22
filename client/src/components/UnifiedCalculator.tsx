import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calculator, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Taxas reais por bandeira de cartão
const CARD_FEES: Record<string, { name: string; debit: number; credit_installments: { installments: number; fee: number }[] }> = {
  visa_mastercard: {
    name: "Visa / Mastercard",
    debit: 1.39,
    credit_installments: [
      { installments: 1, fee: 2.91 },
      { installments: 2, fee: 4.68 },
      { installments: 3, fee: 5.45 },
      { installments: 4, fee: 6.21 },
      { installments: 5, fee: 6.95 },
      { installments: 6, fee: 7.69 },
      { installments: 7, fee: 8.47 },
      { installments: 8, fee: 9.19 },
      { installments: 9, fee: 9.91 },
      { installments: 10, fee: 10.61 },
      { installments: 11, fee: 11.32 },
      { installments: 12, fee: 12.01 },
      { installments: 13, fee: 12.70 },
      { installments: 14, fee: 13.38 },
      { installments: 15, fee: 14.05 },
      { installments: 16, fee: 14.72 },
      { installments: 17, fee: 15.38 },
      { installments: 18, fee: 16.03 },
    ],
  },
  elo_hipercard_amex: {
    name: "Elo / Hipercard / Amex",
    debit: 1.45,
    credit_installments: [
      { installments: 1, fee: 3.24 },
      { installments: 2, fee: 4.83 },
      { installments: 3, fee: 5.60 },
      { installments: 4, fee: 6.36 },
      { installments: 5, fee: 7.10 },
      { installments: 6, fee: 7.84 },
      { installments: 7, fee: 8.67 },
      { installments: 8, fee: 9.39 },
      { installments: 9, fee: 10.11 },
      { installments: 10, fee: 10.81 },
      { installments: 11, fee: 11.52 },
      { installments: 12, fee: 12.21 },
      { installments: 13, fee: 12.90 },
      { installments: 14, fee: 13.58 },
      { installments: 15, fee: 14.25 },
      { installments: 16, fee: 14.92 },
      { installments: 17, fee: 15.58 },
      { installments: 18, fee: 16.23 },
    ],
  },
  other_cards: {
    name: "Outros Cartões",
    debit: 1.79,
    credit_installments: [
      { installments: 1, fee: 3.24 },
      { installments: 2, fee: 4.83 },
      { installments: 3, fee: 5.60 },
      { installments: 4, fee: 6.36 },
      { installments: 5, fee: 7.10 },
      { installments: 6, fee: 7.84 },
      { installments: 7, fee: 8.67 },
      { installments: 8, fee: 9.39 },
      { installments: 9, fee: 10.11 },
      { installments: 10, fee: 10.81 },
      { installments: 11, fee: 11.52 },
      { installments: 12, fee: 12.21 },
      { installments: 13, fee: 12.90 },
      { installments: 14, fee: 13.58 },
      { installments: 15, fee: 14.25 },
      { installments: 16, fee: 14.92 },
      { installments: 17, fee: 15.58 },
      { installments: 18, fee: 16.23 },
    ],
  },
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface UnifiedCalculatorProps {
  /** Se fornecido, pré-seleciona o produto e desabilita a seleção */
  preselectedProductId?: number;
  preselectedPrice?: number;
}

export default function UnifiedCalculator({ preselectedProductId, preselectedPrice }: UnifiedCalculatorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProductId ? String(preselectedProductId) : "__manual__"
  );
  const [manualAmount, setManualAmount] = useState(preselectedPrice ? String(preselectedPrice) : "");
  const [cardBrand, setCardBrand] = useState("visa_mastercard");
  const [selectedInstallments, setSelectedInstallments] = useState<number | null>(null);

  const { data: products } = trpc.products.list.useQuery();

  // Determine the active amount: product price or manual input
  const activeAmount = useMemo(() => {
    if (selectedProductId && selectedProductId !== "__manual__" && products) {
      const product = products.find((p) => String(p.id) === selectedProductId);
      if (product) return parseFloat(product.price) || 0;
    }
    return parseFloat(manualAmount.replace(",", ".")) || 0;
  }, [selectedProductId, products, manualAmount]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId || selectedProductId === "__manual__" || !products) return null;
    return products.find((p) => String(p.id) === selectedProductId) || null;
  }, [selectedProductId, products]);

  const brandFees = CARD_FEES[cardBrand];

  // Selected installment details
  const selectedInstallmentData = useMemo(() => {
    if (!selectedInstallments || !activeAmount) return null;
    const entry = brandFees.credit_installments.find((i) => i.installments === selectedInstallments);
    if (!entry) return null;
    const total = activeAmount * (1 + entry.fee / 100);
    const parcel = total / entry.installments;
    const feeAmount = total - activeAmount;
    return { ...entry, total, parcel, feeAmount };
  }, [selectedInstallments, activeAmount, brandFees]);

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Consultor de Parcelamento
        </CardTitle>
        <p className="text-slate-400 text-sm">Simule o valor das parcelas com taxas reais por bandeira</p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Seleção de Produto */}
        {!preselectedProductId && (
          <div className="space-y-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Selecionar Produto (opcional)
            </Label>
            <Select
              value={selectedProductId}
              onValueChange={(val) => {
                setSelectedProductId(val);
                if (val === "__manual__") setManualAmount("");
                setSelectedInstallments(null);
              }}
            >
              <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                <SelectValue placeholder="Escolha um produto ou informe o valor manualmente..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-cyan-500/30 max-h-60">
                <SelectItem value="__manual__" className="text-slate-400 hover:bg-slate-700">
                  -- Informar valor manualmente --
                </SelectItem>
                {products?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)} className="text-white hover:bg-slate-700">
                    <span className="flex items-center justify-between gap-3 w-full">
                      <span className="truncate">{p.name}</span>
                      <span className="text-cyan-400 font-semibold flex-shrink-0">
                        {formatBRL(parseFloat(p.price))}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Produto selecionado - preview */}
            {selectedProduct && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg border border-cyan-500/20">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-12 h-12 object-contain rounded-lg bg-slate-800" />
                ) : (
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selectedProduct.name}</p>
                  <p className="text-cyan-400 font-bold">{formatBRL(parseFloat(selectedProduct.price))}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex-shrink-0">
                  Selecionado
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Valor Manual (quando não há produto selecionado) */}
        {(selectedProductId === "__manual__" || !selectedProductId) && (
          <div className="space-y-2">
            <Label className="text-slate-200">Valor do Produto (R$)</Label>
            <Input
              type="number"
              placeholder="Ex: 1500.00"
              value={manualAmount}
              onChange={(e) => { setManualAmount(e.target.value); setSelectedInstallments(null); }}
              className="bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Bandeira do Cartão */}
        <div className="space-y-2">
          <Label className="text-slate-200">Bandeira do Cartão</Label>
          <Select value={cardBrand} onValueChange={(v) => { setCardBrand(v); setSelectedInstallments(null); }}>
            <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-cyan-500/30">
              {Object.entries(CARD_FEES).map(([key, val]) => (
                <SelectItem key={key} value={key} className="text-white hover:bg-slate-700">
                  {val.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opções de Débito e PIX */}
        {activeAmount > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/50 rounded-lg border border-green-500/20">
              <p className="text-xs text-slate-400 mb-1">PIX / Dinheiro</p>
              <p className="text-green-400 font-bold">{formatBRL(activeAmount)}</p>
              <p className="text-xs text-slate-500">Sem taxa</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border border-cyan-500/20">
              <p className="text-xs text-slate-400 mb-1">Débito ({brandFees.debit}%)</p>
              <p className="text-cyan-400 font-bold">{formatBRL(activeAmount * (1 + brandFees.debit / 100))}</p>
              <p className="text-xs text-slate-500">Taxa: {formatBRL(activeAmount * brandFees.debit / 100)}</p>
            </div>
          </div>
        )}

        {/* Seletor de Parcelas + Resultado */}
        {activeAmount > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-200">Parcelamento no Crédito</p>
            </div>

            {/* Seletor de parcelas */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs">Selecione a quantidade de parcelas</Label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                {brandFees.credit_installments.map(({ installments, fee }) => {
                  const total = activeAmount * (1 + fee / 100);
                  const parcel = total / installments;
                  const isSelected = selectedInstallments === installments;
                  return (
                    <button
                      key={installments}
                      onClick={() => setSelectedInstallments(isSelected ? null : installments)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-cyan-500 text-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/30"
                          : "bg-slate-700/50 text-slate-300 border-slate-600/50 hover:border-cyan-500/40 hover:text-white"
                      }`}
                      title={`${installments}x de ${formatBRL(parcel)}`}
                    >
                      {installments === 1 ? "1x" : `${installments}x`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resultado da simulação selecionada */}
            {selectedInstallmentData && (
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-slate-800 rounded-xl border border-cyan-500/30 space-y-3">
                <p className="text-cyan-400 font-semibold text-sm">Simulação Selecionada</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white font-medium">{formatBRL(activeAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parcelamento:</span>
                    <span className="text-cyan-400 font-bold">
                      {selectedInstallmentData.installments === 1
                        ? "À vista"
                        : `${selectedInstallmentData.installments}x de ${formatBRL(selectedInstallmentData.parcel)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxa ({selectedInstallmentData.fee}%):</span>
                    <span className="text-orange-400">+ {formatBRL(selectedInstallmentData.feeAmount)}</span>
                  </div>
                  <div className="h-px bg-slate-700" />
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold text-base">{formatBRL(selectedInstallmentData.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela completa */}
            {!selectedInstallments && (
              <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700/50 text-slate-400 text-xs">
                      <th className="text-left p-2 pl-3">Parcelas</th>
                      <th className="text-right p-2">Valor/Parcela</th>
                      <th className="text-right p-2">Taxa</th>
                      <th className="text-right p-2 pr-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandFees.credit_installments.map(({ installments, fee }) => {
                      const total = activeAmount * (1 + fee / 100);
                      const parcel = total / installments;
                      return (
                        <tr
                          key={installments}
                          className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedInstallments(installments)}
                        >
                          <td className="p-2 pl-3 text-white font-medium">
                            {installments === 1 ? "À vista" : `${installments}x`}
                          </td>
                          <td className="p-2 text-right text-cyan-400 font-semibold">
                            {formatBRL(parcel)}
                          </td>
                          <td className="p-2 text-right text-slate-400 text-xs">{fee}%</td>
                          <td className="p-2 pr-3 text-right text-slate-300">{formatBRL(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!activeAmount && (
          <div className="text-center py-6 text-slate-500 text-sm">
            Selecione um produto ou informe o valor para ver as opções de parcelamento
          </div>
        )}
      </CardContent>
    </Card>
  );
}
