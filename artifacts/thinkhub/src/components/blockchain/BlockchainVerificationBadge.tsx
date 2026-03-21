/* ─── Blockchain Verification Badge ─── */
import { Shield, ShieldCheck, ShieldAlert, Clock, CheckCircle2, Link2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type AnchorStatus = "pending" | "anchored" | "verified" | "unverified";

interface BlockchainVerificationBadgeProps {
  status: AnchorStatus;
  hash?: string;
  timestamp?: string;
  compact?: boolean;
  showHash?: boolean;
  className?: string;
}

const statusConfig: Record<AnchorStatus, { icon: typeof Shield; color: string; bg: string; label: string; description: string }> = {
  verified:   { icon: ShieldCheck,  color: "text-success",            bg: "bg-success/10 border-success/20", label: "Verified",   description: "On-chain verified with consensus" },
  anchored:   { icon: ShieldAlert,  color: "text-info",               bg: "bg-info/10 border-info/20",       label: "Anchored",   description: "Hash anchored to blockchain" },
  pending:    { icon: Clock,        color: "text-warning",            bg: "bg-warning/10 border-warning/20", label: "Pending",    description: "Awaiting blockchain confirmation" },
  unverified: { icon: Shield,       color: "text-muted-foreground/60", bg: "bg-muted border-border",          label: "Unverified", description: "Not yet submitted to chain" },
};

export function BlockchainVerificationBadge({ status, hash, timestamp, compact = false, showHash = false, className = "" }: BlockchainVerificationBadgeProps) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  const shortHash = hash ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ${className}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p className="font-semibold">{cfg.label}</p>
            <p className="text-muted-foreground">{cfg.description}</p>
            {shortHash && <p className="font-mono text-[10px]">SHA-256: {shortHash}</p>}
            {timestamp && <p className="text-[10px] text-muted-foreground">{timestamp}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`text-[10px] font-display gap-1 border ${cfg.bg} ${cfg.color} ${className}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
          {showHash && shortHash && (
            <span className="font-mono text-[9px] opacity-70">{shortHash}</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="text-xs space-y-1">
          <p className="font-semibold">{cfg.label} — {cfg.description}</p>
          {hash && <p className="font-mono text-[10px]">SHA-256: {hash}</p>}
          {timestamp && <p className="text-[10px] text-muted-foreground">Anchored: {timestamp}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Blockchain Timestamp Anchor ─── */
interface BlockchainTimestampProps {
  hash: string;
  anchoredAt?: string;
  txId?: string;
  className?: string;
}

export function BlockchainTimestamp({ hash, anchoredAt, txId, className = "" }: BlockchainTimestampProps) {
  const shortHash = `${hash.slice(0, 8)}…${hash.slice(-6)}`;
  const shortTx = txId ? `${txId.slice(0, 8)}…${txId.slice(-4)}` : null;

  return (
    <div className={`flex items-center gap-2 text-[10px] font-mono text-muted-foreground ${className}`}>
      <Link2 className="w-3 h-3 text-accent/60 flex-shrink-0" />
      <span title={hash}>{shortHash}</span>
      {anchoredAt && <span className="text-muted-foreground/60">• {anchoredAt}</span>}
      {shortTx && (
        <span className="text-accent/60" title={txId}>
          tx:{shortTx}
        </span>
      )}
    </div>
  );
}

/* ─── Blockchain Audit Entry ─── */
export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  hash: string;
  status: AnchorStatus;
}

export function BlockchainAuditTrail({ entries, maxVisible = 3 }: { entries: AuditEntry[]; maxVisible?: number }) {
  const visible = entries.slice(0, maxVisible);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3 text-accent" />
        Blockchain Audit Trail
      </div>
      {visible.map(e => (
        <div key={e.id} className="flex items-center gap-2 text-[10px] font-display text-muted-foreground pl-1 border-l-2 border-accent/20 ml-1.5">
          <BlockchainVerificationBadge status={e.status} compact />
          <span className="truncate flex-1">{e.action}</span>
          <span className="text-muted-foreground/50 flex-shrink-0">{e.timestamp}</span>
        </div>
      ))}
      {entries.length > maxVisible && (
        <p className="text-[9px] text-muted-foreground/50 pl-4">
          +{entries.length - maxVisible} more entries
        </p>
      )}
    </div>
  );
}

/* ─── Smart Contract Milestone Badge ─── */
interface MilestoneBadgeProps {
  status: "locked" | "unlocked" | "claimed";
  amount?: string;
  className?: string;
}

const milestoneConfig = {
  locked:   { icon: Shield,      color: "text-muted-foreground", bg: "bg-muted",       label: "Locked" },
  unlocked: { icon: CheckCircle2, color: "text-success",         bg: "bg-success/10",  label: "Unlocked" },
  claimed:  { icon: ShieldCheck,  color: "text-accent",          bg: "bg-accent/10",   label: "Claimed" },
};

export function SmartContractMilestoneBadge({ status, amount, className = "" }: MilestoneBadgeProps) {
  const cfg = milestoneConfig[status];
  const Icon = cfg.icon;

  return (
    <Badge variant="outline" className={`text-[10px] font-display gap-1 ${cfg.bg} ${cfg.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
      {amount && <span className="font-mono">{amount}</span>}
    </Badge>
  );
}
