import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDays) return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS guide after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop - listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl shadow-cyan-500/10">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon and content */}
        <div className="flex items-start gap-4">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663411798042/4ufiTAguMpYft9f8JCRftq/icon-64x64_3b4afc70.png"
            alt="JBSX Eletro"
            className="w-14 h-14 rounded-xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base mb-1">
              Instalar JBSX Eletro
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Adicione nosso app à tela inicial para acesso rápido e experiência completa!
            </p>
          </div>
        </div>

        {/* iOS Guide */}
        {isIOS && !showIOSGuide && (
          <Button
            onClick={() => setShowIOSGuide(true)}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:shadow-lg hover:shadow-cyan-500/30 text-white font-semibold py-3"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Como instalar
          </Button>
        )}

        {isIOS && showIOSGuide && (
          <div className="mt-4 space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
              <p className="text-cyan-400 text-sm font-semibold">Passo a passo:</p>
              <div className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="bg-cyan-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Toque no botão <strong className="text-white">Compartilhar</strong> (ícone de quadrado com seta para cima) na barra do Safari</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="bg-cyan-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Role para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong></span>
              </div>
              <div className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="bg-cyan-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Toque em <strong className="text-white">"Adicionar"</strong> para confirmar</span>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              Entendi!
            </Button>
          </div>
        )}

        {/* Android / Desktop install button */}
        {!isIOS && deferredPrompt && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
            >
              Agora não
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:shadow-lg hover:shadow-cyan-500/30 text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
