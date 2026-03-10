import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Send, CheckCircle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

interface ProductQuestionsProps {
  productId: number;
}

export default function ProductQuestions({ productId }: ProductQuestionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: questions, refetch } = trpc.questions.byProduct.useQuery({ productId });
  const createQuestion = trpc.questions.create.useMutation();

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (!question.trim() || question.trim().length < 5) { toast.error("Pergunta deve ter pelo menos 5 caracteres"); return; }
    setSubmitting(true);
    try {
      await createQuestion.mutateAsync({
        productId, customerName: name.trim(), question: question.trim(),
      });
      toast.success("Pergunta enviada! Aguarde a resposta do administrador.");
      setName(""); setQuestion(""); setShowForm(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar pergunta");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-pink-400" />
          Perguntas sobre este produto
        </h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {showForm ? "Cancelar" : "Enviar pergunta"}
        </Button>
      </div>

      {/* Question Form */}
      {showForm && (
        <div className="bg-slate-800/80 rounded-xl p-4 sm:p-6 border border-pink-500/20 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4 text-pink-400" />
            O administrador responderá sua pergunta em breve
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
            <label className="text-sm text-slate-300 mb-1 block">Sua pergunta *</label>
            <Textarea
              value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="O que você gostaria de saber sobre este produto?"
              rows={3} maxLength={1000}
              className="bg-slate-700/50 border-slate-600 text-white resize-none"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting}
            className="bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold w-full sm:w-auto">
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Enviando..." : "Enviar pergunta"}
          </Button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {!questions || questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p>Nenhuma pergunta ainda. Seja o primeiro a perguntar!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 space-y-3">
              {/* Question */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {q.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{q.customerName}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(q.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  {q.status === "answered" ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Respondido pelo administrador
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Aguardando resposta
                    </Badge>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed pl-12">{q.question}</p>
              </div>

              {/* Answer */}
              {q.adminResponse && (
                <div className="ml-4 pl-4 border-l-2 border-pink-500/30 space-y-1">
                  <p className="text-xs text-pink-400 font-semibold">Resposta da JBSX Eletro</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{q.adminResponse}</p>
                  {q.adminResponseAt && (
                    <p className="text-xs text-slate-500">
                      {new Date(q.adminResponseAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
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
