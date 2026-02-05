import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="text-8xl sm:text-9xl font-display font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mb-4">Page Not Found</h1>
        <p className="text-navy-400 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/"><Button className="btn-premium"><span className="relative z-10 flex items-center gap-2"><Home className="w-4 h-4" />Go Home</span></Button></Link>
          <Button variant="ghost" className="btn-ghost-gold" onClick={() => window.history.back()}><ArrowLeft className="w-4 h-4 mr-2" />Go Back</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
