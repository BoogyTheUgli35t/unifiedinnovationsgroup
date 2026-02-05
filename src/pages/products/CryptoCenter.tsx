import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Bitcoin,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Unified Wallet",
    description: "Store all your digital assets in one secure, institutional-grade wallet.",
  },
  {
    icon: ArrowLeftRight,
    title: "Instant Conversion",
    description: "Seamlessly convert between crypto and fiat currencies at competitive rates.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Real-time portfolio analytics with performance metrics and insights.",
  },
  {
    icon: Shield,
    title: "Institutional Custody",
    description: "Your assets protected by industry-leading security infrastructure.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Move funds between crypto and traditional accounts instantly.",
  },
  {
    icon: Bitcoin,
    title: "Multi-Asset Support",
    description: "Support for major cryptocurrencies including BTC, ETH, SOL, and more.",
  },
];

const CryptoCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-30" />
          <div className="container-padding mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="trust-badge mb-6 inline-flex">
                <Bitcoin className="w-4 h-4 text-gold" />
                Crypto Center
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="text-foreground">Digital Assets,</span>{" "}
                <span className="gradient-text">Unified</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed mb-8">
                Manage your cryptocurrency portfolio alongside traditional banking.
                One platform, complete financial visibility.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button className="btn-premium group">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" className="btn-ghost-gold">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <section className="py-4 bg-warning/10 border-y border-warning/20">
          <div className="container-padding mx-auto">
            <div className="flex items-center justify-center gap-3 text-warning">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm text-center">
                <strong>Important:</strong> Cryptocurrency is not FDIC insured and may lose value.
                This is a demo platform for illustration purposes only.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                <span className="text-foreground">Crypto</span>{" "}
                <span className="gradient-text">Made Simple</span>
              </h2>
              <p className="text-navy-400 text-lg max-w-2xl mx-auto">
                Everything you need to buy, sell, and manage digital assets in one place.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card-hover p-8"
                >
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-navy-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy-900/30">
          <div className="container-padding mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-foreground">
                Start Your Crypto Journey
              </h2>
              <p className="text-navy-400 mb-8">
                Join thousands of users who trust UIG for their digital asset management.
              </p>
              <Link to="/register">
                <Button className="btn-premium">
                  <span className="relative z-10">Create Account</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CryptoCenter;