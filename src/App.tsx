import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Product Pages
import ProductsIndex from "./pages/products/ProductsIndex";
import PersonalBanking from "./pages/products/PersonalBanking";
import BusinessBanking from "./pages/products/BusinessBanking";
import CryptoCenter from "./pages/products/CryptoCenter";
import Investments from "./pages/products/Investments";

// Legal Pages
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Security from "./pages/legal/Security";
import Disclaimers from "./pages/legal/Disclaimers";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Product Pages */}
          <Route path="/products" element={<ProductsIndex />} />
          <Route path="/products/personal" element={<PersonalBanking />} />
          <Route path="/products/business" element={<BusinessBanking />} />
          <Route path="/products/crypto" element={<CryptoCenter />} />
          <Route path="/products/investments" element={<Investments />} />
          
          {/* Legal Pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          <Route path="/disclaimers" element={<Disclaimers />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
