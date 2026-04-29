import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Package } from "lucide-react";
import { PriceDisplay } from "@/components/PriceDisplay";

interface CarouselItem {
  id: number;
  productId: number;
  sortOrder: number;
  active: boolean;
  carouselTitle: string;
  product?: {
    id: number;
    name: string;
    price: string;
    stock: number;
    image: string | null;
    description: string | null;
    categoryId: number | null;
  } | null;
}

interface ProductCarouselProps {
  onAddToCart?: (product: { id: number; name: string; price: string; stock: number; image: string | null; description: string | null; categoryId: number | null; quantity: number }) => void;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function ProductCarousel({ onAddToCart }: ProductCarouselProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: items = [], isLoading } = trpc.carousel.listActive.useQuery();

  const visibleCount = typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : typeof window !== "undefined" && window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, items.length - visibleCount);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || items.length <= visibleCount) return;
    const interval = setInterval(goNext, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goNext, items.length, visibleCount]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) return null;

  const carouselTitle = items[0]?.carouselTitle || "Destaques mais visualizados";

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{carouselTitle}</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ transform: `translateX(calc(-${currentIndex * (100 / visibleCount)}% - ${currentIndex * 16 / visibleCount}px))` }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div
                key={item.id}
                className="flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 transition-all group"
                style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 16 / visibleCount}px)` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-700/50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-red-500/90 text-white border-0 text-sm">Esgotado</Badge>
                    </div>
                  )}
                  {product.stock > 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white border-0 text-xs">Em estoque</Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">{product.name}</h3>
                  <div className="mb-4">
                    <PriceDisplay
                      price={parseFloat(product.price)}
                      size="md"
                      showInstallment={true}
                      showWhatsAppLink={false}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                      onClick={() => setLocation(`/product/${product.id}`)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detalhes
                    </Button>
                    {product.stock > 0 && onAddToCart && (
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold text-xs hover:shadow-lg hover:shadow-cyan-500/30"
                        onClick={() => onAddToCart({ ...product, quantity: 1 })}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Comprar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      {items.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
              className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-cyan-400" : "w-2 bg-slate-600 hover:bg-slate-500"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
