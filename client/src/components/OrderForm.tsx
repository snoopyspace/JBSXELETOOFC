import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

interface OrderFormProps {
  cart: CartItem[];
  onSubmit: (orderData: any) => void;
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
      { installments: 13, fee: 12.70 },
      { installments: 14, fee: 13.38 },
      { installments: 15, fee: 14.05 },
      { installments: 16, fee: 14.72 },
      { installments: 17, fee: 15.38 },
      { installments: 18, fee: 16.03 },
    ],
    pix: 0.50,
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
      { installments: 13, fee: 12.90 },
      { installments: 14, fee: 13.58 },
      { installments: 15, fee: 14.25 },
      { installments: 16, fee: 14.92 },
      { installments: 17, fee: 15.58 },
      { installments: 18, fee: 16.23 },
    ],
    pix: 0.50,
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
    pix: 0.50,
  },
};

export default function OrderForm({ cart, onSubmit }: OrderFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [complement, setComplement] = useState("");
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingService, setShippingService] = useState("PAC");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [cardBrand, setCardBrand] = useState("visa_mastercard");
  const [cardType, setCardType] = useState("credit");
  const [installments, setInstallments] = useState("1");

  const cartSubtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  // Calculate fee based on payment method
  const calculateFee = () => {
    if (paymentMethod === "pix") {
      return 0;
    }

    const brandFees = CARD_FEES[cardBrand as keyof typeof CARD_FEES];
    if (!brandFees) return 0;

    if (cardType === "debit") {
      return brandFees.debit;
    }

    const installmentNum = parseInt(installments);
    const installmentFee = brandFees.credit_installments.find(
      (i) => i.installments === installmentNum
    );
    return installmentFee?.fee || 0;
  };

  const fee = calculateFee();
  const feeAmount = (cartSubtotal * fee) / 100;
  const total = cartSubtotal + feeAmount + shippingCost;

  const handleSearchCep = async () => {
    if (!cep.trim() || cep.length < 8) {
      toast.error("CEP inválido!");
      return;
    }

    setIsLoadingCep(true);
    try {
      // Using ViaCEP API (free public API)
      const response = await axios.get(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);

      if (response.data.erro) {
        toast.error("CEP não encontrado!");
        return;
      }

      setAddress(response.data.logradouro || "");
      setCity(response.data.localidade || "");
      setState(response.data.uf || "");
      
      // Calculate shipping options
      const totalWeight = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const options = [
        {
          service: "SEDEX",
          price: 45.5 + (totalWeight * 5),
          days: 2,
        },
        {
          service: "PAC",
          price: 25.0 + (totalWeight * 3),
          days: 5,
        },
        {
          service: "Mini Envios",
          price: 15.0 + (totalWeight * 2),
          days: 7,
        },
      ];
      
      setShippingOptions(options);
      setSelectedShipping(options[1]);
      setShippingCost(options[1].price);
      setShippingService(options[1].service);
      
      toast.success("Endereço encontrado! Escolha uma opção de frete.");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
      console.error(error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim() || !cep.trim()) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    if (!termsAccepted) {
      toast.error("Você deve aceitar os Termos de Aceite e Política de Troca para continuar!");
      return;
    }

    if (cart.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }

    const orderData = {
      name,
      email,
      phone,
      cpf,
      cep,
      address,
      city,
      state,
      complement,
      paymentMethod,
      cardBrand: paymentMethod === "card" ? cardBrand : null,
      cardType: paymentMethod === "card" ? cardType : null,
      installments: paymentMethod === "card" ? parseInt(installments) : null,
      cartSubtotal,
      shippingCost,
      shippingService,
      fee,
      feeAmount,
      total,
      cart,
      termsAccepted: termsAccepted,
    };

    onSubmit(orderData);
  };

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-cyan-400">Faça seu Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-cyan-400 mb-4">Informações Pessoais</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-200">Nome Completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-200">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(85) 99999-9999"
                    className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cpf" className="text-slate-200">CPF *</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="000.000.000-00"
                  className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold text-cyan-400 mb-4">Endereço de Entrega</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="cep" className="text-slate-200">CEP *</Label>
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleSearchCep}
                    disabled={isLoadingCep}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
                  >
                    {isLoadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-slate-200">Endereço *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número"
                  className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="complement" className="text-slate-200">Complemento</Label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto, bloco, etc"
                  className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-slate-200">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Fortaleza"
                    className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-slate-200">Estado</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CE"
                    className="mt-1 bg-slate-700 border-cyan-500/30 text-white placeholder:text-slate-500"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          {shippingOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-cyan-400 mb-4">Opções de Frete</h3>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.service}
                    onClick={() => {
                      setSelectedShipping(option);
                      setShippingCost(option.price);
                      setShippingService(option.service);
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedShipping?.service === option.service
                        ? "border-cyan-400 bg-slate-700 shadow-lg shadow-cyan-500/30"
                        : "border-cyan-500/20 bg-slate-800 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{option.service}</p>
                        <p className="text-sm text-slate-400">Entrega em {option.days} dia(s)</p>
                      </div>
                      <p className="text-lg font-bold text-cyan-400">R$ {option.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-cyan-400 mb-4">Forma de Pagamento</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod" className="text-slate-200">Selecione a forma de pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1 bg-slate-700 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-cyan-500/30">
                    <SelectItem value="pix" className="text-white">Pix (0,50% de taxa)</SelectItem>
                    <SelectItem value="card" className="text-white">Cartão de Crédito/Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "card" && (
                <>
                  <div>
                    <Label htmlFor="cardBrand" className="text-slate-200">Bandeira do Cartão</Label>
                    <Select value={cardBrand} onValueChange={setCardBrand}>
                      <SelectTrigger className="mt-1 bg-slate-700 border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-cyan-500/30">
                        <SelectItem value="visa_mastercard" className="text-white">Visa / Mastercard</SelectItem>
                        <SelectItem value="elo_hipercard_amex" className="text-white">Elo / Hipercard / Amex</SelectItem>
                        <SelectItem value="other_cards" className="text-white">Outros Cartões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cardType" className="text-slate-200">Tipo de Cartão</Label>
                    <Select value={cardType} onValueChange={setCardType}>
                      <SelectTrigger className="mt-1 bg-slate-700 border-cyan-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-cyan-500/30">
                        <SelectItem value="debit" className="text-white">Débito</SelectItem>
                        <SelectItem value="credit" className="text-white">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {cardType === "credit" && (
                    <div>
                      <Label htmlFor="installments" className="text-slate-200">Parcelamento</Label>
                      <Select value={installments} onValueChange={setInstallments}>
                        <SelectTrigger className="mt-1 bg-slate-700 border-cyan-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-cyan-500/30 max-h-64">
                          {CARD_FEES[cardBrand as keyof typeof CARD_FEES].credit_installments.map((inst) => (
                            <SelectItem key={inst.installments} value={inst.installments.toString()} className="text-white">
                              {inst.installments}x de R$ {(total / inst.installments).toFixed(2)} ({inst.fee}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Fee Summary */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span>R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Taxa ({fee}%):</span>
                    <span>R$ {feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-cyan-500/30 pt-2 flex justify-between font-bold text-cyan-400">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-pink-500/20 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
                <span className="font-semibold text-white">Li e concordo com os Termos de Aceite e Política de Troca, Devolução e Garantia</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <a
                    href="/termos-aceite.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Termos de Aceite
                  </a>
                  <a
                    href="/politica-troca.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Política de Troca
                  </a>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!termsAccepted}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Realizar Pedido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
