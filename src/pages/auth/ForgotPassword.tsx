import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Check your email", description: "We've sent you a password reset link." });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-navy-400 hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-navy-950" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {sent ? 'Check Your Email' : 'Forgot Password'}
            </h1>
            <p className="text-navy-400">
              {sent
                ? `We've sent a reset link to ${email}`
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500" required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full btn-premium">
                <span className="relative z-10">{isLoading ? "Sending..." : "Send Reset Link"}</span>
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-navy-400">Didn't receive the email? Check your spam folder or try again.</p>
              <Button variant="outline" onClick={() => setSent(false)} className="border-navy-700 text-foreground">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
