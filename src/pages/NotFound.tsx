import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Atom, Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-6"
      >
        <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 shadow-gold">
          <Atom className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="font-serif text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="font-display text-lg text-muted-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground font-display mb-8">
          The page <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs font-mono">{location.pathname}</code> doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 h-10 px-5 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="mt-6 flex items-center gap-2 mx-auto text-xs text-muted-foreground font-display hover:text-foreground transition-colors"
        >
          <Search className="w-3 h-3" /> Or search for what you need
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Ctrl+K</kbd>
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
