import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { SupportChatbot } from "@/components/chat/SupportChatbot";

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
import Onboarding from "./pages/auth/Onboarding";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import DashboardIndex from "./pages/dashboard/DashboardIndex";
import DashboardAccounts from "./pages/dashboard/Accounts";
import DashboardCrypto from "./pages/dashboard/Crypto";
import DashboardInvestments from "./pages/dashboard/Investments";
import DashboardTransfers from "./pages/dashboard/Transfers";
import DashboardSettings from "./pages/dashboard/Settings";
import DashboardDocuments from "./pages/dashboard/Documents";
import SupportTickets from "./pages/dashboard/SupportTickets";
import BillPay from "./pages/dashboard/BillPay";
import Statements from "./pages/dashboard/Statements";
import DashboardMessages from "./pages/dashboard/Messages";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminCrypto from "./pages/admin/AdminCrypto";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminFunding from "./pages/admin/AdminFunding";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminAlerts from "./pages/admin/AdminAlerts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={
                <ProtectedRoute skipOnboardingCheck>
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardIndex /></ProtectedRoute>} />
              <Route path="/dashboard/accounts" element={<ProtectedRoute><DashboardAccounts /></ProtectedRoute>} />
              <Route path="/dashboard/crypto" element={<ProtectedRoute><DashboardCrypto /></ProtectedRoute>} />
              <Route path="/dashboard/investments" element={<ProtectedRoute><DashboardInvestments /></ProtectedRoute>} />
              <Route path="/dashboard/transfers" element={<ProtectedRoute><DashboardTransfers /></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><DashboardDocuments /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
              <Route path="/dashboard/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
              <Route path="/dashboard/bill-pay" element={<ProtectedRoute><BillPay /></ProtectedRoute>} />
              <Route path="/dashboard/statements" element={<ProtectedRoute><Statements /></ProtectedRoute>} />
              <Route path="/dashboard/messages" element={<ProtectedRoute><DashboardMessages /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
              <Route path="/admin/users/:id" element={<AdminGuard><AdminUserDetail /></AdminGuard>} />
              <Route path="/admin/transactions" element={<AdminGuard><AdminTransactions /></AdminGuard>} />
              <Route path="/admin/crypto" element={<AdminGuard><AdminCrypto /></AdminGuard>} />
              <Route path="/admin/compliance" element={<AdminGuard><AdminCompliance /></AdminGuard>} />
              <Route path="/admin/funding" element={<AdminGuard><AdminFunding /></AdminGuard>} />
              <Route path="/admin/logs" element={<AdminGuard><AdminLogs /></AdminGuard>} />
              <Route path="/admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
              <Route path="/admin/alerts" element={<AdminGuard><AdminAlerts /></AdminGuard>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global Support Chatbot */}
            <SupportChatbot />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
