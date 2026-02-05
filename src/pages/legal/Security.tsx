import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, Server, FileCheck, Users } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit SSL Encryption",
    description: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.",
  },
  {
    icon: Shield,
    title: "Multi-Factor Authentication",
    description: "Protect your account with multiple layers of verification including biometrics, SMS, and authenticator apps.",
  },
  {
    icon: Eye,
    title: "24/7 Fraud Monitoring",
    description: "Our AI-powered systems continuously monitor for suspicious activity and alert you to potential threats.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Your data is stored in SOC 2 Type II certified data centers with multiple redundancy layers.",
  },
  {
    icon: FileCheck,
    title: "Regular Audits",
    description: "We undergo regular third-party security audits and penetration testing to ensure our defenses remain strong.",
  },
  {
    icon: Users,
    title: "Employee Training",
    description: "All employees undergo rigorous security training and background checks before accessing sensitive systems.",
  },
];

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
                <span className="text-foreground">Security &</span>{" "}
                <span className="gradient-text">Compliance</span>
              </h1>
              <p className="text-lg text-navy-300 leading-relaxed">
                Your security is our top priority. Learn about the measures we take to protect your data and assets.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                <span className="text-foreground">How We</span>{" "}
                <span className="gradient-text">Protect You</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-navy-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="glass-card p-8 md:p-12">
                <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
                  Compliance Certifications
                </h2>
                <div className="flex flex-wrap gap-4 mb-8">
                  {["SOC 2 Type II", "PCI DSS", "GDPR", "ISO 27001", "CCPA"].map((cert) => (
                    <span key={cert} className="trust-badge">
                      <Shield className="w-4 h-4 text-gold" />
                      {cert}
                    </span>
                  ))}
                </div>
                <p className="text-navy-300 leading-relaxed">
                  Unified Innovations Group maintains rigorous compliance with industry standards and regulations. We undergo regular third-party audits to ensure our security practices meet or exceed the requirements of these certifications. Our commitment to compliance demonstrates our dedication to protecting your data and maintaining the highest standards of operational integrity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Security;