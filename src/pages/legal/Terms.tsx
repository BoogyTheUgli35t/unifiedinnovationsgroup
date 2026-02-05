import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
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
                <span className="text-foreground">Terms of</span>{" "}
                <span className="gradient-text">Service</span>
              </h1>
              <p className="text-navy-400 text-center mb-4">
                Last updated: February 5, 2025
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="glass-card p-8 md:p-12 space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    By accessing or using Unified Innovations Group's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    2. Eligibility
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    You must be at least 18 years old and legally able to enter into contracts to use our services. By using our services, you represent that you meet these requirements.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    3. Account Responsibilities
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    4. Prohibited Activities
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    You may not use our services for any illegal purpose, to violate any laws, to infringe on intellectual property rights, or to transmit malicious code. We reserve the right to terminate accounts that violate these terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    5. Service Modifications
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    We reserve the right to modify, suspend, or discontinue any aspect of our services at any time. We will provide reasonable notice of significant changes when possible.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    To the maximum extent permitted by law, UIG shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                    7. Governing Law
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.
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

export default Terms;