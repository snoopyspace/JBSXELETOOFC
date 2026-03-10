import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Package, ShoppingCart, Settings } from "lucide-react";

type Tab = "products" | "orders" | "settings";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });

  const [shippingForm, setShippingForm] = useState({
    baseCost: "",
    costPerKg: "",
    freeShippingThreshold: "",
  });

  const [paymentFeeForm, setPaymentFeeForm] = useState({
    feePercentage: "",
    minFee: "",
    maxFee: "",
  });

  // Queries
  const { data: products, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: orders, refetch: refetchOrders } = trpc.orders.list.useQuery();
  const { data: shippingConfig } = trpc.shippingConfig.get.useQuery();
  const { data: paymentFeeConfig } = trpc.paymentFeeConfig.get.useQuery();

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setProductForm({ name: "", description: "", price: "", image: "" });
      setShowProductForm(false);
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado com sucesso!");
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar produto");
    },
  });

  const updateShippingMutation = trpc.shippingConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração de frete atualizada!");
      setShippingForm({ baseCost: "", costPerKg: "", freeShippingThreshold: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar frete");
    },
  });

  const updatePaymentFeeMutation = trpc.paymentFeeConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração de taxa atualizada!");
      setPaymentFeeForm({ feePercentage: "", minFee: "", maxFee: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar taxa");
    },
  });

  // Check if user is admin
  if (loading) return <div className="text-white">Carregando...</div>;
  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    createProductMutation.mutate(productForm);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      deleteProductMutation.mutate({ id });
    }
  };

  const handleUpdateShipping = () => {
    if (!shippingForm.baseCost && !shippingForm.costPerKg && !shippingForm.freeShippingThreshold) {
      toast.error("Preencha pelo menos um campo");
      return;
    }
    updateShippingMutation.mutate({
      baseCost: shippingForm.baseCost || undefined,
      costPerKg: shippingForm.costPerKg || undefined,
      freeShippingThreshold: shippingForm.freeShippingThreshold || undefined,
    });
  };

  const handleUpdatePaymentFee = () => {
    if (!paymentFeeForm.feePercentage && !paymentFeeForm.minFee && !paymentFeeForm.maxFee) {
      toast.error("Preencha pelo menos um campo");
      return;
    }
    updatePaymentFeeMutation.mutate({
      feePercentage: paymentFeeForm.feePercentage || undefined,
      minFee: paymentFeeForm.minFee || undefined,
      maxFee: paymentFeeForm.maxFee || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-cyan-500/20">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${
              activeTab === "products"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            <Package className="w-5 h-5" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${
              activeTab === "orders"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${
              activeTab === "settings"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gerenciar Produtos</h2>
              <Button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {showProductForm && (
              <Card className="bg-slate-800 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Adicionar Novo Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Nome *</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Descrição</Label>
                    <Input
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="Descrição do produto"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Preço *</Label>
                    <Input
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">URL da Imagem</Label>
                    <Input
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateProduct}
                      disabled={createProductMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
                    >
                      {createProductMutation.isPending ? "Criando..." : "Criar Produto"}
                    </Button>
                    <Button
                      onClick={() => setShowProductForm(false)}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="bg-slate-800 border-cyan-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-slate-400 mt-1">{product.description}</p>
                          )}
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-cyan-400 font-semibold">R$ {parseFloat(product.price).toFixed(2)}</span>
                            <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                              {product.stock > 0 ? `Em estoque (${product.stock})` : "Fora de estoque"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-500/20"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Nenhum produto cadastrado</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Gerenciar Pedidos</h2>
            <div className="grid gap-4">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id} className="bg-slate-800 border-cyan-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">Pedido #{order.id}</h3>
                          <p className="text-sm text-slate-400 mt-1">{order.customerName} - {order.customerEmail}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-cyan-400 font-semibold">R$ {parseFloat(order.total).toFixed(2)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                              order.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                              order.status === "delivered" ? "bg-green-500/20 text-green-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Nenhum pedido cadastrado</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Configurações</h2>

            {/* Shipping Configuration */}
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Configuração de Frete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Custo Base (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={shippingForm.baseCost || (shippingConfig?.baseCost || "")}
                      onChange={(e) => setShippingForm({ ...shippingForm, baseCost: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={shippingConfig?.baseCost}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Custo por kg (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={shippingForm.costPerKg || (shippingConfig?.costPerKg || "")}
                      onChange={(e) => setShippingForm({ ...shippingForm, costPerKg: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={shippingConfig?.costPerKg}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Frete Grátis Acima de (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={shippingForm.freeShippingThreshold || (shippingConfig?.freeShippingThreshold || "")}
                      onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={shippingConfig?.freeShippingThreshold}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdateShipping}
                  disabled={updateShippingMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
                >
                  {updateShippingMutation.isPending ? "Atualizando..." : "Atualizar Frete"}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Fee Configuration */}
            <Card className="bg-slate-800 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Configuração de Taxa de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Percentual (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentFeeForm.feePercentage || (paymentFeeConfig?.feePercentage || "")}
                      onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, feePercentage: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={paymentFeeConfig?.feePercentage}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Taxa Mínima (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentFeeForm.minFee || (paymentFeeConfig?.minFee || "")}
                      onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, minFee: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={paymentFeeConfig?.minFee}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Taxa Máxima (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentFeeForm.maxFee || (paymentFeeConfig?.maxFee || "")}
                      onChange={(e) => setPaymentFeeForm({ ...paymentFeeForm, maxFee: e.target.value })}
                      className="bg-slate-700 border-cyan-500/30 text-white"
                      placeholder={paymentFeeConfig?.maxFee}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdatePaymentFee}
                  disabled={updatePaymentFeeMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-semibold"
                >
                  {updatePaymentFeeMutation.isPending ? "Atualizando..." : "Atualizar Taxa"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
