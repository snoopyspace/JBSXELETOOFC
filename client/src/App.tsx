import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import Terms from "@/pages/Terms";
import ProductDetail from "@/pages/ProductDetail";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import PoliticaEnvio from "@/pages/PoliticaEnvio";
import TermosUso from "@/pages/TermosUso";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/politica-privacidade"} component={PoliticaPrivacidade} />
      <Route path={"/politica-envio"} component={PoliticaEnvio} />
      <Route path={"/termos-uso"} component={TermosUso} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <PWAInstallPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
