import jsPDF from "jspdf";

interface ProtocolForPDF {
  title: string;
  category: string;
  author: { name: string };
  version: string;
  lastModified: string;
  description: string;
  steps: { order: number; title: string; content: string; duration?: string; caution?: string }[];
  materials: string[];
  versions: { version: string; date: string; changes: string }[];
  comments: { author: string; text: string; date: string }[];
  tags: string[];
}

export function exportProtocolToPDF(protocol: ProtocolForPDF) {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(protocol.title, pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 4;

  // Meta
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Author: ${protocol.author.name}  |  Version: ${protocol.version}  |  Category: ${protocol.category}`, margin, y);
  y += 6;
  doc.text(`Last modified: ${protocol.lastModified}  |  Tags: ${protocol.tags.join(", ")}`, margin, y);
  y += 10;

  // Description
  doc.setTextColor(0);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(protocol.description, pageWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 8;

  // Line
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageWidth, y);
  y += 8;

  // Steps
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Steps", margin, y);
  y += 8;

  protocol.steps.forEach(step => {
    checkPage(30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${step.order}. ${step.title}${step.duration ? ` (${step.duration})` : ""}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(step.content, pageWidth - 10);
    doc.text(contentLines, margin + 5, y);
    y += contentLines.length * 4.5 + 2;

    if (step.caution) {
      doc.setTextColor(180, 100, 0);
      doc.text(`⚠ ${step.caution}`, margin + 5, y);
      doc.setTextColor(0);
      y += 5;
    }
    y += 4;
  });

  // Materials
  checkPage(20);
  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, margin + pageWidth, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Materials", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  protocol.materials.forEach(mat => {
    checkPage(8);
    doc.text(`• ${mat}`, margin + 5, y);
    y += 5;
  });

  // Version History
  if (protocol.versions.length > 0) {
    checkPage(20);
    y += 8;
    doc.setDrawColor(200);
    doc.line(margin, y, margin + pageWidth, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Version History", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    protocol.versions.forEach(v => {
      checkPage(10);
      doc.text(`v${v.version} (${v.date}): ${v.changes}`, margin + 5, y);
      y += 5;
    });
  }

  // Comments
  if (protocol.comments.length > 0) {
    checkPage(20);
    y += 8;
    doc.setDrawColor(200);
    doc.line(margin, y, margin + pageWidth, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comments", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    protocol.comments.forEach(c => {
      checkPage(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${c.author} (${c.date})`, margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const commentLines = doc.splitTextToSize(c.text, pageWidth - 10);
      doc.text(commentLines, margin + 5, y);
      y += commentLines.length * 4.5 + 4;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `SciConnect Protocol Export — Page ${i}/${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`protocol-${protocol.title.replace(/\s+/g, "-").toLowerCase().slice(0, 40)}.pdf`);
}
