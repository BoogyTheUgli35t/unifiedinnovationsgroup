import { motion, useReducedMotion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGeometry } from "@/components/ui/AnimatedGeometry";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatedGeometry />
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-padding mx-auto pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="trust-badge">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Trusted by 50,000+ customers worldwide
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6"
          >
            <span className="gradient-text-white">The Future of</span>
            <br />
            <span className="gradient-text">Financial Innovation</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Traditional banking reimagined. Crypto integration. AI-powered insights.
            One unified platform for the next generation of wealth management.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button className="btn-premium group text-base">
                <span className="relative z-10 flex items-center gap-2">
                  Open Your Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Button variant="ghost" className="btn-ghost-gold text-base">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "$2.4B+", label: "Assets Managed" },
              { value: "50K+", label: "Active Users" },
              { value: "99.99%", label: "Uptime SLA" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-navy-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-navy-600 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-gold"
          />
        </div>
      </motion.div>
    </section>
  );
}