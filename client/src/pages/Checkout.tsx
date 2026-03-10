import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import OrderForm from "@/components/OrderForm";

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get cart from sessionStorage
    const cartData = sessionStorage.getItem("jbsx_cart");
    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch (error) {
        console.error("Failed to parse cart:", error);
        setCart([]);
      }
    }
    setIsLoading(false);
  }, []);

  const handleOrderSubmit = (orderData: any) => {
    // Format cart items for WhatsApp
    const cartText = orderData.cart
      .map((item: CartItem) => `• ${item.name} (x${item.quantity}) - R$ ${(parseFloat(item.price) * item.quantity).toFixed(2)}`)
      .join("\n");

    // Format payment method
    let paymentText = "";
    let installmentDetails = "";
    if (orderData.paymentMethod === "pix") {
      paymentText = "Pix (Taxa: 0,50%)";
    } else {
      const brandNames: Record<string, string> = {
        visa_mastercard: "Visa / Mastercard",
        elo_hipercard_amex: "Elo / Hipercard / Amex",
        other_cards: "Outros Cartões",
      };
      const cardTypeText = orderData.cardType === "debit" ? "Débito" : `Crédito ${orderData.installments}x`;
      paymentText = `${brandNames[orderData.cardBrand]} - ${cardTypeText} (Taxa: ${orderData.fee}%)`;
      
      // Add installment details if credit card with installments
      if (orderData.cardType === "credit" && orderData.installments > 1) {
        const installmentValue = orderData.total / orderData.installments;
        installmentDetails = `\n\n*Detalhes do Parcelamento:*\nNúmero de Parcelas: ${orderData.installments}x\nValor de Cada Parcela: R$ ${installmentValue.toFixed(2)}`;
      }
    }

    // Create WhatsApp message
    const message = `
*NOVO PEDIDO - JBSX ELETRO*

*Dados do Cliente:*
Nome: ${orderData.name}
CPF: ${orderData.cpf || "Não informado"}
Email: ${orderData.email || "Não informado"}
Telefone: ${orderData.phone}

*Endereço de Entrega:*
${orderData.address}
${orderData.complement ? `Complemento: ${orderData.complement}\n` : ""}CEP: ${orderData.cep}
${orderData.city ? `Cidade: ${orderData.city}\n` : ""}${orderData.state ? `Estado: ${orderData.state}` : ""}

*Produtos:*
${cartText}

*Valores:*
Subtotal: R$ ${orderData.cartSubtotal.toFixed(2)}
Frete (${orderData.shippingService || "PAC"}): R$ ${(orderData.shippingCost || 0).toFixed(2)}
Taxa (${orderData.fee}%): R$ ${orderData.feeAmount.toFixed(2)}
*Total: R$ ${orderData.total.toFixed(2)}*

*Forma de Pagamento:*
${paymentText}${installmentDetails}

*Aceite de Termos:*
✔ Cliente declara ter lido e aceito os Termos de Aceite e Política de Troca, Devolução e Garantia da JBSX Eletro
    `.trim();

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    // Using the new number: +55 85 91751934
    const whatsappUrl = `https://wa.me/558591751934?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Clear cart
    sessionStorage.removeItem("jbsx_cart");
    setCart([]);
    toast.success("Pedido enviado para WhatsApp!");

    // Redirect to home after 2 seconds
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-cyan-400">Carregando...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setLocation("/")}
            className="mb-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Catálogo
          </Button>
          <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardContent className="p-12 text-center">
              <p className="text-slate-400 mb-4">Seu carrinho está vazio!</p>
              <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
                Continuar Comprando
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => setLocation("/")}
          className="mb-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Catálogo
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="md:col-span-2">
            <OrderForm cart={cart} onSubmit={handleOrderSubmit} />
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4 border-cyan-500/20 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardHeader>
                <CardTitle className="text-cyan-400">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-slate-700 pb-2">
                      <span className="text-slate-300">
                        {item.name} (x{item.quantity})
                      </span>
                      <span className="font-semibold text-cyan-400">
                        R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cyan-500/20 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-200">Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                      R$ {cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-950 to-slate-900 border-t border-cyan-500/20 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">
            Desenvolvido por{" "}
            <a
              href="https://wa.me/5585999618245?text=ol%C3%A1%2C%20acabei%20de%20ver%20seu%20site%20jbsx%20e%20gostaria%20de%20seus%20servi%C3%A7os%20de%20dev."
              className="text-cyan-400 hover:text-pink-400 font-semibold transition-colors"
            >
              Vivale
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
