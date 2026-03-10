import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface PaymentFeeCalculatorProps {
  subtotal: number;
  onFeeChange?: (fee: number) => void;
}

export default function PaymentFeeCalculator({ subtotal, onFeeChange }: PaymentFeeCalculatorProps) {
  const [fee, setFee] = useState<number>(0);
  
  const { data: config } = trpc.paymentFeeConfig.get.useQuery();

  useEffect(() => {
    if (!config) return;

    const feePercentage = parseFloat(config.feePercentage);
    const minFee = parseFloat(config.minFee);
    const maxFee = parseFloat(config.maxFee);

    let calculatedFee = (subtotal * feePercentage) / 100;
    
    // Apply min and max limits
    if (calculatedFee < minFee) {
      calculatedFee = minFee;
    } else if (calculatedFee > maxFee) {
      calculatedFee = maxFee;
    }

    setFee(calculatedFee);
    onFeeChange?.(calculatedFee);
  }, [subtotal, config, onFeeChange]);

  if (!config) {
    return null;
  }

  return (
    <Card className="bg-slate-700/50 border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-cyan-400">Taxa de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Percentual:</span>
            <span>{parseFloat(config.feePercentage).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Mínimo:</span>
            <span>R$ {parseFloat(config.minFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Máximo:</span>
            <span>R$ {parseFloat(config.maxFee).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 pt-4">
          <div className="flex justify-between font-bold text-white">
            <span>Taxa Cobrada:</span>
            <span className="text-pink-400">R$ {fee.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
