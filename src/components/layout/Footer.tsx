import { Link } from "react-router-dom";
import { Shield, Lock, Award } from "lucide-react";

const footerLinks = {
  products: [
    { name: "Personal Banking", href: "/products/personal" },
    { name: "Business Banking", href: "/products/business" },
    { name: "Crypto Center", href: "/products/crypto" },
    { name: "Investments", href: "/products/investments" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "Disclaimers", href: "/disclaimers" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800/50">
      {/* Trust Badges */}
      <div className="border-b border-navy-800/50">
        <div className="container-padding mx-auto py-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-navy-400">
              <Shield className="w-5 h-5 text-gold" />
              <span className="text-sm">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-3 text-navy-400">
              <Lock className="w-5 h-5 text-gold" />
              <span className="text-sm">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-3 text-navy-400">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-sm">SOC 2 Type II Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-padding mx-auto py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
                <span className="text-navy-950 font-display font-bold text-xl">U</span>
              </div>
              <span className="font-display font-semibold text-foreground">UIG</span>
            </Link>
            <p className="text-sm text-navy-400 leading-relaxed">
              Unified Innovations Group — where traditional banking meets the future of finance.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-navy-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-navy-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-navy-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-800/50">
        <div className="container-padding mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-navy-500">
            <p>© {new Date().getFullYear()} Unified Innovations Group. All rights reserved.</p>
            <p className="text-center md:text-right text-xs">
              This is a demonstration platform. Not a licensed financial institution.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}