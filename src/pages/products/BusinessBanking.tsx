import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Receipt,
  Users,
  CreditCard,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Business Accounts",
    description: "Flexible accounts designed for businesses of all sizes.",
    highlights: ["Multi-currency support", "Sub-accounts", "API access"],
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description: "Streamline your accounts receivable with smart invoicing.",
    highlights: ["Automated reminders", "Online payments", "Recurring invoices"],
  },
  {
    icon: Users,
    title: "Payroll Solutions",
    description: "Pay your team on time, every time. Globally.",
    highlights: ["Direct deposit", "Tax filing", "Benefits management"],
  },
  {
    icon: CreditCard,
    title: "Corporate Cards",
    description: "Issue cards to your team with spending controls.",
    highlights: ["Virtual cards", "Expense categories", "Real-time alerts"],
  },
  {
    icon: BarChart3,
    title: "Treasury Management",
    description: "Optimize your cash flow with intelligent treasury tools.",
    highlights: ["Cash forecasting", "Sweep accounts", "Money market funds"],
  },
  {
    icon: Globe,
    title: "Merchant Services",
    description: "Accept payments anywhere, anytime.",
    highlights: ["In-store POS", "Online checkout", "Mobile payments"],
  },
];

const BusinessBanking = () => {
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
                <Building2 className="w-4 h-4 text-gold" />
                Business Banking
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="text-foreground">Scale Your</span>{" "}
                <span className="gradient-text">Business</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed mb-8">
                Comprehensive business banking solutions that grow with you.
                From startups to enterprises, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact">
                  <Button className="btn-premium group">
                    <span className="relative z-10 flex items-center gap-2">
                      Contact Sales
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" className="btn-ghost-gold">
                  View Pricing
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
                <span className="text-foreground">Built for</span>{" "}
                <span className="gradient-text">Growth</span>
              </h2>
              <p className="text-navy-400 text-lg max-w-2xl mx-auto">
                Everything your business needs to manage finances, pay teams, and accept payments.
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
                Let's Talk Business
              </h2>
              <p className="text-navy-400 mb-8">
                Our team is ready to create a custom solution for your business needs.
              </p>
              <Link to="/contact">
                <Button className="btn-premium">
                  <span className="relative z-10">Schedule a Demo</span>
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

export default BusinessBanking;