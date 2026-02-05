import { motion } from "framer-motion";
import { Shield, Lock, Building2, Zap, Globe } from "lucide-react";

const trustItems = [
  { icon: Shield, text: "Bank-Grade Security" },
  { icon: Lock, text: "256-bit SSL Encryption" },
  { icon: Building2, text: "Institutional Custody" },
  { icon: Zap, text: "Real-Time Processing" },
  { icon: Globe, text: "Global Coverage" },
];

export function TrustBar() {
  return (
    <section className="py-6 bg-navy-900/50 border-y border-navy-800/50">
      <div className="container-padding mx-auto">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-16">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 text-navy-400"
            >
              <item.icon className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}