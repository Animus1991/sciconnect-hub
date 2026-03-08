import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTRIBUTION_TYPE_META, type Contribution } from "@/data/blockchainMockData";

interface AttributionChainVisualizationProps {
  contributions: Contribution[];
  onSelectContribution?: (id: string) => void;
  selectedId?: string | null;
}

export default function AttributionChainVisualization({ contributions, onSelectContribution, selectedId }: AttributionChainVisualizationProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const chains = useMemo(() => {
    const links: { source: Contribution; target: Contribution }[] = [];
    contributions.forEach(c => {
      if (c.linkedTo) {
        c.linkedTo.forEach(linkedId => {
          const target = contributions.find(x => x.id === linkedId);
          if (target) links.push({ source: c, target });
        });
      }
    });
    return links;
  }, [contributions]);

  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>([selectedId]);
    chains.forEach(({ source, target }) => {
      if (source.id === selectedId) ids.add(target.id);
      if (target.id === selectedId) ids.add(source.id);
    });
    return ids;
  }, [selectedId, chains]);

  if (chains.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 text-center">
        <Link2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-display">No attribution chains found in current view.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-base font-semibold text-foreground">Attribution Chains</h3>
          <p className="text-[11px] text-muted-foreground font-display mt-0.5">
            Interactive links between connected contributions — click to explore
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] font-display gap-1">
          <Link2 className="w-3 h-3" /> {chains.length} links
        </Badge>
      </div>

      <div className="space-y-3">
        {chains.map(({ source, target }, i) => {
          const sMeta = CONTRIBUTION_TYPE_META[source.type];
          const tMeta = CONTRIBUTION_TYPE_META[target.type];
          const isHighlighted = selectedId && connectedIds.has(source.id) && connectedIds.has(target.id);
          const isDimmed = selectedId && !isHighlighted;

          return (
            <motion.div
              key={`${source.id}-${target.id}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                isDimmed ? "opacity-30 border-border scale-[0.98]" :
                isHighlighted ? "border-accent/40 bg-accent/5 shadow-[0_0_12px_hsl(var(--accent)/0.15)]" :
                "border-border hover:border-accent/30 hover:shadow-sm"
              }`}
            >
              {/* Source node */}
              <motion.button
                onClick={() => onSelectContribution?.(source.id)}
                onMouseEnter={() => setHoveredId(source.id)}
                onMouseLeave={() => setHoveredId(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 flex-1 min-w-0 p-2 rounded-lg transition-colors relative ${
                  selectedId === source.id ? "bg-accent/10" : "hover:bg-secondary"
                }`}
              >
                {/* Pulse ring on connected nodes */}
                {isHighlighted && (
                  <motion.span
                    className="absolute inset-0 rounded-lg border-2 border-accent/30"
                    animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.04, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <span className="text-base flex-shrink-0">{sMeta.icon}</span>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-display font-medium text-foreground truncate">{source.title}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{source.author.name}</p>
                </div>
              </motion.button>

              {/* Animated edge/arrow */}
              <div className="flex flex-col items-center flex-shrink-0 px-1 relative">
                <motion.div
                  className="relative"
                  animate={isHighlighted ? { x: [0, 3, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className={`w-4 h-4 transition-colors duration-300 ${isHighlighted ? "text-accent" : "text-muted-foreground/40"}`} />
                </motion.div>
                {/* Animated dot traveling along edge */}
                {isHighlighted && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                    animate={{ left: ["-4px", "calc(100% + 4px)"], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <span className="text-[8px] text-muted-foreground font-display mt-0.5">links to</span>
              </div>

              {/* Target node */}
              <motion.button
                onClick={() => onSelectContribution?.(target.id)}
                onMouseEnter={() => setHoveredId(target.id)}
                onMouseLeave={() => setHoveredId(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 flex-1 min-w-0 p-2 rounded-lg transition-colors relative ${
                  selectedId === target.id ? "bg-accent/10" : "hover:bg-secondary"
                }`}
              >
                {isHighlighted && (
                  <motion.span
                    className="absolute inset-0 rounded-lg border-2 border-accent/30"
                    animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.04, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                )}
                <span className="text-base flex-shrink-0">{tMeta.icon}</span>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-display font-medium text-foreground truncate">{target.title}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{target.author.name}</p>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredId && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-3 p-3 bg-secondary rounded-lg border border-border"
          >
            {(() => {
              const c = contributions.find(x => x.id === hoveredId);
              if (!c) return null;
              const meta = CONTRIBUTION_TYPE_META[c.type];
              return (
                <div className="flex items-start gap-3">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-display font-semibold text-foreground">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground font-display mt-0.5">{c.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-display">
                      <span>{c.author.name}</span>
                      <span>Impact: {c.impactScore}</span>
                      <span>{c.verifications} verifications</span>
                      <Badge variant="outline" className="text-[8px]">{c.anchorStatus}</Badge>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
