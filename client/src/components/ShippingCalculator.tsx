import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingCostChange?: (cost: number) => void;
}

export default function ShippingCalculator({ subtotal, onShippingCostChange }: ShippingCalculatorProps) {
  const [weight, setWeight] = useState<string>("1");
  const [shippingCost, setShippingCost] = useState<number>(0);
  
  const { data: config } = trpc.shippingConfig.get.useQuery();

  useEffect(() => {
    if (!config) return;

    const weightNum = parseFloat(weight) || 0;
    const baseCost = parseFloat(config.baseCost);
    const costPerKg = parseFloat(config.costPerKg);
    const freeShippingThreshold = parseFloat(config.freeShippingThreshold);

    let cost = baseCost + weightNum * costPerKg;

    // Free shipping if subtotal exceeds threshold
    if (subtotal >= freeShippingThreshold) {
      cost = 0;
    }

    setShippingCost(cost);
    onShippingCostChange?.(cost);
  }, [weight, config, subtotal, onShippingCostChange]);

  if (!config) {
    return null;
  }

  return (
    <Card className="bg-slate-700/50 border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-cyan-400">Cálculo de Frete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="weight" className="text-slate-300">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-slate-600 border-cyan-500/30 text-white placeholder-slate-400"
          />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Custo Base:</span>
            <span>R$ {parseFloat(config.baseCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Custo por kg:</span>
            <span>R$ {parseFloat(config.costPerKg).toFixed(2)}</span>
          </div>
          {subtotal >= parseFloat(config.freeShippingThreshold) && (
            <div className="flex justify-between text-green-400 font-semibold">
              <span>Frete Grátis!</span>
              <span>Acima de R$ {parseFloat(config.freeShippingThreshold).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-cyan-500/20 pt-4">
          <div className="flex justify-between font-bold text-white">
            <span>Total Frete:</span>
            <span className="text-cyan-400">R$ {shippingCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
