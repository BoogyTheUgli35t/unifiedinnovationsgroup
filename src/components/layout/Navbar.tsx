import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  {
    name: "Products",
    href: "/products",
    children: [
      { name: "Personal Banking", href: "/products/personal" },
      { name: "Business Banking", href: "/products/business" },
      { name: "Crypto Center", href: "/products/crypto" },
      { name: "Investments", href: "/products/investments" },
    ],
  },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-navy-950/90 backdrop-blur-xl border-b border-navy-800/50"
          : "bg-transparent"
      )}
    >
      <nav className="container-padding mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-navy-950 font-display font-bold text-xl">U</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              Unified Innovations
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                    location.pathname === link.href
                      ? "text-gold"
                      : "text-navy-300 hover:text-foreground"
                  )}
                >
                  {link.name}
                  {link.children && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && openDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 rounded-xl glass-card p-2"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className="block px-4 py-3 rounded-lg text-sm text-navy-300 hover:text-foreground hover:bg-navy-800/50 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-navy-300 hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="btn-premium text-sm px-6 py-2">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-navy-950/95 backdrop-blur-xl border-t border-navy-800/50"
          >
            <div className="container-padding py-4 space-y-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.href}
                    className="block px-4 py-3 rounded-lg text-foreground font-medium"
                  >
                    {link.name}
                  </Link>
                  {link.children && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className="block px-4 py-2 rounded-lg text-sm text-navy-400"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2 border-t border-navy-800">
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button className="w-full btn-premium">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}