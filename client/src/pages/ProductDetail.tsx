import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, Play, Package,
  Truck, Shield, Share2, CheckCircle, FileText, Clock,
} from "lucide-react";
import ProductReviews from "@/components/ProductReviews";
import ProductQuestions from "@/components/ProductQuestions";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id ? parseInt(params.id) : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const { data: product, isLoading } = trpc.products.get.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allProducts } = trpc.products.list.useQuery();

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - JBSX Eletro`;
    }
    return () => { document.title = "JBSX Eletro - Eletrônicos Premium e Importados"; };
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-slate-600" />
        <p className="text-slate-400 text-lg">Produto não encontrado</p>
        <Button onClick={() => setLocation("/")} className="bg-cyan-500 text-slate-900">Voltar à Loja</Button>
      </div>
    );
  }

  // Build image gallery
  const allImages: string[] = [];
  if (product.image) allImages.push(product.image);
  if (product.gallery) {
    const gallery = product.gallery as string[];
    gallery.forEach((img) => { if (!allImages.includes(img)) allImages.push(img); });
  }

  const category = categories?.find((c) => c.id === product.categoryId);
  const relatedProducts = allProducts?.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  ).slice(0, 4);

  const isYouTube = product.videoUrl?.includes("youtube") || product.videoUrl?.includes("youtu.be");
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Voltar</span>
          </button>
          <h1 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-none">{product.name}</h1>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image/Video */}
            <div className="relative aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-cyan-500/10">
              {showVideo && product.videoUrl ? (
                <div className="w-full h-full">
                  {isYouTube ? (
                    <iframe
                      src={getYouTubeEmbedUrl(product.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={product.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                  )}
                </div>
              ) : allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-cyan-400" : "bg-white/40"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-slate-600" />
                </div>
              )}
            </div>

            {/* Thumbnails + Video button */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentImageIndex(i); setShowVideo(false); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    !showVideo && i === currentImageIndex ? "border-cyan-400" : "border-slate-700"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex items-center justify-center bg-slate-800 transition-colors ${
                    showVideo ? "border-pink-400" : "border-slate-700"
                  }`}
                >
                  <Play className="w-6 h-6 text-pink-400" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {category && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{category.name}</Badge>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{product.name}</h2>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(product.price))}
              </span>
            </div>
            {/* Produto original - Google Ads */}
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              Produto original com garantia do fabricante/importador
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Em estoque ({product.stock} unidades)
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Fora de estoque</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Descrição</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Weight */}
            {product.weight && parseFloat(product.weight) > 0 && (
              <p className="text-slate-400 text-sm">Peso: {product.weight} kg</p>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => {
                  // Add product to cart in sessionStorage and redirect to checkout
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                  };
                  const existingCart = sessionStorage.getItem("jbsx_cart");
                  let cart = [];
                  if (existingCart) {
                    try {
                      cart = JSON.parse(existingCart);
                    } catch { cart = []; }
                  }
                  const existingIndex = cart.findIndex((item: any) => item.id === product.id);
                  if (existingIndex >= 0) {
                    cart[existingIndex].quantity += 1;
                  } else {
                    cart.push(cartItem);
                  }
                  sessionStorage.setItem("jbsx_cart", JSON.stringify(cart));
                  setLocation("/checkout");
                }}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold py-6 text-lg rounded-xl hover:opacity-90 transition-opacity"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock > 0 ? "Fazer Pedido" : "Indisponível"}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Truck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-300 text-xs">Entrega para todo Brasil</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-slate-300 text-xs">Garantia de qualidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEÇÃO DE INFORMAÇÕES LEGAIS ===== */}
        <div className="mt-10 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Informações Legais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Nota Fiscal</p>
                <p className="text-slate-400 text-xs mt-1">Todos os produtos são emitidos com nota fiscal conforme legislação brasileira vigente.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <Shield className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Garantia</p>
                <p className="text-slate-400 text-xs mt-1">Conforme legislação vigente e especificação do fabricante/importador.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <Clock className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Prazo de Entrega</p>
                <p className="text-slate-400 text-xs mt-1">Brasil (exceto Fortaleza): 10 dias úteis. Fortaleza: 3 dias úteis (após 2 dias de faturamento).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <Truck className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Rastreamento</p>
                <p className="text-slate-400 text-xs mt-1">Código de rastreio enviado para todos os pedidos via e-mail e WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-slate-700/50 pt-8">
          <ProductReviews productId={productId} />
        </div>

        {/* Questions Section */}
        <div className="mt-12 border-t border-slate-700/50 pt-8">
          <ProductQuestions productId={productId} />
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-bold text-white">Produtos Relacionados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLocation(`/product/${p.id}`)}
                  className="bg-slate-800/80 rounded-xl overflow-hidden border border-cyan-500/10 hover:border-cyan-500/30 transition-all text-left group"
                >
                  <div className="aspect-square bg-slate-700/50 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-slate-600" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                    <p className="text-cyan-400 font-bold text-sm mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(p.price))}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
