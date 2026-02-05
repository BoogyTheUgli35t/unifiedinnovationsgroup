import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-32 pb-20 bg-gradient-hero">
          <div className="container-padding mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6 text-center">
                <span className="text-foreground">Privacy</span>{" "}
                <span className="gradient-text">Policy</span>
              </h1>
              <p className="text-navy-400 text-center mb-4">
                Last updated: February 5, 2025
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="max-w-3xl mx-auto prose prose-invert">
              <div className="glass-card p-8 md:p-12 space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    1. Information We Collect
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    Unified Innovations Group ("UIG," "we," "us," or "our") collects information you provide directly to us, such as when you create an account, make a transaction, or contact us for support. This may include your name, email address, phone number, financial information, and government-issued identification.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and comply with legal obligations.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    3. Information Sharing
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, with regulatory authorities as required by law, and with your consent or at your direction.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    4. Data Security
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    We implement industry-standard security measures including encryption, secure data centers, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    5. Your Rights
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    Depending on your location, you may have rights regarding your personal information, including the right to access, correct, or delete your data. Contact us at privacy@unifiedinnovationsgroup.online to exercise these rights.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    6. Contact Us
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at UIG@unifiedinnovationsgroup.online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;