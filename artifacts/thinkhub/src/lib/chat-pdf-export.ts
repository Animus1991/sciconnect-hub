import jsPDF from "jspdf";
import type { Message, Conversation } from "@/components/messenger/types";
import { evidenceTypes } from "@/components/messenger/types";
import { getContactName } from "@/components/messenger/mockData";

export function exportChatAsLabRecord(conversation: Conversation, messages: Message[]) {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const isNDA = conversation.ndaStatus === "accepted";
  const bcLevel = conversation.blockchainLevel;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  /* ─── Header ─── */
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Verified Lab Record", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Conversation: ${conversation.name}`, margin, y);
  y += 5;
  doc.text(`Type: ${conversation.type === "group" ? "Group" : "Direct"} · Participants: ${conversation.participants.map(p => p.name).join(", ")}`, margin, y);
  y += 5;
  doc.text(`Exported: ${new Date().toISOString()}`, margin, y);
  y += 5;
  doc.text(`Blockchain Level: ${bcLevel === "mutual" ? "P2P Verified (Mutual)" : bcLevel === "unilateral" ? "My Messages Verified" : "Standard"}`, margin, y);
  y += 5;
  if (isNDA) {
    doc.setTextColor(180, 50, 50);
    doc.text(`NDA Status: ACTIVE — ${conversation.ndaAcceptedBy?.length ?? 0} participants accepted`, margin, y);
    doc.setTextColor(100);
  }
  y += 8;

  /* ─── Separator ─── */
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageWidth, y);
  y += 8;

  /* ─── Evidence Summary ─── */
  const evidenceMsgs = messages.filter(m => m.evidenceTag);
  if (evidenceMsgs.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Evidence Summary", margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    evidenceMsgs.forEach(m => {
      checkPage(14);
      const et = evidenceTypes.find(e => e.type === m.evidenceTag?.type);
      doc.setFont("helvetica", "bold");
      doc.text(`${et?.icon ?? "•"} ${m.evidenceTag!.label}`, margin + 2, y);
      doc.setFont("helvetica", "normal");
      if (m.evidenceTag?.hash) {
        doc.setTextColor(120);
        doc.text(`  [${m.evidenceTag.hash}]`, margin + 50, y);
        doc.setTextColor(0);
      }
      y += 4.5;
      const lines = doc.splitTextToSize(`${getContactName(m.senderId)} (${m.time}): ${m.text}`, pageWidth - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 4.5 + 3;
    });

    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, margin + pageWidth, y);
    y += 8;
  }

  /* ─── Blockchain Audit ─── */
  const hashedMsgs = messages.filter(m => m.blockchainHash);
  if (hashedMsgs.length > 0) {
    checkPage(16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`Blockchain Audit Trail (${hashedMsgs.length} hashed)`, margin, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    hashedMsgs.forEach(m => {
      checkPage(10);
      doc.setTextColor(80);
      doc.text(`${m.time} | ${getContactName(m.senderId)} | ${m.blockchainHash}`, margin + 2, y);
      y += 4;
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(m.text, pageWidth - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 4 + 3;
      doc.setFont("courier", "normal");
    });

    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, margin + pageWidth, y);
    y += 8;
  }

  /* ─── Full Transcript ─── */
  checkPage(12);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Full Transcript", margin, y);
  y += 7;

  doc.setFontSize(9);
  messages.filter(m => !m.deleted).forEach(m => {
    checkPage(16);
    const sender = getContactName(m.senderId);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    let meta = `${sender} · ${m.time}`;
    if (m.blockchainHash) meta += ` · 🔗 ${m.blockchainHash}`;
    if (m.evidenceTag) meta += ` · 🏷 ${m.evidenceTag.label}`;
    if (m.pinned) meta += " · 📌";
    doc.text(meta, margin + 2, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(m.text, pageWidth - 10);
    doc.text(lines, margin + 5, y);
    y += lines.length * 4.5 + 4;
  });

  /* ─── NDA Watermark on every page ─── */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Think!Hub Lab Record — Page ${i}/${pageCount} — ${new Date().toLocaleDateString()}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
    // NDA watermark
    if (isNDA) {
      doc.setFontSize(40);
      doc.setTextColor(230, 230, 230);
      doc.text("CONFIDENTIAL", 30, 160, { angle: 45 });
    }
  }

  const filename = `lab-record-${conversation.name.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}-${Date.now()}.pdf`;
  doc.save(filename);
}
