import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreditCard, Calculator } from "lucide-react";

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

export default function UnifiedCalculator() {
  const [amount, setAmount] = useState("");
  const [cardBrand, setCardBrand] = useState("visa_mastercard");

  const amountValue = parseFloat(amount.replace(",", ".")) || 0;
  const brandFees = CARD_FEES[cardBrand];

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
        {/* Valor e Bandeira */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Valor do Produto (R$)</Label>
            <Input
              type="number"
              placeholder="Ex: 1500,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Bandeira do Cartão</Label>
            <Select value={cardBrand} onValueChange={setCardBrand}>
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
        </div>

        {/* Opções de Débito e PIX */}
        {amountValue > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400 mb-1">PIX / Dinheiro</p>
              <p className="text-green-400 font-bold">{formatBRL(amountValue)}</p>
              <p className="text-xs text-slate-500">Sem taxa</p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400 mb-1">Débito</p>
              <p className="text-cyan-400 font-bold">{formatBRL(amountValue * (1 + brandFees.debit / 100))}</p>
              <p className="text-xs text-slate-500">Taxa: {brandFees.debit}%</p>
            </div>
          </div>
        )}

        {/* Tabela de Parcelamento */}
        {amountValue > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-200">Parcelamento no Crédito</p>
            </div>
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
                    const total = amountValue * (1 + fee / 100);
                    const parcel = total / installments;
                    return (
                      <tr
                        key={installments}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
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
          </div>
        )}

        {!amountValue && (
          <div className="text-center py-6 text-slate-500 text-sm">
            Informe o valor do produto para ver as opções de parcelamento
          </div>
        )}
      </CardContent>
    </Card>
  );
}
