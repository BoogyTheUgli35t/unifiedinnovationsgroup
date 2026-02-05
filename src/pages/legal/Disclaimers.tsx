import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlertTriangle } from "lucide-react";

const Disclaimers = () => {
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
                <span className="text-foreground">Important</span>{" "}
                <span className="gradient-text">Disclaimers</span>
              </h1>
              <p className="text-lg text-navy-300 leading-relaxed">
                Please read these important notices regarding our services.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Demo Platform Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 border-l-4 border-warning"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-warning flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                      Demo Platform Notice
                    </h2>
                    <p className="text-navy-300 leading-relaxed">
                      <strong className="text-foreground">This is a demonstration platform.</strong> Unified Innovations Group (UIG) is presented as a conceptual financial services platform for demonstration and educational purposes only. No actual financial services are being offered. All account balances, transactions, and portfolio values shown are simulated data.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Not a Licensed Institution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Not a Licensed Financial Institution
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  Unified Innovations Group is not a bank, credit union, broker-dealer, investment advisor, or any other licensed financial institution. We do not hold any financial services licenses and are not regulated by any financial regulatory authority. This platform does not provide actual banking, investment, or financial advisory services.
                </p>
              </motion.div>

              {/* Cryptocurrency Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 border-l-4 border-destructive"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Cryptocurrency Disclaimer
                </h2>
                <p className="text-navy-300 leading-relaxed mb-4">
                  <strong className="text-foreground">Cryptocurrency is not FDIC insured.</strong> Digital assets are highly volatile and may lose value. Past performance is not indicative of future results. Cryptocurrency investments are not protected by SIPC or any government insurance program.
                </p>
                <p className="text-navy-300 leading-relaxed">
                  The cryptocurrency features shown on this platform are for demonstration purposes only. No actual cryptocurrency transactions can be executed through this platform.
                </p>
              </motion.div>

              {/* No FDIC Insurance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  No FDIC or SIPC Insurance
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  As this is a demonstration platform, no deposits or investments are protected by the Federal Deposit Insurance Corporation (FDIC) or the Securities Investor Protection Corporation (SIPC). Any account balances shown are simulated and do not represent actual funds.
                </p>
              </motion.div>

              {/* Investment Risks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Investment Risk Disclosure
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  All investments involve risk, including the potential loss of principal. The investment features shown on this platform are for illustrative purposes only. The performance data shown is hypothetical and does not represent actual investment results. Before making any investment decisions, consult with a qualified financial advisor.
                </p>
              </motion.div>

              {/* No Financial Advice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Not Financial Advice
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  Nothing on this platform constitutes financial, investment, legal, or tax advice. The information provided is for general informational purposes only and should not be relied upon for making financial decisions. Always consult with qualified professionals before making any financial decisions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimers;