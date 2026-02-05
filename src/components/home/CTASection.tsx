import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="container-padding mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            <span className="text-foreground">Ready to</span>{" "}
            <span className="gradient-text">Unify Your Finances?</span>
          </h2>
          <p className="text-navy-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Join the next generation of financial management. Open your account in minutes
            and experience the future of banking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button className="btn-premium group text-base">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="btn-ghost-gold text-base">
                Contact Sales
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-navy-400">
              <Shield className="w-5 h-5 text-gold" />
              <span className="text-sm">No hidden fees</span>
            </div>
            <div className="flex items-center gap-2 text-navy-400">
              <Zap className="w-5 h-5 text-gold" />
              <span className="text-sm">Instant account setup</span>
            </div>
            <div className="flex items-center gap-2 text-navy-400">
              <Shield className="w-5 h-5 text-gold" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}