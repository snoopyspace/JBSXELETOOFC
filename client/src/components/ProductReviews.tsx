import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Send, MessageSquare, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: number;
}

function StarRating({ rating, size = "sm", interactive = false, onChange }: {
  rating: number; size?: "sm" | "md" | "lg"; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-600 text-slate-600"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingDistribution({ distribution, total }: {
  distribution: Record<number, number>; total: number;
}) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 w-3 text-right">{star}</span>
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-slate-500 w-8 text-right text-xs">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "best" | "worst">("recent");
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: reviews, refetch: refetchReviews } = trpc.reviews.byProduct.useQuery({ productId });
  const { data: stats, refetch: refetchStats } = trpc.reviews.stats.useQuery({ productId });
  const createReview = trpc.reviews.create.useMutation();

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    let filtered = [...reviews];
    if (filterStars) filtered = filtered.filter((r) => r.rating === filterStars);
    switch (sortBy) {
      case "best": return filtered.sort((a, b) => b.rating - a.rating);
      case "worst": return filtered.sort((a, b) => a.rating - b.rating);
      default: return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [reviews, sortBy, filterStars]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (rating === 0) { toast.error("Selecione uma nota de 1 a 5 estrelas"); return; }
    if (comment.trim() && comment.trim().length < 5) { toast.error("Comentário deve ter pelo menos 5 caracteres"); return; }
    setSubmitting(true);
    try {
      await createReview.mutateAsync({
        productId, customerName: name.trim(), rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Avaliação enviada! Será publicada após moderação.");
      setName(""); setRating(0); setComment(""); setShowForm(false);
      refetchReviews(); refetchStats();
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar avaliação");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          Avaliações dos clientes
        </h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold"
        >
          <Star className="w-4 h-4 mr-2" />
          {showForm ? "Cancelar" : "Enviar avaliação"}
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="bg-slate-800/60 rounded-xl p-4 sm:p-6 border border-cyan-500/10">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
              <span className="text-4xl font-bold text-white">{stats.average}</span>
              <StarRating rating={Math.round(stats.average)} size="md" />
              <span className="text-sm text-slate-400 mt-1">{stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}</span>
            </div>
            <div className="flex-1">
              <RatingDistribution distribution={stats.distribution} total={stats.total} />
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="bg-slate-800/80 rounded-xl p-4 sm:p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            Sua avaliação será moderada antes da publicação
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Seu nome *</label>
            <Input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome" maxLength={100}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Nota *</label>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Comentário (opcional)</label>
            <Textarea
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência com o produto..."
              rows={3} maxLength={1000}
              className="bg-slate-700/50 border-slate-600 text-white resize-none"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting}
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold w-full sm:w-auto">
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </div>
      )}

      {/* Filters & Sort */}
      {reviews && reviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-1.5"
          >
            <option value="recent">Mais recentes</option>
            <option value="best">Melhor avaliados</option>
            <option value="worst">Piores avaliados</option>
          </select>
          <button
            onClick={() => setFilterStars(null)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filterStars === null ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-800 border-slate-600 text-slate-400"
            }`}
          >Todas</button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s} onClick={() => setFilterStars(s === filterStars ? null : s)}
              className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-1 transition-colors ${
                filterStars === s ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : "bg-slate-800 border-slate-600 text-slate-400"
              }`}
            >
              {s} <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Star className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>{filterStars ? "Nenhuma avaliação com essa nota" : "Nenhuma avaliação ainda. Seja o primeiro!"}</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{review.customerName}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
              {review.comment && <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>}
              {review.adminResponse && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-cyan-500/30 space-y-1">
                  <p className="text-xs text-cyan-400 font-semibold">Resposta da JBSX Eletro</p>
                  <p className="text-slate-300 text-sm">{review.adminResponse}</p>
                  {review.adminResponseAt && (
                    <p className="text-xs text-slate-500">
                      {new Date(review.adminResponseAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
