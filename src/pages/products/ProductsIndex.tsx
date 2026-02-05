import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Wallet, Building2, Bitcoin, TrendingUp, ArrowRight } from "lucide-react";

const products = [
  {
    icon: Wallet,
    title: "Personal Banking",
    description: "Smart checking, high-yield savings, premium cards, and AI-powered budget insights.",
    href: "/products/personal",
  },
  {
    icon: Building2,
    title: "Business Banking",
    description: "Treasury management, payroll solutions, invoicing, and merchant services for enterprises.",
    href: "/products/business",
  },
  {
    icon: Bitcoin,
    title: "Crypto Center",
    description: "Unified wallet, portfolio tracking, and seamless crypto-to-fiat conversion.",
    href: "/products/crypto",
  },
  {
    icon: TrendingUp,
    title: "Investments & Funding",
    description: "AI portfolio management, alternative investments, and innovation funding opportunities.",
    href: "/products/investments",
  },
];

const ProductsIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 bg-gradient-hero">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
                <span className="text-foreground">Our</span>{" "}
                <span className="gradient-text">Products</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed">
                A comprehensive suite of financial products designed to meet every need.
                From personal banking to enterprise solutions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {products.map((product, index) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={product.href}
                    className="block glass-card-hover p-8 h-full group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <product.icon className="w-7 h-7 text-gold" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-navy-500 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                    <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
                      {product.title}
                    </h2>
                    <p className="text-navy-400 leading-relaxed">
                      {product.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsIndex;