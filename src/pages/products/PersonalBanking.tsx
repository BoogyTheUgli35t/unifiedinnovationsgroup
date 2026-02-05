import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Bot,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Smart Checking",
    description: "No minimum balance, no monthly fees. Earn rewards on everyday purchases.",
    highlights: ["No monthly fees", "1% cashback", "Early paycheck access"],
  },
  {
    icon: PiggyBank,
    title: "High-Yield Savings",
    description: "Watch your money grow with industry-leading APY rates.",
    highlights: ["4.25% APY", "No minimum deposit", "Automatic round-ups"],
  },
  {
    icon: CreditCard,
    title: "Premium Cards",
    description: "Credit and debit cards designed for the modern lifestyle.",
    highlights: ["Metal cards", "Travel benefits", "Purchase protection"],
  },
  {
    icon: TrendingUp,
    title: "Personal Loans",
    description: "Competitive rates with flexible terms and instant approval.",
    highlights: ["Rates from 6.99%", "No origination fees", "Same-day funding"],
  },
  {
    icon: Bot,
    title: "AI Budget Insights",
    description: "Personalized financial recommendations powered by AI.",
    highlights: ["Spending analysis", "Bill negotiation", "Savings goals"],
  },
  {
    icon: Shield,
    title: "Financial Protection",
    description: "Comprehensive security features to protect your money.",
    highlights: ["Fraud monitoring", "Identity protection", "Insurance options"],
  },
];

const PersonalBanking = () => {
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
                <Wallet className="w-4 h-4 text-gold" />
                Personal Banking
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="text-foreground">Banking Built</span>{" "}
                <span className="gradient-text">For Your Life</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed mb-8">
                Premium banking services with no hidden fees, intelligent insights,
                and rewards that actually matter. Your money, optimized.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button className="btn-premium group">
                    <span className="relative z-10 flex items-center gap-2">
                      Open an Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" className="btn-ghost-gold">
                  Compare Products
                </Button>
              </div>
            </motion.div>
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
                <span className="text-foreground">Everything You</span>{" "}
                <span className="gradient-text">Need</span>
              </h2>
              <p className="text-navy-400 text-lg max-w-2xl mx-auto">
                A complete suite of personal banking products designed to help you save,
                spend, and grow your wealth.
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
                  <p className="text-navy-400 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-navy-300">
                        <CheckCircle className="w-4 h-4 text-gold" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
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
                Ready to Get Started?
              </h2>
              <p className="text-navy-400 mb-8">
                Open your account in minutes. No paperwork, no hassle.
              </p>
              <Link to="/register">
                <Button className="btn-premium">
                  <span className="relative z-10">Open Your Account</span>
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

export default PersonalBanking;