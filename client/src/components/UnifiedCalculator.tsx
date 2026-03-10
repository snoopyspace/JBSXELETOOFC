import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Truck, CreditCard } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string | number;
  weight?: number;
  stock: number;
}

interface FreightResult {
  service: string;
  price: number;
  days: number;
}

// Taxa por bandeira de cartão
const CARD_FEES = {
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
    ],
  },
  elo_hipercard_amex: {
    name: "Elo / Hipercard / American Express",
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
    ],
  },
};

export default function UnifiedCalculator() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [destinationCep, setDestinationCep] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [freightResults, setFreightResults] = useState<FreightResult[]>([]);
  const [selectedFreight, setSelectedFreight] = useState<FreightResult | null>(null);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [cardBrand, setCardBrand] = useState("visa_mastercard");
  const [cardType, setCardType] = useState("credit");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Fetch products
  const productsQuery = trpc.products.list.useQuery();

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data as any);
    }
  }, [productsQuery.data]);

  const getSelectedProduct = (): Product | undefined => {
    return products.find((p) => p.id === parseInt(selectedProduct));
  };

  const calculateFreight = async () => {
    if (!selectedProduct || !destinationCep.trim()) {
      toast.error("Selecione um produto e informe o CEP de destino!");
      return;
    }

    const product = getSelectedProduct();
    if (!product) {
      toast.error("Produto não encontrado!");
      return;
    }

    if (!product.weight || product.weight === 0) {
      toast.error("Este produto não tem peso cadastrado!");
      return;
    }

    setLoading(true);
    try {
      // Simular cálculo de frete (em produção, usar API dos Correios)
      const mockFreightResults: FreightResult[] = [
        {
          service: "SEDEX",
          price: 45.5 + (product.weight || 0) * 5,
          days: 2,
        },
        {
          service: "PAC",
          price: 25.0 + (product.weight || 0) * 3,
          days: 5,
        },
        {
          service: "Mini Envios",
          price: 15.0 + (product.weight || 0) * 2,
          days: 7,
        },
      ];

      setFreightResults(mockFreightResults);
      setSelectedFreight(mockFreightResults[0]);
      toast.success("Frete calculado com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular frete");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const product = getSelectedProduct();
  const productPrice = product ? parseFloat(String(product.price)) : 0;
  const freightPrice = selectedFreight?.price || 0;
  const totalPrice = productPrice + freightPrice;
  const installmentValue = totalPrice / installments;

  // Calculate payment fee
  const calculateFee = () => {
    if (paymentMethod === "pix") {
      return 0.5;
    }

    const brandFees = CARD_FEES[cardBrand as keyof typeof CARD_FEES];
    if (!brandFees) return 0;

    if (cardType === "debit") {
      return brandFees.debit;
    }

    const installmentFee = brandFees.credit_installments.find(
      (i) => i.installments === installments
    );
    return installmentFee?.fee || 0;
  };

  const fee = calculateFee();
  const feeAmount = (totalPrice * fee) / 100;
  const finalTotal = totalPrice + feeAmount;

  return (
    <div className="w-full space-y-6">
      {/* Product Selection */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Calculadora de Frete e Parcelamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product-select" className="text-slate-200">
              Selecione um Produto *
            </Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                <SelectValue placeholder="Escolha um produto..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-cyan-500/30">
                {products.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id.toString()} className="text-white">
                    {prod.name} - R$ {parseFloat(String(prod.price)).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div className="p-4 bg-slate-700/50 rounded-lg border border-cyan-500/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Preço do Produto</p>
                  <p className="text-cyan-400 font-semibold">R$ {productPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Peso</p>
                  <p className="text-cyan-400 font-semibold">{product.weight || 0} kg</p>
                </div>
                <div>
                  <p className="text-slate-400">Estoque</p>
                  <p className="text-cyan-400 font-semibold">{product.stock} unidades</p>
                </div>
              </div>
            </div>
          )}

          {/* CEP Input */}
          <div className="space-y-2">
            <Label htmlFor="destination-cep" className="text-slate-200">
              CEP de Destino *
            </Label>
            <Input
              id="destination-cep"
              type="text"
              value={destinationCep}
              onChange={(e) => setDestinationCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="00000-000"
              className="bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
              maxLength={8}
            />
          </div>

          {/* Calculate Freight Button */}
          <Button
            onClick={calculateFreight}
            disabled={loading || !selectedProduct || !destinationCep}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold"
          >
            <Truck className="w-4 h-4 mr-2" />
            {loading ? "Calculando..." : "Calcular Frete"}
          </Button>

          {/* Freight Options */}
          {freightResults.length > 0 && (
            <div className="space-y-3">
              <Label className="text-slate-200">Opções de Frete</Label>
              <div className="space-y-2">
                {freightResults.map((freight, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFreight(freight)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedFreight?.service === freight.service
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{freight.service}</p>
                        <p className="text-slate-400 text-sm">{freight.days} dias úteis</p>
                      </div>
                      <p className="text-cyan-400 font-bold">R$ {freight.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Section */}
          {selectedFreight && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white font-semibold hover:border-pink-500/50 transition-all text-left flex items-center justify-between"
              >
                <span>💳 Calcular Taxa de Pagamento</span>
                <span>{showPaymentOptions ? "▼" : "▶"}</span>
              </button>

              {showPaymentOptions && (
                <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg border border-pink-500/20">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">Forma de Pagamento</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-cyan-500/30">
                        <SelectItem value="pix" className="text-white">Pix (Taxa: 0,50%)</SelectItem>
                        <SelectItem value="card" className="text-white">Cartão de Crédito/Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Card Options */}
                  {paymentMethod === "card" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-200">Bandeira do Cartão</Label>
                        <Select value={cardBrand} onValueChange={setCardBrand}>
                          <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-cyan-500/30">
                            <SelectItem value="visa_mastercard" className="text-white">Visa / Mastercard</SelectItem>
                            <SelectItem value="elo_hipercard_amex" className="text-white">Elo / Hipercard / Amex</SelectItem>
                            <SelectItem value="other_cards" className="text-white">Outros Cartões</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-200">Tipo de Cartão</Label>
                        <Select value={cardType} onValueChange={setCardType}>
                          <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-cyan-500/30">
                            <SelectItem value="debit" className="text-white">Débito</SelectItem>
                            <SelectItem value="credit" className="text-white">Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {cardType === "credit" && (
                        <div className="space-y-2">
                          <Label className="text-slate-200">Número de Parcelas</Label>
                          <Select value={installments.toString()} onValueChange={(v) => setInstallments(parseInt(v))}>
                            <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-cyan-500/30">
                              {CARD_FEES[cardBrand as keyof typeof CARD_FEES].credit_installments.map((opt) => (
                                <SelectItem key={opt.installments} value={opt.installments.toString()} className="text-white">
                                  {opt.installments}x (Taxa: {opt.fee}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Summary with Payment Fee */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Produto:</span>
                    <span className="text-white font-semibold">R$ {productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frete ({selectedFreight.service}):</span>
                    <span className="text-white font-semibold">R$ {freightPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white font-semibold">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  {showPaymentOptions && (
                    <div className="flex justify-between">
                      <span className="text-pink-400">Taxa ({paymentMethod === "pix" ? "Pix" : `${cardType === "debit" ? "Débito" : `Crédito ${installments}x`}`}):</span>
                      <span className="text-pink-400 font-semibold">{fee.toFixed(2)}% (R$ {feeAmount.toFixed(2)})</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-2 flex justify-between">
                    <span className="text-cyan-400 font-semibold">Total Final:</span>
                    <span className="text-cyan-400 font-bold text-lg">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
