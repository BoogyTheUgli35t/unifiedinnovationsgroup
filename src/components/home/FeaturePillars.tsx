import { motion } from "framer-motion";
import { Wallet, Building2, Bitcoin, TrendingUp, Bot, Shield } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Personal Banking",
    description: "Premium checking, high-yield savings, and intelligent credit solutions designed for modern life.",
  },
  {
    icon: Building2,
    title: "Business Banking",
    description: "Comprehensive treasury management, payroll integration, and merchant services for enterprises.",
  },
  {
    icon: Bitcoin,
    title: "Crypto Integration",
    description: "Seamless crypto-to-fiat bridge with institutional-grade custody and real-time portfolio tracking.",
  },
  {
    icon: TrendingUp,
    title: "Investment Platform",
    description: "AI-driven portfolio management, alternative investments, and innovation funding opportunities.",
  },
  {
    icon: Bot,
    title: "AI Intelligence",
    description: "Predictive analytics, automated insights, and personalized financial recommendations.",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Multi-layer authentication, real-time fraud detection, and regulatory compliance built-in.",
  },
];

export function FeaturePillars() {
  return (
    <section className="section-padding bg-navy-950">
      <div className="container-padding mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="gradient-text">Complete Financial</span>{" "}
            <span className="text-foreground">Ecosystem</span>
          </h2>
          <p className="text-navy-400 text-lg max-w-2xl mx-auto">
            Six pillars of innovation working together to transform how you manage, grow, and protect your wealth.
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
              className="glass-card-hover p-8 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-navy-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}