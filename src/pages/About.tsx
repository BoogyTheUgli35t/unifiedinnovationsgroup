import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Target, Eye, Shield, Lightbulb, Users, Award } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "Every decision we make prioritizes the protection of your assets and data.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries to bring cutting-edge financial solutions.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your success is our success. We build for you, with you.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We hold ourselves to the highest standards in everything we do.",
  },
];

const About = () => {
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
                <span className="text-foreground">About</span>{" "}
                <span className="gradient-text">Unified Innovations Group</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed">
                Building the bridge between traditional finance and the future of money.
                We're on a mission to democratize access to sophisticated financial tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 md:p-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  To unify the fragmented world of finance by providing a single, secure, 
                  and intelligent platform that seamlessly integrates traditional banking, 
                  digital assets, and AI-powered insights for individuals and businesses worldwide.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 md:p-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  Our Vision
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  A world where everyone has access to institutional-grade financial services, 
                  where money moves freely across borders and asset classes, and where AI 
                  empowers every financial decision.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-navy-900/30">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                <span className="text-foreground">Our Core</span>{" "}
                <span className="gradient-text">Values</span>
              </h2>
              <p className="text-navy-400 text-lg max-w-2xl mx-auto">
                The principles that guide every decision we make.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card-hover p-6 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-navy-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
                <span className="text-foreground">Compliance-First</span>{" "}
                <span className="gradient-text">Philosophy</span>
              </h2>
              <p className="text-navy-300 text-lg leading-relaxed mb-8">
                At UIG, regulatory compliance isn't an afterthought—it's foundational to everything we build. 
                We work proactively with regulators worldwide to ensure our platform meets and exceeds 
                the highest standards of financial security and consumer protection.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {["SOC 2 Type II", "GDPR", "PCI DSS", "ISO 27001"].map((cert) => (
                  <span key={cert} className="trust-badge">
                    <Shield className="w-4 h-4 text-gold" />
                    {cert}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;