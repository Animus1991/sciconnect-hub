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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-6 flex flex-col items-center justify-center gap-4"
      >
        <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
          <Atom className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-[80px] font-bold text-muted-foreground/20 leading-none">404</h1>
        <p className="text-[22px] font-semibold text-foreground">Page not found</p>
        <p className="text-[13px] text-muted-foreground">
          The page <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs font-mono">{location.pathname}</code> doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link
            to="/"
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-secondary text-foreground text-[13px] font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="mt-6 flex items-center gap-2 mx-auto text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-3 h-3" /> Or search for what you need
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Ctrl+K</kbd>
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
