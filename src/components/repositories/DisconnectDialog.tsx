import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";

interface DisconnectDialogProps {
  repoName: string;
  repoIcon: string;
  papers: number;
  onClose: () => void;
  onConfirm: () => void;
}

const DisconnectDialog = ({ repoName, repoIcon, papers, onClose, onConfirm }: DisconnectDialogProps) => {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const needsTypedConfirm = papers > 0;
  const canConfirm = !needsTypedConfirm || confirmText.toLowerCase() === "disconnect";

  const handleDisconnect = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
      toast.info(`Disconnected from ${repoName}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="font-display font-bold text-foreground text-lg mb-1">Disconnect {repoName}?</h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">{repoIcon}</span>
          </div>
          <p className="text-sm text-muted-foreground font-display leading-relaxed mb-4">
            This will remove the connection and stop syncing data.
            {papers > 0 && (
              <> <span className="text-foreground font-medium">{papers} synced papers</span> will remain in your library but won't update.</>
            )}
          </p>

          {needsTypedConfirm && (
            <div className="mb-4">
              <p className="text-[10px] text-muted-foreground font-display mb-1.5">
                Type <span className="font-mono text-foreground font-medium">disconnect</span> to confirm
              </p>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="disconnect"
                className="w-full h-9 px-3 rounded-lg bg-secondary/30 border border-border text-sm font-mono text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-secondary text-foreground font-display font-medium text-sm hover:bg-secondary/80 transition-colors">
              Cancel
            </button>
            <button onClick={handleDisconnect} disabled={!canConfirm || confirming}
              className="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground font-display font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-destructive/90 transition-colors disabled:opacity-50">
              {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
              {confirming ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DisconnectDialog;
