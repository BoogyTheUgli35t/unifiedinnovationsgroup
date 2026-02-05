import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "UIG has completely transformed how I manage both my traditional investments and crypto portfolio. The unified dashboard is exactly what I needed.",
    author: "Sarah Chen",
    role: "Tech Executive",
    rating: 5,
  },
  {
    quote: "The business banking features are exceptional. Payroll integration, invoicing, and treasury management in one place. Saved us countless hours.",
    author: "Michael Torres",
    role: "Startup Founder",
    rating: 5,
  },
  {
    quote: "Finally, a platform that treats crypto as a legitimate asset class while maintaining the security standards of traditional banking.",
    author: "David Kim",
    role: "Investment Manager",
    rating: 5,
  },
];

export function Testimonials() {
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
            <span className="text-foreground">Trusted by</span>{" "}
            <span className="gradient-text">Innovators</span>
          </h2>
          <p className="text-navy-400 text-lg max-w-2xl mx-auto">
            Join thousands of forward-thinking individuals and businesses who chose UIG.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8"
            >
              <Quote className="w-10 h-10 text-gold/30 mb-4" />
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-navy-500">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}