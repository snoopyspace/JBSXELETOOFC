import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Menu, X, LogIn, Instagram, MessageCircle, Calculator, Search, FileText, Shield, Award, Headphones, Star, ChevronRight, Zap, CheckCircle, Eye, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import UnifiedCalculator from "@/components/UnifiedCalculator";
import ProductCarousel from "@/components/ProductCarousel";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  image: string | null;
  categoryId: number | null;
}

interface CartItem extends Product {
  quantity: number;
}

// Taxa por bandeira de cartão (mesmas do pedido)
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

export default function Home() {
  const [, setLocation] = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculadora de Taxa de Pagamento
  const [paymentMethodCalc, setPaymentMethodCalc] = useState("pix");
  const [cardBrandCalc, setCardBrandCalc] = useState("visa_mastercard");
  const [cardTypeCalc, setCardTypeCalc] = useState("credit");
  const [installmentsCalc, setInstallmentsCalc] = useState("1");
  const [amountCalc, setAmountCalc] = useState("");

  // Formulário de Cotação
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotationForm, setQuotationForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    productDescription: "",
  });

  // SEO - definir título da página
  useEffect(() => {
    document.title = "JBSX Eletro - Eletrônicos Premium e Importados";
  }, []);

  // Fetch categories
  const categoriesQuery = trpc.categories.list.useQuery();

  // Fetch products
  const productsQuery = trpc.products.list.useQuery();

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data);
      filterProducts(selectedCategory, productsQuery.data);
    }
  }, [productsQuery.data, selectedCategory]);

  const filterProducts = (categoryId: number | null, productList: Product[], query?: string) => {
    const q = (query ?? searchQuery).toLowerCase().trim();
    let filtered = categoryId === null ? productList : productList.filter((p) => p.categoryId === categoryId);
    if (q) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    setFilteredProducts(filtered);
  };

  // Re-filter when search changes
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    filterProducts(selectedCategory, products, q);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setMobileMenuOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
    setShowCart(true);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Salvar carrinho em sessionStorage sempre que mudar
  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem("jbsx_cart", JSON.stringify(cart));
    } else {
      sessionStorage.removeItem("jbsx_cart");
    }
  }, [cart]);

  const handleCheckout = () => {
    sessionStorage.setItem("jbsx_cart", JSON.stringify(cart));
    setLocation("/checkout");
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  // Formatar preço em padrão brasileiro
  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Calcular taxa de pagamento
  const calculatePaymentFee = () => {
    if (paymentMethodCalc === "pix") {
      return 0.50;
    }

    const brandFees = CARD_FEES[cardBrandCalc as keyof typeof CARD_FEES];
    if (!brandFees) return 0;

    if (cardTypeCalc === "debit") {
      return brandFees.debit;
    }

    const installmentNum = parseInt(installmentsCalc);
    const installmentFee = brandFees.credit_installments.find(
      (i) => i.installments === installmentNum
    );
    return installmentFee?.fee || 0;
  };

  const feePercentage = calculatePaymentFee();
  const amountValue = parseFloat(amountCalc) || 0;
  const feeAmount = (amountValue * feePercentage) / 100;
  const totalWithFee = amountValue + feeAmount;

  // Enviar Cotação via WhatsApp
  const handleSubmitQuotation = () => {
    if (!quotationForm.name || !quotationForm.email || !quotationForm.phone || !quotationForm.productDescription) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const mensagem = `
Olá! Gostaria de solicitar uma cotação:

*Dados do Cliente:*
Nome: ${quotationForm.name}
Email: ${quotationForm.email}
Telefone: ${quotationForm.phone}
Endereço: ${quotationForm.address || "Não informado"}

*Produto Procurado:*
${quotationForm.productDescription}

Aguardo retorno!
    `.trim();

    const whatsappUrl = `https://wa.me/558591751934?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");

    setQuotationForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      productDescription: "",
    });
    setShowQuotationForm(false);
    toast.success("Cotação enviada via WhatsApp!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663411798042/4ufiTAguMpYft9f8JCRftq/icon-48x48_aefadb0d.png"
              alt="JBSX Eletro"
              className="w-10 h-10 rounded-lg"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              JBSX Eletro
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-slate-800 border-cyan-500/30 text-white placeholder:text-slate-500 w-full"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={() => setLocation("/admin")}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-cyan-400"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 bg-slate-900">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 bg-slate-800 border-cyan-500/30 text-white placeholder:text-slate-500 w-full"
                />
              </div>
              <Button
                onClick={() => handleCategorySelect(null)}
                variant={selectedCategory === null ? "default" : "ghost"}
                className="w-full justify-start bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
              >
                Todos os Produtos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start text-slate-200 hover:text-cyan-400"
                >
                  {category.name}
                </Button>
              ))}
              <Button
                onClick={() => setLocation("/admin")}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO SECTION - Compacto ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                Eletrônicos Premium e Importados
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Compra Segura</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Award className="w-4 h-4 text-pink-400" />
                <span>Qualidade Premium</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Garantia</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </section>

      {/* ===== CARROSSEL DE DESTAQUES ===== */}
      <div id="products-section">
        <ProductCarousel onAddToCart={handleAddToCart} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-2">
              <h2 className="text-lg font-bold text-cyan-400 mb-4">Categorias</h2>
              <Button
                onClick={() => handleCategorySelect(null)}
                variant={selectedCategory === null ? "default" : "ghost"}
                className="w-full justify-start bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
              >
                Todos os Produtos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start text-slate-200 hover:text-cyan-400"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-2xl hover:shadow-cyan-500/30 transition-all overflow-hidden flex flex-col h-full bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Product Image */}
                    <div
                      className="w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden flex items-center justify-center cursor-pointer"
                      onClick={() => setLocation(`/product/${product.id}`)}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-cyan-500/50" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3
                        className="font-semibold text-white line-clamp-2 mb-2 text-xs sm:text-sm cursor-pointer hover:text-cyan-400 transition-colors"
                        onClick={() => setLocation(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* Price and Stock */}
                      <div className="flex flex-col mb-2 mt-auto gap-1">
                        <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                          {formatBRL(parseFloat(product.price))}
                        </span>
                        {product.stock > 0 ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-400 text-slate-900 border-0 text-[10px] sm:text-xs w-fit">
                            Estoque
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white border-0 text-[10px] sm:text-xs w-fit">
                            Esgotado
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1.5">
                        <Button
                          onClick={() => setLocation(`/product/${product.id}`)}
                          variant="outline"
                          className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-semibold text-xs h-9 px-2"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 shrink-0" />
                          Detalhes
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold text-xs h-9 px-2"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1 shrink-0" />
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum produto encontrado nesta categoria.</p>
              </div>
            )}

            {/* Calculadora Unificada de Frete e Parcelamento */}
            <div className="mt-12 mb-12">
              <UnifiedCalculator />
            </div>

            {/* Produto Não Encontrado - Solicitar Cotação */}
            <div className="mt-12 mb-12">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Search className="w-24 h-24 text-cyan-400" />
                </div>
                <CardContent className="p-4 sm:p-8 relative z-10">
                  <div className="flex flex-col gap-2 mb-5">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                      Encomenda Internacional Premium
                    </h3>
                    <p className="text-base sm:text-lg font-semibold text-slate-200">
                      Traga o melhor da tecnologia global para suas mãos.
                    </p>
                  </div>
                  
                  <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
                    Importação legal sob encomenda, com fornecedores verificados, procedência conferida e suporte no Brasil.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {[
                      "Produtos originais e verificados",
                      "Importação legal sob encomenda",
                      "Cotação rápida da equipe",
                      "Entrega segura"
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-200">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-6 mb-6 py-4 border-y border-cyan-500/10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      🇺🇸 Estados Unidos
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      🇨🇳 China
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      🇵🇾 Paraguai
                    </span>
                  </div>

                  <Button
                    onClick={() => setShowQuotationForm(!showQuotationForm)}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-pink-500 hover:shadow-lg hover:shadow-cyan-500/50 text-white font-bold px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg"
                  >
                    {showQuotationForm ? "Fechar Formulário" : "Solicitar Cotação de Importação"}
                  </Button>

                  {/* Formulário de Cotação */}
                  {showQuotationForm && (
                    <div className="mt-6 p-4 sm:p-6 bg-slate-700/50 rounded-lg border border-pink-500/20 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Nome *</label>
                        <Input
                          placeholder="Seu nome"
                          value={quotationForm.name}
                          onChange={(e) => setQuotationForm({ ...quotationForm, name: e.target.value })}
                          className="bg-slate-700 border-cyan-500/30 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email *</label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={quotationForm.email}
                          onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                          className="bg-slate-700 border-cyan-500/30 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Telefone/WhatsApp *</label>
                        <Input
                          placeholder="(85) 99999-9999"
                          value={quotationForm.phone}
                          onChange={(e) => setQuotationForm({ ...quotationForm, phone: e.target.value })}
                          className="bg-slate-700 border-cyan-500/30 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Endereço</label>
                        <Input
                          placeholder="Seu endereço (opcional)"
                          value={quotationForm.address}
                          onChange={(e) => setQuotationForm({ ...quotationForm, address: e.target.value })}
                          className="bg-slate-700 border-cyan-500/30 text-white placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Descreva o produto que está procurando *</label>
                        <Textarea
                          placeholder="Ex: Processador Intel Core i7, 16GB RAM, SSD 512GB..."
                          value={quotationForm.productDescription}
                          onChange={(e) => setQuotationForm({ ...quotationForm, productDescription: e.target.value })}
                          className="bg-slate-700 border-cyan-500/30 text-white placeholder-slate-400 min-h-32"
                        />
                      </div>

                      <Button
                        onClick={handleSubmitQuotation}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:shadow-lg hover:shadow-pink-500/50 text-slate-900 font-semibold"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar Cotação via WhatsApp
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEÇÃO INSTITUCIONAL - Abaixo dos Produtos ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-y border-cyan-500/10 py-16 mt-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            <span className="text-white">Tecnologia Premium com </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Confiança e Credibilidade
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-4">
            Na JBSX Eletro, você encontra produtos de alta qualidade, marcas reconhecidas e a segurança de comprar com quem valoriza excelência e compromisso com o cliente.
          </p>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Trabalhamos com eletrônicos premium e produtos selecionados para oferecer desempenho, inovação e confiabilidade em cada compra. Nosso compromisso é entregar qualidade, transparência e um atendimento que transmite segurança do início ao fim.
          </p>

          {/* 4 Pilares */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Shield, color: "cyan", label: "Proteção total", sub: "Compra 100% segura" },
              { icon: Award, color: "pink", label: "Qualidade Premium", sub: "Marcas reconhecidas" },
              { icon: Star, color: "yellow", label: "Marcas Originais", sub: "Produtos verificados" },
              { icon: Headphones, color: "purple", label: "Atendimento", sub: "Suporte dedicado" },
            ].map(({ icon: Icon, color, label, sub }, i) => (
              <div key={i} className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-${color}-500/30 transition-colors`}>
                <div className={`w-12 h-12 rounded-full bg-${color}-500/10 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => {
                const productsSection = document.getElementById('products-section');
                productsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/40 text-slate-900 font-bold px-8 py-6 text-lg rounded-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Conheça Nossos Produtos
            </Button>
            <Button
              onClick={() => {
                const whatsappUrl = 'https://wa.me/558591751934?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20da%20JBSX%20Eletro.';
                window.open(whatsappUrl, '_blank');
              }}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-semibold px-8 py-6 text-lg rounded-xl transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Fale Conosco
            </Button>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO INSTAGRAM ===== */}
      <section className="bg-slate-900/50 border-y border-cyan-500/10 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Siga no Instagram</h3>
          </div>
          <p className="text-slate-400 mb-6 text-sm">
            Acompanhe nossas novidades, promoções e lançamentos no Instagram!
          </p>
          <a
            href="https://www.instagram.com/jbsxeletro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white font-bold hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-5 h-5" />
            @jbsxeletro
          </a>
        </div>
      </section>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full p-4 shadow-2xl hover:shadow-cyan-500/50 transition-shadow z-30"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cart.length}
          </span>
        </button>
      )}

      {/* Cart Drawer - Mobile */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setShowCart(false)}>
          <div
            className="absolute bottom-0 right-0 w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto border-t border-cyan-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-cyan-400">Seu Carrinho</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-700 rounded-lg text-cyan-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-cyan-500/20">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-cyan-400">{formatBRL(parseFloat(item.price))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-600 rounded text-cyan-400"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-600 rounded text-cyan-400"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-pink-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Total */}
              <div className="border-t border-cyan-500/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    {formatBRL(cartTotal)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold text-sm md:text-base py-2 md:py-3"
                >
                  Fazer Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar - Desktop */}
      {showCart && cart.length > 0 && (
        <div className="hidden md:block fixed right-0 top-0 h-screen w-96 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl z-40 overflow-y-auto border-l border-cyan-500/20">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400">Seu Carrinho</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-700 rounded-lg text-cyan-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-cyan-500/20">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{item.name}</p>
                    <p className="text-sm text-cyan-400">{formatBRL(parseFloat(item.price))}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-slate-600 rounded text-cyan-400 text-sm"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-slate-600 rounded text-cyan-400 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Total */}
            <div className="border-t border-cyan-500/20 pt-4 sticky bottom-0 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-white">Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-900 font-semibold text-sm md:text-base py-2 md:py-3"
              >
                Fazer Pedido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-950 to-slate-900 border-t border-cyan-500/20 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-cyan-500/20">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-3">
                JBSX Eletro
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Loja especializada em eletrônicos premium e produtos importados das melhores marcas do mundo, como DJI, Apple, Xiaomi, consoles e tecnologia de última geração.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-3">Contato</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>
                  <a
                    href="https://wa.me/558591751934"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    (85) 99175-1934
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:sac@jbsxeletro.com.br"
                    className="text-cyan-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    sac@jbsxeletro.com.br
                  </a>
                </p>
                <p>Segunda a sexta das 09h às 17h</p>
                <p className="mt-2">
                  Rua Ricardo Castro Macedo, 1907<br />
                  Loja 211 - Luciano Cavalcante<br />
                  Fortaleza / CE - CEP 60813-680
                </p>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-3">Empresa</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>CNPJ: 64.760.199/0001-39</p>
                <p>JOAO BOSCO SCARCELA ELETRONICOS E IMPORTACAO LTDA</p>
                <div className="flex gap-4 mt-4">
                  <a
                    href="https://www.instagram.com/jbsxeletro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2"
                    title="Instagram @jbsxeletro"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-xs">@jbsxeletro</span>
                  </a>
                  <a
                    href="https://wa.me/558591751934"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2"
                    title="WhatsApp: (85) 99175-1934"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">(85) 99175-1934</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Policies Links */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6 pb-6 border-b border-cyan-500/20 flex-wrap">
            <button
              onClick={() => setLocation("/politica-privacidade")}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-pink-400 transition-colors text-sm font-semibold cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Política de Privacidade
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLocation("/termos-uso")}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-pink-400 transition-colors text-sm font-semibold cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Termos de Uso
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLocation("/politica-envio")}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-pink-400 transition-colors text-sm font-semibold cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Política de Envio
            </button>
          </div>

          {/* CNPJ e Copyright */}
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-xs">
              JBSX Eletro &mdash; CNPJ: 64.760.199/0001-39 &mdash; Rua Ricardo Castro Macedo, 1907, Loja 211, Luciano Cavalcante, Fortaleza/CE
            </p>
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} JBSX Eletro. Todos os direitos reservados.
            </p>
            <p className="text-slate-600 text-xs">
              Desenvolvido por{" "}
              <a
                href="https://wa.me/5585999618245?text=ol%C3%A1%2C%20acabei%20de%20ver%20seu%20site%20JBLX%20e%20gostaria%20de%20um%20dev%20para%20meu%20projeto.%20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-pink-400 font-semibold transition-colors inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Vivale
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
