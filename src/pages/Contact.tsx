import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const result = contactSchema.safeParse(data);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitted(true);
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
  };

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
                <span className="text-foreground">Get in</span>{" "}
                <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-lg sm:text-xl text-navy-300 leading-relaxed">
                Have questions about our products or services? Our team is here to help.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="section-padding bg-navy-950">
          <div className="container-padding mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-navy-300 mb-8 leading-relaxed">
                  Reach out to us through any of the following channels. Our team typically
                  responds within 24-48 business hours.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">Email</h3>
                      <a
                        href="mailto:UIG@unifiedinnovationsgroup.online"
                        className="text-navy-400 hover:text-gold transition-colors"
                      >
                        UIG@unifiedinnovationsgroup.online
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">Phone</h3>
                      <p className="text-navy-400">+1 (888) UIG-BANK</p>
                      <p className="text-sm text-navy-500">Mon-Fri 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">Headquarters</h3>
                      <p className="text-navy-400">
                        One Financial Plaza<br />
                        New York, NY 10004<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-navy-400 mb-6">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="ghost"
                      className="btn-ghost-gold"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500"
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-foreground">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        className="bg-navy-900/50 border-navy-700 text-foreground placeholder:text-navy-500 resize-none"
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-premium"
                    >
                      {isSubmitting ? (
                        <span className="relative z-10">Sending...</span>
                      ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Send Message
                          <Send className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;