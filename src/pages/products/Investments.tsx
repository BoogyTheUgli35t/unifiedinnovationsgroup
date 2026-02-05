import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Bot,
  Rocket,
  PieChart,
  Briefcase,
  LineChart,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Portfolio Management",
    description: "Let our AI optimize your portfolio allocation based on your goals and risk tolerance.",
  },
  {
    icon: PieChart,
    title: "Diversified Strategies",
    description: "Access professionally managed portfolios across multiple asset classes.",
  },
  {
    icon: Rocket,
    title: "Innovation Funding",
    description: "Invest in vetted startups and emerging technology opportunities.",
  },
  {
    icon: LineChart,
    title: "Real-Time Analytics",
    description: "Track performance with comprehensive dashboards and reporting tools.",
  },
  {
    icon: Briefcase,
    title: "Alternative Investments",
    description: "Access private equity, real estate, and other alternative asset classes.",
  },
  {
    icon: TrendingUp,
    title: "Automated Rebalancing",
    description: "Keep your portfolio aligned with your investment strategy automatically.",
  },
];

const Investments = () => {
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
                <TrendingUp className="w-4 h-4 text-gold" />
                Investments & Innovation Funding
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="text-foreground">Grow Your</span>{" "}
                <span className="gradient-text">Wealth</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed mb-8">
                AI-powered investment management and exclusive access to innovation funding opportunities.
                Build wealth intelligently.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button className="btn-premium group">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Investing
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" className="btn-ghost-gold">
                  View Strategies
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
                <span className="text-foreground">Intelligent</span>{" "}
                <span className="gradient-text">Investing</span>
              </h2>
              <p className="text-navy-400 text-lg max-w-2xl mx-auto">
                Sophisticated investment tools and opportunities typically reserved for institutions.
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
                Ready to Invest Smarter?
              </h2>
              <p className="text-navy-400 mb-8">
                Open an investment account and let AI help optimize your portfolio.
              </p>
              <Link to="/register">
                <Button className="btn-premium">
                  <span className="relative z-10">Get Started</span>
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

export default Investments;