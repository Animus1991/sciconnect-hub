/**
 * Soulbound Token (SBT) Gallery
 * Animated cards with rarity tiers and blockchain metadata
 */
import { motion } from "framer-motion";
import { Award, Sparkles, Shield, ShieldCheck, ExternalLink, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mockReputation } from "@/data/blockchainMockData";
import { mockHash } from "@/lib/blockchain-utils";

interface SBTCardData {
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedDate: string;
  hash: string;
  txId?: string;
  category?: string;
  verifications?: number;
}

const rarityConfig = {
  common: {
    label: "Common",
    border: "border-border",
    bg: "bg-secondary/30",
    glow: "",
    textColor: "text-muted-foreground",
    badgeBg: "bg-secondary text-muted-foreground",
    icon: Shield,
  },
  rare: {
    label: "Rare",
    border: "border-info/40",
    bg: "bg-info/5",
    glow: "shadow-[0_0_15px_-3px_hsl(var(--info)/0.2)]",
    textColor: "text-info",
    badgeBg: "bg-info/10 text-info border-info/20",
    icon: ShieldCheck,
  },
  epic: {
    label: "Epic",
    border: "border-highlight/40",
    bg: "bg-highlight/5",
    glow: "shadow-[0_0_20px_-3px_hsl(var(--highlight)/0.25)]",
    textColor: "text-highlight",
    badgeBg: "bg-highlight/10 text-highlight border-highlight/20",
    icon: Award,
  },
  legendary: {
    label: "Legendary",
    border: "border-gold/50",
    bg: "bg-gold/5",
    glow: "shadow-[0_0_25px_-3px_hsl(var(--gold)/0.3)]",
    textColor: "text-gold",
    badgeBg: "bg-gold/10 text-gold border-gold/30",
    icon: Sparkles,
  },
};

function SBTCard({ token, index }: { token: SBTCardData; index: number }) {
  const r = rarityConfig[token.rarity];
  const Icon = r.icon;
  const shortHash = `${token.hash.slice(0, 8)}…${token.hash.slice(-6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative rounded-xl border ${r.border} ${r.bg} ${r.glow} p-4 transition-all duration-300 overflow-hidden`}
    >
      {/* Rarity shimmer for legendary */}
      {token.rarity === "legendary" && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 animate-pulse-gold pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${r.bg} border ${r.border} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${r.textColor}`} />
          </div>
          <Badge variant="outline" className={`text-[9px] font-display font-bold ${r.badgeBg}`}>
            {r.label}
          </Badge>
        </div>

        {/* Name & Description */}
        <h4 className="font-serif text-sm font-semibold text-foreground mb-1">{token.name}</h4>
        <p className="text-[11px] text-muted-foreground font-display leading-relaxed mb-3">{token.description}</p>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-display">
            <span className="text-muted-foreground">Earned</span>
            <span className="text-foreground font-medium">{token.earnedDate}</span>
          </div>
          {token.verifications !== undefined && (
            <div className="flex items-center justify-between text-[10px] font-display">
              <span className="text-muted-foreground">Verifications</span>
              <span className="text-foreground font-medium">{token.verifications}</span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/60 cursor-help">
                <Hash className="w-3 h-3" />
                <span>{shortHash}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-[10px] font-mono break-all">SHA-256: {token.hash}</p>
              {token.txId && <p className="text-[10px] font-mono mt-1">Tx: {token.txId}</p>}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}

export function SBTGallery({ compact = false }: { compact?: boolean }) {
  const tokens: SBTCardData[] = mockReputation.sbtTokens.map(t => ({
    name: t.name,
    description: t.description,
    rarity: t.rarity === "common" ? "common" : t.rarity === "rare" ? "rare" : "legendary",
    earnedDate: t.earnedDate,
    hash: mockHash(t.name),
    txId: `0x${mockHash(t.name).slice(0, 40)}`,
    verifications: Math.floor(Math.random() * 20) + 3,
  }));

  if (compact) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tokens.slice(0, 4).map((token, i) => (
          <SBTCard key={token.name} token={token} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="font-serif text-base font-semibold text-foreground">Soulbound Token Gallery</h3>
        <Badge variant="outline" className="text-[9px] font-display text-muted-foreground">{tokens.length} tokens</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tokens.map((token, i) => (
          <SBTCard key={token.name} token={token} index={i} />
        ))}
      </div>
    </div>
  );
}
