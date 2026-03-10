import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Plus, Trash2, Edit2, Package, ShoppingCart, Settings, FolderTree,
  BarChart3, Menu, X, ArrowLeft, Upload, Video, Image as ImageIcon,
  Eye, ChevronDown, ChevronUp, Search, Home, TrendingUp,
  Star, MessageSquare, CheckCircle, XCircle, Clock, Send, HelpCircle,
  LogIn, LogOut, Lock, CreditCard, Truck, DollarSign, Percent, ShieldAlert,
} from "lucide-react";

type Tab = "dashboard" | "categories" | "products" | "orders" | "abc" | "reviews" | "settings";

const statusLabels: Record<string, string> = {
  pending: "Pendente", confirmed: "Confirmado", shipped: "Enviado",
  delivered: "Entregue", cancelled: "Cancelado",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Manus OAuth auth
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stock: "0", weight: "0",
    image: "", videoUrl: "", categoryId: 0, gallery: [] as string[],
  });

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  // Settings forms - shipping
  const [shippingForm, setShippingForm] = useState({ baseCost: "", costPerKg: "", freeShippingThreshold: "" });
  // Settings forms - payment fees (multiple card types)
  const [paymentFeeForm, setPaymentFeeForm] = useState({ cardType: "", label: "", feePercentage: "", minFee: "", maxFee: "" });
  const [editingFeeId, setEditingFeeId] = useState<number | null>(null);
  const [showFeeForm, setShowFeeForm] = useState(false);

  // Order detail
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Queries
  const { data: products, refetch: refetchProducts } = trpc.products.list.useQuery(undefined, { enabled: isAdmin });
  const { data: categories, refetch: refetchCategories } = trpc.categories.list.useQuery(undefined, { enabled: isAdmin });
  const { data: orders, refetch: refetchOrders } = trpc.orders.list.useQuery(undefined, { enabled: isAdmin });
  const { data: shippingConfig } = trpc.shippingConfig.get.useQuery(undefined, { enabled: isAdmin });
  const { data: paymentFeeConfig } = trpc.paymentFeeConfig.get.useQuery(undefined, { enabled: isAdmin });
  const { data: allPaymentFees, refetch: refetchPaymentFees } = trpc.paymentFeeConfig.getAll.useQuery(undefined, { enabled: isAdmin });
  const { data: allReviews, refetch: refetchReviews } = trpc.reviews.all.useQuery(undefined, { enabled: isAdmin });
  const { data: allQuestions, refetch: refetchQuestions } = trpc.questions.all.useQuery(undefined, { enabled: isAdmin });

  // Init settings forms when data loads
  useEffect(() => {
    if (shippingConfig) {
      setShippingForm({
        baseCost: shippingConfig.baseCost || "",
        costPerKg: shippingConfig.costPerKg || "",
        freeShippingThreshold: shippingConfig.freeShippingThreshold || "",
      });
    }
  }, [shippingConfig]);

  // No longer need to init paymentFeeForm from single config

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Produto criado!"); resetProductForm(); refetchProducts(); },
    onError: (e) => toast.error(e.message),
  });
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => { toast.success("Produto atualizado!"); resetProductForm(); refetchProducts(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success("Produto deletado!"); refetchProducts(); },
    onError: (e) => toast.error(e.message),
  });
  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); resetCategoryForm(); refetchCategories(); },
    onError: (e) => toast.error(e.message),
  });
  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => { toast.success("Categoria atualizada!"); resetCategoryForm(); refetchCategories(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => { toast.success("Categoria deletada!"); refetchCategories(); },
    onError: (e) => toast.error(e.message),
  });
  const updateOrderMutation = trpc.orders.update.useMutation({
    onSuccess: () => { toast.success("Pedido atualizado!"); refetchOrders(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => { toast.success("Pedido deletado!"); refetchOrders(); },
    onError: (e) => toast.error(e.message),
  });
  const uploadImageMutation = trpc.upload.image.useMutation();
  const updateShippingMutation = trpc.shippingConfig.update.useMutation({
    onSuccess: () => toast.success("Configuração de frete salva!"),
    onError: (e) => toast.error(e.message),
  });
  const createPaymentFeeMutation = trpc.paymentFeeConfig.create.useMutation({
    onSuccess: () => { toast.success("Taxa criada!"); resetFeeForm(); refetchPaymentFees(); },
    onError: (e) => toast.error(e.message),
  });
  const updatePaymentFeeMutation = trpc.paymentFeeConfig.update.useMutation({
    onSuccess: () => { toast.success("Taxa atualizada!"); resetFeeForm(); refetchPaymentFees(); },
    onError: (e) => toast.error(e.message),
  });
  const deletePaymentFeeMutation = trpc.paymentFeeConfig.delete.useMutation({
    onSuccess: () => { toast.success("Taxa removida!"); refetchPaymentFees(); },
    onError: (e) => toast.error(e.message),
  });
  const updateReviewStatusMutation = trpc.reviews.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetchReviews(); },
    onError: (e) => toast.error(e.message),
  });
  const respondReviewMutation = trpc.reviews.respond.useMutation({
    onSuccess: () => { toast.success("Resposta enviada!"); refetchReviews(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteReviewMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => { toast.success("Avaliação excluída!"); refetchReviews(); },
    onError: (e) => toast.error(e.message),
  });
  const respondQuestionMutation = trpc.questions.respond.useMutation({
    onSuccess: () => { toast.success("Resposta enviada!"); refetchQuestions(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteQuestionMutation = trpc.questions.delete.useMutation({
    onSuccess: () => { toast.success("Pergunta excluída!"); refetchQuestions(); },
    onError: (e) => toast.error(e.message),
  });

  // Review/Question response state
  const [reviewResponseId, setReviewResponseId] = useState<number | null>(null);
  const [reviewResponseText, setReviewResponseText] = useState("");
  const [questionResponseId, setQuestionResponseId] = useState<number | null>(null);
  const [questionResponseText, setQuestionResponseText] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");
  const [questionFilter, setQuestionFilter] = useState<"all" | "pending" | "answered">("all");

  // Order filter
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled">("all");

  const resetProductForm = () => {
    setProductForm({ name: "", description: "", price: "", stock: "0", weight: "0", image: "", videoUrl: "", categoryId: 0, gallery: [] });
    setShowProductForm(false);
    setEditingProductId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "" });
    setShowCategoryForm(false);
    setEditingCategoryId(null);
  };

  // File upload handler
  const handleFileUpload = useCallback(async (file: File, type: "image" | "video"): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          if (type === "image") {
            const result = await uploadImageMutation.mutateAsync({ base64, filename: file.name });
            resolve(result.url);
          } else {
            const base64Data = base64.split(',')[1] || base64;
            const response = await fetch('/api/trpc/upload.video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ json: { base64: base64Data, filename: file.name } }),
            });
            const data = await response.json();
            if (data.result?.data?.json?.url) {
              resolve(data.result.data.json.url);
            } else {
              toast.error("Erro no upload do vídeo");
              resolve(null);
            }
          }
        } catch {
          toast.error(`Erro no upload`);
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [uploadImageMutation]);

  // ABC Curve calculation
  const abcData = useMemo(() => {
    if (!products || !orders) return [];
    const productRevenue: Record<number, { name: string; revenue: number; quantity: number }> = {};
    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      const items = order.items as Array<{ id: number; name: string; price: string; quantity: number }>;
      items?.forEach((item) => {
        if (!productRevenue[item.id]) {
          productRevenue[item.id] = { name: item.name, revenue: 0, quantity: 0 };
        }
        productRevenue[item.id].revenue += parseFloat(item.price) * item.quantity;
        productRevenue[item.id].quantity += item.quantity;
      });
    });
    const sorted = Object.entries(productRevenue)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);
    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.revenue;
      const percentage = totalRevenue > 0 ? (cumulative / totalRevenue) * 100 : 0;
      const classification = percentage <= 80 ? "A" : percentage <= 95 ? "B" : "C";
      return { ...item, percentage: (item.revenue / totalRevenue) * 100, cumulative: percentage, classification };
    });
  }, [products, orders]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  // ===== LOGIN / ACCESS SCREEN =====
  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-slate-400 text-sm mt-2">JBSX Eletro - Acesso Restrito</p>
          </div>

          <Card className="bg-slate-900/80 border-cyan-500/20">
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-300 text-sm text-center">Faça login com sua conta Manus para acessar o painel administrativo.</p>
              <Button
                onClick={() => { window.location.href = getLoginUrl(); }}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 text-slate-900 font-bold py-5 text-base rounded-xl transition-all"
              >
                <LogIn className="w-5 h-5 mr-2" /> Entrar com Manus
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="w-full mt-4 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a Loja
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-4">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-slate-400 text-sm mb-2">Olá, {user?.name || "usuário"}!</p>
          <p className="text-slate-500 text-sm mb-6">Sua conta não possui permissão de administrador.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a Loja
            </Button>
            <Button onClick={() => logout()} variant="ghost" className="text-red-400 hover:text-red-300">
              <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN PANEL =====
  const navItems = [
    { id: "dashboard" as Tab, label: "Painel", icon: Home },
    { id: "categories" as Tab, label: "Categorias", icon: FolderTree },
    { id: "products" as Tab, label: "Produtos", icon: Package },
    { id: "orders" as Tab, label: "Pedidos", icon: ShoppingCart },
    { id: "abc" as Tab, label: "Curva ABC", icon: BarChart3 },
    { id: "reviews" as Tab, label: "Avaliações", icon: Star },
    { id: "settings" as Tab, label: "Config", icon: Settings },
  ];

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: String(product.stock),
      weight: product.weight || "0",
      image: product.image || "",
      videoUrl: product.videoUrl || "",
      categoryId: product.categoryId || 0,
      gallery: product.gallery || [],
    });
    setShowProductForm(true);
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, description: cat.description || "" });
    setShowCategoryForm(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    const data = {
      name: productForm.name,
      description: productForm.description || undefined,
      price: productForm.price,
      stock: parseInt(productForm.stock) || 0,
      weight: productForm.weight || "0",
      image: productForm.image || undefined,
      videoUrl: productForm.videoUrl || undefined,
      gallery: productForm.gallery.length > 0 ? productForm.gallery : undefined,
      categoryId: productForm.categoryId || undefined,
    };
    if (editingProductId) {
      updateProductMutation.mutate({ id: editingProductId, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, ...categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleImageUploadForProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info("Enviando imagem...");
    const url = await handleFileUpload(file, "image");
    if (url) {
      setProductForm((prev) => ({ ...prev, image: url }));
      toast.success("Imagem principal enviada!");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    toast.info(`Enviando ${files.length} imagem(ns)...`);
    for (const file of Array.from(files)) {
      const url = await handleFileUpload(file, "image");
      if (url) {
        setProductForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
      }
    }
    toast.success("Galeria atualizada!");
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Vídeo deve ter no máximo 50MB");
      return;
    }
    toast.info("Enviando vídeo...");
    const url = await handleFileUpload(file, "video");
    if (url) {
      setProductForm((prev) => ({ ...prev, videoUrl: url }));
      toast.success("Vídeo enviado!");
    }
  };

  const removeGalleryImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSaveShipping = () => {
    updateShippingMutation.mutate({
      baseCost: shippingForm.baseCost || undefined,
      costPerKg: shippingForm.costPerKg || undefined,
      freeShippingThreshold: shippingForm.freeShippingThreshold || undefined,
    });
  };

  const resetFeeForm = () => {
    setPaymentFeeForm({ cardType: "", label: "", feePercentage: "", minFee: "", maxFee: "" });
    setEditingFeeId(null);
    setShowFeeForm(false);
  };

  const handleSavePaymentFee = () => {
    if (!paymentFeeForm.cardType || !paymentFeeForm.label || !paymentFeeForm.feePercentage) {
      toast.error("Preencha tipo, nome e percentual da taxa");
      return;
    }
    if (editingFeeId) {
      updatePaymentFeeMutation.mutate({ id: editingFeeId, ...paymentFeeForm });
    } else {
      createPaymentFeeMutation.mutate(paymentFeeForm);
    }
  };

  const handleEditFee = (fee: any) => {
    setPaymentFeeForm({
      cardType: fee.cardType || "",
      label: fee.label || "",
      feePercentage: fee.feePercentage || "",
      minFee: fee.minFee || "",
      maxFee: fee.maxFee || "",
    });
    setEditingFeeId(fee.id);
    setShowFeeForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-cyan-500/20 min-h-screen sticky top-0">
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Admin JBSX</h1>
              <p className="text-xs text-slate-500">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 space-y-1 border-t border-cyan-500/20">
          <button onClick={() => setLocation("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" /> Voltar à Loja
          </button>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-cyan-400">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-cyan-400 text-sm">Admin JBSX</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLocation("/")} className="text-slate-400 text-xs flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Loja
          </button>
          <button onClick={() => logout()} className="text-red-400 p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-slate-900 h-full pt-16 p-3 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:p-6 p-4 pt-16 md:pt-6 overflow-auto">
        {/* ===== DASHBOARD ===== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Painel Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-slate-800/80 border-cyan-500/20">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-slate-400">Produtos</p>
                  <p className="text-xl md:text-2xl font-bold text-cyan-400">{products?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-cyan-500/20">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-slate-400">Categorias</p>
                  <p className="text-xl md:text-2xl font-bold text-pink-400">{categories?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-cyan-500/20">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-slate-400">Pedidos</p>
                  <p className="text-xl md:text-2xl font-bold text-green-400">{orders?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-cyan-500/20">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-slate-400">Faturamento</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-400">
                    R$ {orders?.filter(o => o.status !== "cancelled").reduce((s, o) => s + parseFloat(o.total), 0).toFixed(2) || "0.00"}
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-slate-800/80 border-cyan-500/20">
              <CardHeader><CardTitle className="text-cyan-400 text-lg">Últimos Pedidos</CardTitle></CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">#{order.id} - {order.customerName}</p>
                          <p className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-cyan-400 font-semibold text-sm">R$ {parseFloat(order.total).toFixed(2)}</p>
                          <Badge className={`text-xs ${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 text-center py-4">Nenhum pedido ainda</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CATEGORIES ===== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white">Categorias</h2>
              <Button onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }} className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Nova Categoria
              </Button>
            </div>

            {showCategoryForm && (
              <Card className="bg-slate-800 border-cyan-500/20">
                <CardHeader><CardTitle className="text-cyan-400">{editingCategoryId ? "Editar" : "Nova"} Categoria</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Nome *</Label>
                    <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="Nome da categoria" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Descrição</Label>
                    <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="Descrição" rows={3} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveCategory} disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
                      {editingCategoryId ? "Salvar" : "Criar"}
                    </Button>
                    <Button onClick={resetCategoryForm} variant="outline" className="flex-1 border-slate-600 text-slate-300">Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-3">
              {categories?.map((cat) => (
                <Card key={cat.id} className="bg-slate-800/80 border-cyan-500/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold">{cat.name}</h3>
                      {cat.description && <p className="text-slate-400 text-sm mt-1 truncate">{cat.description}</p>}
                      <p className="text-xs text-slate-500 mt-1">{products?.filter(p => p.categoryId === cat.id).length || 0} produtos</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-3">
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => handleEditCategory(cat)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-500/20" onClick={() => { if (confirm("Deletar categoria?")) deleteCategoryMutation.mutate({ id: cat.id }); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!categories || categories.length === 0) && <p className="text-slate-400 text-center py-8">Nenhuma categoria</p>}
            </div>
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white">Produtos</h2>
              <Button onClick={() => { resetProductForm(); setShowProductForm(true); }} className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Novo Produto
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-800 border-cyan-500/20 text-white" placeholder="Buscar produtos..." />
            </div>

            {showProductForm && (
              <Card className="bg-slate-800 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400">{editingProductId ? "Editar" : "Novo"} Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Nome *</Label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="Nome do produto" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Categoria</Label>
                      <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: parseInt(e.target.value) })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-cyan-500/30 text-white text-sm">
                        <option value={0}>Sem categoria</option>
                        {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Descrição Detalhada</Label>
                    <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="Descrição completa do produto que aparecerá na página de detalhes..." rows={5} />
                    <p className="text-xs text-slate-500 mt-1">Esta descrição será exibida na página individual do produto.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">Preço (R$) *</Label>
                      <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="0.00" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Estoque</Label>
                      <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-slate-300">Peso (kg)</Label>
                      <Input type="number" step="0.001" value={productForm.weight} onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white" placeholder="0.000" />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="text-slate-300 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Imagem Principal</Label>
                    <div className="flex flex-col sm:flex-row gap-3 mt-1">
                      <Input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white flex-1" placeholder="URL da imagem ou faça upload" />
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-md text-cyan-400 text-sm hover:bg-slate-600 transition-colors flex-shrink-0">
                        <Upload className="w-4 h-4" /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadForProduct} />
                      </label>
                    </div>
                    {productForm.image && (
                      <img src={productForm.image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-cyan-500/20" />
                    )}
                  </div>

                  {/* Gallery Upload */}
                  <div>
                    <Label className="text-slate-300 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Galeria de Fotos (página de detalhes)</Label>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-md text-cyan-400 text-sm hover:bg-slate-600 transition-colors mt-1">
                      <Upload className="w-4 h-4" /> Adicionar Fotos
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Estas fotos aparecerão na galeria da página do produto.</p>
                    {productForm.gallery.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productForm.gallery.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt={`Gallery ${i}`} className="w-20 h-20 object-cover rounded-lg border border-cyan-500/20" />
                            <button onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <Label className="text-slate-300 flex items-center gap-2"><Video className="w-4 h-4" /> Vídeo do Produto (página de detalhes)</Label>
                    <div className="flex flex-col sm:flex-row gap-3 mt-1">
                      <Input value={productForm.videoUrl} onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })} className="bg-slate-700 border-cyan-500/30 text-white flex-1" placeholder="URL do vídeo (YouTube, MP4, etc)" />
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-md text-pink-400 text-sm hover:bg-slate-600 transition-colors flex-shrink-0">
                        <Video className="w-4 h-4" /> Upload
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">O vídeo aparecerá na página individual do produto.</p>
                    {productForm.videoUrl && <p className="text-xs text-green-400 mt-1">Vídeo configurado</p>}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSaveProduct} disabled={createProductMutation.isPending || updateProductMutation.isPending} className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold">
                      {createProductMutation.isPending || updateProductMutation.isPending ? "Salvando..." : editingProductId ? "Salvar Alterações" : "Criar Produto"}
                    </Button>
                    <Button onClick={resetProductForm} variant="outline" className="flex-1 border-slate-600 text-slate-300">Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product List */}
            <div className="grid gap-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-slate-800/80 border-cyan-500/20 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {product.image && (
                        <div className="sm:w-24 sm:h-24 w-full h-40 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-semibold truncate">{product.name}</h3>
                            {product.videoUrl && <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs"><Video className="w-3 h-3 mr-1" />Vídeo</Badge>}
                            {product.gallery && (product.gallery as string[]).length > 0 && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"><ImageIcon className="w-3 h-3 mr-1" />{(product.gallery as string[]).length}</Badge>}
                          </div>
                          {product.description && <p className="text-slate-400 text-sm mt-1 line-clamp-1">{product.description}</p>}
                          <div className="flex flex-wrap gap-2 md:gap-3 mt-2 text-sm">
                            <span className="text-cyan-400 font-semibold">R$ {parseFloat(product.price).toFixed(2)}</span>
                            <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                              {product.stock > 0 ? `Est: ${product.stock}` : "Sem estoque"}
                            </span>
                            {categories?.find(c => c.id === product.categoryId) && (
                              <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs">{categories.find(c => c.id === product.categoryId)?.name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => setLocation(`/product/${product.id}`)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => handleEditProduct(product)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-500/20" onClick={() => { if (confirm("Deletar produto?")) deleteProductMutation.mutate({ id: product.id }); }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredProducts.length === 0 && <p className="text-slate-400 text-center py-8">Nenhum produto encontrado</p>}
            </div>
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-white">Pedidos ({orders?.length || 0})</h2>
            </div>

            {/* Order Filters */}
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((f) => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    orderFilter === f ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-800 border-slate-600 text-slate-400"
                  }`}>
                  {f === "all" ? `Todos (${orders?.length || 0})` : `${statusLabels[f]} (${orders?.filter(o => o.status === f).length || 0})`}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-slate-800/80 border-cyan-500/20">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">Pedido #{order.id}</h3>
                          <Badge className={`text-xs ${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 truncate">{order.customerName} - {order.customerPhone}</p>
                        <p className="text-slate-500 text-xs">{new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-cyan-400 font-bold">R$ {parseFloat(order.total).toFixed(2)}</span>
                        {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-500">Email:</span> <span className="text-slate-300">{order.customerEmail}</span></div>
                          <div><span className="text-slate-500">Telefone:</span> <span className="text-slate-300">{order.customerPhone}</span></div>
                          {order.customerAddress && <div className="sm:col-span-2"><span className="text-slate-500">Endereço:</span> <span className="text-slate-300">{order.customerAddress}</span></div>}
                        </div>

                        <div>
                          <h4 className="text-slate-300 font-medium text-sm mb-2">Itens:</h4>
                          <div className="space-y-2">
                            {(order.items as Array<{ id: number; name: string; price: string; quantity: number }>)?.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm bg-slate-700/50 p-2 rounded">
                                <span className="text-slate-300">{item.quantity}x {item.name}</span>
                                <span className="text-cyan-400">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm space-y-1 bg-slate-700/30 p-3 rounded-lg">
                          <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span><span className="text-slate-300">R$ {parseFloat(order.subtotal).toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Frete:</span><span className="text-slate-300">R$ {parseFloat(order.shippingCost).toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Taxa:</span><span className="text-slate-300">R$ {parseFloat(order.paymentFee).toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold border-t border-slate-600 pt-1"><span className="text-white">Total:</span><span className="text-cyan-400">R$ {parseFloat(order.total).toFixed(2)}</span></div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 mb-2">Alterar status:</p>
                          <div className="flex flex-wrap gap-2">
                            {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={order.status === status ? "default" : "outline"}
                                className={order.status === status ? "bg-cyan-500 text-slate-900" : "border-slate-600 text-slate-400 text-xs"}
                                onClick={() => updateOrderMutation.mutate({ id: order.id, status })}
                                disabled={updateOrderMutation.isPending}
                              >
                                {statusLabels[status]}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderMutation.mutate({ id: order.id, status: "confirmed" })}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              disabled={updateOrderMutation.isPending}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar Pedido
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja deletar o pedido #${order.id}?`)) {
                                deleteOrderMutation.mutate({ id: order.id });
                              }
                            }}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Deletar Pedido
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredOrders.length === 0 && <p className="text-slate-400 text-center py-8">Nenhum pedido encontrado</p>}
            </div>
          </div>
        )}

        {/* ===== ABC CURVE ===== */}
        {activeTab === "abc" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Curva ABC</h2>
            </div>
            <p className="text-slate-400 text-sm">Classificação dos produtos por faturamento. A = 80%, B = 15%, C = 5%.</p>

            {abcData.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-3 md:p-4 text-center">
                      <p className="text-green-400 text-xl md:text-2xl font-bold">{abcData.filter(p => p.classification === "A").length}</p>
                      <p className="text-green-400/70 text-xs md:text-sm">Classe A</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-500/10 border-yellow-500/30">
                    <CardContent className="p-3 md:p-4 text-center">
                      <p className="text-yellow-400 text-xl md:text-2xl font-bold">{abcData.filter(p => p.classification === "B").length}</p>
                      <p className="text-yellow-400/70 text-xs md:text-sm">Classe B</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-3 md:p-4 text-center">
                      <p className="text-red-400 text-xl md:text-2xl font-bold">{abcData.filter(p => p.classification === "C").length}</p>
                      <p className="text-red-400/70 text-xs md:text-sm">Classe C</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/80 border-cyan-500/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-3 text-slate-400 font-medium">Classe</th>
                          <th className="text-left p-3 text-slate-400 font-medium">Produto</th>
                          <th className="text-right p-3 text-slate-400 font-medium hidden sm:table-cell">Qtd</th>
                          <th className="text-right p-3 text-slate-400 font-medium">Faturamento</th>
                          <th className="text-right p-3 text-slate-400 font-medium hidden md:table-cell">%</th>
                          <th className="text-right p-3 text-slate-400 font-medium hidden md:table-cell">Acum.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {abcData.map((item) => (
                          <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-3">
                              <Badge className={`text-xs ${
                                item.classification === "A" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                item.classification === "B" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                "bg-red-500/20 text-red-400 border-red-500/30"
                              }`}>{item.classification}</Badge>
                            </td>
                            <td className="p-3 text-white max-w-[150px] truncate">{item.name}</td>
                            <td className="p-3 text-right text-slate-300 hidden sm:table-cell">{item.quantity}</td>
                            <td className="p-3 text-right text-cyan-400 font-semibold">R$ {item.revenue.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300 hidden md:table-cell">{item.percentage.toFixed(1)}%</td>
                            <td className="p-3 text-right text-slate-400 hidden md:table-cell">{item.cumulative.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/80 border-cyan-500/20">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Sem dados suficientes para a curva ABC.</p>
                  <p className="text-slate-500 text-sm mt-1">Os dados são gerados a partir dos pedidos realizados.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== REVIEWS & QUESTIONS ===== */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/80 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Gerenciar Avaliações ({allReviews?.length || 0})
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["all", "pending", "approved", "hidden"] as const).map((f) => (
                    <button key={f} onClick={() => setReviewFilter(f)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                        reviewFilter === f ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-700 border-slate-600 text-slate-400"
                      }`}>
                      {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovadas" : "Ocultas"}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {allReviews?.filter((r) => reviewFilter === "all" || r.status === reviewFilter).length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhuma avaliação encontrada</p>
                ) : (
                  allReviews?.filter((r) => reviewFilter === "all" || r.status === reviewFilter).map((review) => {
                    const product = products?.find((p) => p.id === review.productId);
                    return (
                      <div key={review.id} className="bg-slate-700/50 rounded-lg p-3 md:p-4 border border-slate-600/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`w-3 h-3 md:w-4 md:h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
                              ))}
                            </div>
                            <span className="text-white font-medium text-sm">{review.customerName}</span>
                            <Badge className={review.status === "approved" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" : review.status === "hidden" ? "bg-red-500/20 text-red-400 border-red-500/30 text-xs" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"}>
                              {review.status === "approved" ? "Aprovada" : review.status === "hidden" ? "Oculta" : "Pendente"}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        {product && <p className="text-xs text-cyan-400">Produto: {product.name}</p>}
                        {review.comment && <p className="text-slate-300 text-sm">{review.comment}</p>}
                        {review.adminResponse && (
                          <div className="ml-4 pl-3 border-l-2 border-cyan-500/30">
                            <p className="text-xs text-cyan-400 font-semibold">Sua resposta:</p>
                            <p className="text-slate-300 text-sm">{review.adminResponse}</p>
                          </div>
                        )}
                        {reviewResponseId === review.id && (
                          <div className="flex gap-2">
                            <Input value={reviewResponseText} onChange={(e) => setReviewResponseText(e.target.value)} placeholder="Escreva sua resposta..." className="bg-slate-600 border-slate-500 text-white text-sm" />
                            <Button size="sm" onClick={() => { respondReviewMutation.mutate({ id: review.id, adminResponse: reviewResponseText }); setReviewResponseId(null); setReviewResponseText(""); }} disabled={!reviewResponseText.trim()} className="bg-cyan-500 text-slate-900 flex-shrink-0">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {review.status !== "approved" && (
                            <Button size="sm" variant="outline" onClick={() => updateReviewStatusMutation.mutate({ id: review.id, status: "approved" })} className="text-green-400 border-green-500/30 hover:bg-green-500/10 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                            </Button>
                          )}
                          {review.status !== "hidden" && (
                            <Button size="sm" variant="outline" onClick={() => updateReviewStatusMutation.mutate({ id: review.id, status: "hidden" })} className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 text-xs">
                              <XCircle className="w-3 h-3 mr-1" /> Ocultar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => { setReviewResponseId(review.id === reviewResponseId ? null : review.id); setReviewResponseText(review.adminResponse || ""); }} className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" /> Responder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { if (confirm("Excluir esta avaliação?")) deleteReviewMutation.mutate({ id: review.id }); }} className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs">
                            <Trash2 className="w-3 h-3 mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                  Gerenciar Perguntas ({allQuestions?.length || 0})
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["all", "pending", "answered"] as const).map((f) => (
                    <button key={f} onClick={() => setQuestionFilter(f)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                        questionFilter === f ? "bg-pink-500/20 border-pink-500/50 text-pink-400" : "bg-slate-700 border-slate-600 text-slate-400"
                      }`}>
                      {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : "Respondidas"}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {allQuestions?.filter((q) => questionFilter === "all" || q.status === questionFilter).length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhuma pergunta encontrada</p>
                ) : (
                  allQuestions?.filter((q) => questionFilter === "all" || q.status === questionFilter).map((q) => {
                    const product = products?.find((p) => p.id === q.productId);
                    return (
                      <div key={q.id} className="bg-slate-700/50 rounded-lg p-3 md:p-4 border border-slate-600/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium text-sm">{q.customerName}</span>
                            {q.status === "answered" ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Respondida</Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{new Date(q.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        {product && <p className="text-xs text-pink-400">Produto: {product.name}</p>}
                        <p className="text-slate-300 text-sm">{q.question}</p>
                        {q.adminResponse && (
                          <div className="ml-4 pl-3 border-l-2 border-pink-500/30">
                            <p className="text-xs text-pink-400 font-semibold">Sua resposta:</p>
                            <p className="text-slate-300 text-sm">{q.adminResponse}</p>
                          </div>
                        )}
                        {questionResponseId === q.id && (
                          <div className="flex gap-2">
                            <Input value={questionResponseText} onChange={(e) => setQuestionResponseText(e.target.value)} placeholder="Escreva sua resposta..." className="bg-slate-600 border-slate-500 text-white text-sm" />
                            <Button size="sm" onClick={() => { respondQuestionMutation.mutate({ id: q.id, adminResponse: questionResponseText }); setQuestionResponseId(null); setQuestionResponseText(""); }} disabled={!questionResponseText.trim()} className="bg-pink-500 text-white flex-shrink-0">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setQuestionResponseId(q.id === questionResponseId ? null : q.id); setQuestionResponseText(q.adminResponse || ""); }} className="text-pink-400 border-pink-500/30 hover:bg-pink-500/10 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" /> Responder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { if (confirm("Excluir esta pergunta?")) deleteQuestionMutation.mutate({ id: q.id }); }} className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs">
                            <Trash2 className="w-3 h-3 mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" /> Configurações
            </h2>

            {/* Shipping Config */}
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Configuração de Frete
                </CardTitle>
                <p className="text-slate-500 text-sm mt-1">Configure os valores de frete para cálculo automático nos pedidos.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Custo Base (R$)
                    </Label>
                    <Input
                      type="number" step="0.01"
                      value={shippingForm.baseCost}
                      onChange={(e) => setShippingForm({ ...shippingForm, baseCost: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="Ex: 15.00"
                    />
                    <p className="text-xs text-slate-500">Valor fixo cobrado em todo pedido</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Custo por kg (R$)
                    </Label>
                    <Input
                      type="number" step="0.01"
                      value={shippingForm.costPerKg}
                      onChange={(e) => setShippingForm({ ...shippingForm, costPerKg: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="Ex: 5.00"
                    />
                    <p className="text-xs text-slate-500">Valor adicional por quilograma</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Frete Grátis Acima (R$)
                    </Label>
                    <Input
                      type="number" step="0.01"
                      value={shippingForm.freeShippingThreshold}
                      onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="Ex: 200.00"
                    />
                    <p className="text-xs text-slate-500">Pedidos acima deste valor têm frete grátis</p>
                  </div>
                </div>
                <Button onClick={handleSaveShipping} disabled={updateShippingMutation.isPending} className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold w-full sm:w-auto">
                  {updateShippingMutation.isPending ? "Salvando..." : "Salvar Configuração de Frete"}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Fee Config - Multiple Card Types */}
            <Card className="bg-slate-800 border-pink-500/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-pink-400 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Taxas de Pagamento
                    </CardTitle>
                    <p className="text-slate-500 text-sm mt-1">Gerencie taxas para diferentes formas de pagamento (crédito, débito, PIX, etc).</p>
                  </div>
                  <Button onClick={() => { resetFeeForm(); setShowFeeForm(true); }} className="bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold flex-shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Nova Taxa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing fees list */}
                {allPaymentFees && allPaymentFees.length > 0 ? (
                  <div className="space-y-3">
                    {allPaymentFees.map((fee) => (
                      <div key={fee.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${
                              fee.cardType === 'credit' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              fee.cardType === 'debit' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              fee.cardType === 'pix' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              'bg-pink-500/20 text-pink-400 border-pink-500/30'
                            }`}>{fee.cardType}</Badge>
                            <span className="text-white font-medium text-sm">{fee.label}</span>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-slate-400">
                            <span>Taxa: <span className="text-pink-400 font-semibold">{fee.feePercentage}%</span></span>
                            <span>Mín: <span className="text-slate-300">R$ {parseFloat(fee.minFee).toFixed(2)}</span></span>
                            <span>Máx: <span className="text-slate-300">R$ {parseFloat(fee.maxFee).toFixed(2)}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleEditFee(fee)} className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 text-xs">
                            <Edit2 className="w-3 h-3 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { if (confirm('Excluir esta taxa?')) deletePaymentFeeMutation.mutate({ id: fee.id }); }} className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs">
                            <Trash2 className="w-3 h-3 mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">Nenhuma taxa cadastrada. Clique em "Nova Taxa" para criar.</p>
                )}

                {/* Fee form */}
                {showFeeForm && (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-pink-500/20 space-y-4">
                    <h4 className="text-pink-400 font-semibold text-sm">{editingFeeId ? 'Editar Taxa' : 'Nova Taxa de Pagamento'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Tipo</Label>
                        <select
                          value={paymentFeeForm.cardType}
                          onChange={(e) => {
                            const type = e.target.value;
                            const labels: Record<string, string> = { credit: 'Cartão de Crédito', debit: 'Cartão de Débito', pix: 'PIX', other: 'Outro' };
                            setPaymentFeeForm({ ...paymentFeeForm, cardType: type, label: paymentFeeForm.label || labels[type] || '' });
                          }}
                          className="w-full bg-slate-700 border border-pink-500/30 text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="credit">Cartão de Crédito</option>
                          <option value="debit">Cartão de Débito</option>
                          <option value="pix">PIX</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Nome/Label</Label>
                        <Input
                          value={paymentFeeForm.label}
                          onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, label: e.target.value })}
                          className="bg-slate-700 border-pink-500/30 text-white"
                          placeholder="Ex: Cartão de Crédito Visa"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-1 text-sm">
                          <Percent className="w-3 h-3" /> Taxa (%)
                        </Label>
                        <Input
                          type="number" step="0.01"
                          value={paymentFeeForm.feePercentage}
                          onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, feePercentage: e.target.value })}
                          className="bg-slate-700 border-pink-500/30 text-white"
                          placeholder="Ex: 3.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-1 text-sm">
                          <DollarSign className="w-3 h-3" /> Mínimo (R$)
                        </Label>
                        <Input
                          type="number" step="0.01"
                          value={paymentFeeForm.minFee}
                          onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, minFee: e.target.value })}
                          className="bg-slate-700 border-pink-500/30 text-white"
                          placeholder="Ex: 2.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-1 text-sm">
                          <DollarSign className="w-3 h-3" /> Máximo (R$)
                        </Label>
                        <Input
                          type="number" step="0.01"
                          value={paymentFeeForm.maxFee}
                          onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, maxFee: e.target.value })}
                          className="bg-slate-700 border-pink-500/30 text-white"
                          placeholder="Ex: 50.00"
                        />
                      </div>
                    </div>

                    {/* Preview calculation */}
                    {paymentFeeForm.feePercentage && (
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                        <p className="text-xs text-slate-400 mb-2">Simulação:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {[100, 500, 1000, 2000].map((val) => {
                            const pct = parseFloat(paymentFeeForm.feePercentage) || 0;
                            const min = parseFloat(paymentFeeForm.minFee) || 0;
                            const max = parseFloat(paymentFeeForm.maxFee) || Infinity;
                            let fee = (val * pct) / 100;
                            fee = Math.max(fee, min);
                            fee = Math.min(fee, max);
                            return (
                              <div key={val} className="bg-slate-700 p-2 rounded text-center">
                                <p className="text-slate-400">R$ {val}</p>
                                <p className="text-pink-400 font-semibold">R$ {fee.toFixed(2)}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleSavePaymentFee} disabled={createPaymentFeeMutation.isPending || updatePaymentFeeMutation.isPending} className="bg-gradient-to-r from-pink-500 to-pink-400 text-white font-semibold flex-1 sm:flex-none">
                        {editingFeeId ? 'Atualizar Taxa' : 'Criar Taxa'}
                      </Button>
                      <Button variant="outline" onClick={resetFeeForm} className="border-slate-600 text-slate-400 hover:bg-slate-700">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
