import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Image, X, Eye, Download, Trash2, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface SharedFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  previewUrl?: string;
}

interface FileSharingProps {
  files: SharedFile[];
  onUpload: (files: SharedFile[]) => void;
  onDelete: (id: string) => void;
}

const fileTypeIcon = (type: SharedFile["type"]) => {
  switch (type) {
    case "pdf": return <FileText className="w-5 h-5 text-destructive" />;
    case "image": return <Image className="w-5 h-5 text-accent" />;
    case "document": return <FileText className="w-5 h-5 text-primary" />;
    default: return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

const getFileType = (name: string): SharedFile["type"] => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["doc", "docx", "txt", "md", "tex"].includes(ext)) return "document";
  return "other";
};

const FileSharing = ({ files, onUpload, onDelete }: FileSharingProps) => {
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: SharedFile[] = Array.from(fileList).map(f => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      type: getFileType(f.name),
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(1)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: "Dr. Alex Thompson",
      uploadedAt: "Just now",
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    onUpload(newFiles);
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">
        Shared Files
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/40 hover:bg-secondary/30"
        }`}
      >
        <Upload className={`w-6 h-6 ${dragging ? "text-accent" : "text-muted-foreground"}`} />
        <p className="text-xs font-display text-muted-foreground">
          {dragging ? "Drop files here" : "Drag & drop files or click to browse"}
        </p>
        <p className="text-[10px] text-muted-foreground/60">PDF, Images, Documents</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.doc,.docx,.txt,.md,.tex"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.map(file => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2.5 group"
          >
            {file.type === "image" && file.previewUrl ? (
              <img src={file.previewUrl} alt={file.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                {fileTypeIcon(file.type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-display font-medium text-foreground truncate">{file.name}</p>
              <p className="text-[10px] text-muted-foreground font-display">
                {file.size} · {file.uploadedBy} · {file.uploadedAt}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {(file.type === "image" || file.type === "pdf") && (
                <button
                  onClick={() => setPreviewFile(file)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={() => onDelete(file.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Inline preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          {previewFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-foreground">{previewFile.name}</h3>
                <Badge variant="outline" className="text-[9px] font-display">{previewFile.type.toUpperCase()}</Badge>
              </div>
              {previewFile.type === "image" && previewFile.previewUrl && (
                <img
                  src={previewFile.previewUrl}
                  alt={previewFile.name}
                  className="w-full rounded-lg border border-border"
                />
              )}
              {previewFile.type === "pdf" && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 bg-secondary/30 rounded-lg">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-display">PDF Preview</p>
                  <p className="text-xs text-muted-foreground/60 font-display">
                    Connect Lovable Cloud for full document rendering
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileSharing;
