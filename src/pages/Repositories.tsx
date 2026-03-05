import AppLayout from "@/components/layout/AppLayout";
import RepositoryCard from "@/components/repositories/RepositoryCard";
import { repositories } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link2, Shield } from "lucide-react";

const Repositories = () => {
  const connected = repositories.filter(r => r.connected);
  const available = repositories.filter(r => !r.connected);

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Repository Connections</h1>
          <p className="text-muted-foreground font-display mb-8">
            Connect your accounts to import publications, sync data, and maintain your scholarly identity across platforms.
          </p>
        </motion.div>

        {/* Connected */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-brand" />
            <h2 className="font-display font-semibold text-foreground">Connected ({connected.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((repo, i) => (
              <RepositoryCard key={repo.name} index={i} {...repo} />
            ))}
          </div>
        </div>

        {/* Available */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">Available ({available.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((repo, i) => (
              <RepositoryCard key={repo.name} index={i + connected.length} {...repo} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Repositories;
