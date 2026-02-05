import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Wallet, Building2, Bitcoin, TrendingUp } from "lucide-react";

const bentoItems = [
  {
    title: "Personal Banking",
    description: "Smart checking & savings accounts with AI-powered budgeting tools",
    icon: Wallet,
    href: "/products/personal",
    className: "col-span-12 md:col-span-7 row-span-2",
    featured: true,
  },
  {
    title: "Business Solutions",
    description: "Enterprise treasury & payment infrastructure",
    icon: Building2,
    href: "/products/business",
    className: "col-span-12 md:col-span-5",
  },
  {
    title: "Crypto Center",
    description: "Integrated digital asset management",
    icon: Bitcoin,
    href: "/products/crypto",
    className: "col-span-12 md:col-span-5",
  },
  {
    title: "Innovation Funding",
    description: "Access alternative investments and startup opportunities",
    icon: TrendingUp,
    href: "/products/investments",
    className: "col-span-12 md:col-span-6",
  },
  {
    title: "Investment Platform",
    description: "AI-driven portfolio management",
    icon: TrendingUp,
    href: "/products/investments",
    className: "col-span-12 md:col-span-6",
  },
];

export function BentoGrid() {
  return (
    <section className="section-padding bg-navy-900/30">
      <div className="container-padding mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-foreground">Explore Our</span>{" "}
            <span className="gradient-text">Products</span>
          </h2>
          <p className="text-navy-400 text-lg max-w-2xl mx-auto">
            A comprehensive suite of financial products designed to meet every need.
          </p>
        </motion.div>

        <div className="bento-grid auto-rows-[minmax(200px,auto)]">
          {bentoItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={item.className}
            >
              <Link
                to={item.href}
                className={`block h-full glass-card-hover p-8 group ${
                  item.featured ? "bg-gradient-card" : ""
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-auto">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <item.icon className="w-6 h-6 text-gold" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-navy-500 group-hover:text-gold transition-colors" />
                  </div>
                  <div className="mt-6">
                    <h3 className={`font-display font-semibold text-foreground mb-2 ${
                      item.featured ? "text-2xl" : "text-xl"
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-navy-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}