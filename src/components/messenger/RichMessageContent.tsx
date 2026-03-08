import React, { useMemo } from "react";

/* ─── Greek/Math symbol map for inline LaTeX ─── */
const SYMBOLS: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ", eta: "η",
  theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ",
  pi: "π", rho: "ρ", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", chi: "χ",
  psi: "ψ", omega: "ω", Alpha: "Α", Beta: "Β", Gamma: "Γ", Delta: "Δ",
  Epsilon: "Ε", Theta: "Θ", Lambda: "Λ", Pi: "Π", Sigma: "Σ", Phi: "Φ",
  Psi: "Ψ", Omega: "Ω", infty: "∞", nabla: "∇", partial: "∂", sum: "∑",
  prod: "∏", int: "∫", sqrt: "√", approx: "≈", neq: "≠", leq: "≤", geq: "≥",
  pm: "±", times: "×", cdot: "·", div: "÷", forall: "∀", exists: "∃",
  in: "∈", notin: "∉", subset: "⊂", supset: "⊃", cup: "∪", cap: "∩",
  rightarrow: "→", leftarrow: "←", Rightarrow: "⇒", Leftarrow: "⇐",
  leftrightarrow: "↔",
};

function renderLatexText(tex: string): string {
  let result = tex.replace(/\\([a-zA-Z]+)/g, (_, cmd) => SYMBOLS[cmd] ?? `\\${cmd}`);
  result = result.replace(/\^{([^}]+)}/g, (_, s) => toSuperscript(s));
  result = result.replace(/\^(\w)/g, (_, s) => toSuperscript(s));
  result = result.replace(/_{([^}]+)}/g, (_, s) => toSubscript(s));
  result = result.replace(/_(\w)/g, (_, s) => toSubscript(s));
  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, "($1/$2)");
  return result;
}

function toSuperscript(s: string): string {
  const map: Record<string, string> = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","=":"⁼","(":"⁽",")":"⁾","n":"ⁿ","i":"ⁱ" };
  return s.split("").map(c => map[c] ?? c).join("");
}

function toSubscript(s: string): string {
  const map: Record<string, string> = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","+":"₊","-":"₋","=":"₌","(":"₍",")":"₎" };
  return s.split("").map(c => map[c] ?? c).join("");
}

/* ─── Syntax highlighting for code blocks ─── */
const KEYWORDS = new Set(["def","class","import","from","return","if","else","elif","for","while","try","except","with","as","in","not","and","or","is","True","False","None","let","const","var","function","async","await","export","default","interface","type","extends","implements","new","this","super","null","undefined","true","false","yield","break","continue","switch","case","throw","catch","finally","do","of","public","private","protected","static","readonly","enum","abstract","void","int","float","double","string","bool","char","struct","print","self","lambda","pass","raise","global","nonlocal"]);

function highlightCode(code: string, lang: string): React.ReactElement[] {
  return code.split("\n").map((line, i) => {
    const highlighted = line
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="text-success">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-gold">$1</span>')
      .replace(/(#.*$|\/\/.*$)/gm, '<span class="text-muted-foreground/60 italic">$1</span>')
      .replace(/\b(\w+)\b/g, (match) => KEYWORDS.has(match) ? `<span class="text-info font-semibold">${match}</span>` : match);

    return (
      <div key={i} className="flex">
        <span className="w-8 text-right pr-3 text-muted-foreground/30 select-none text-[10px] leading-5">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    );
  });
}

/* ─── Data table parser ─── */
function parseDataTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text.trim().split("\n").filter(l => l.trim().startsWith("|"));
  if (lines.length < 2) return null;
  const parse = (line: string) => line.split("|").map(c => c.trim()).filter(Boolean);
  const headers = parse(lines[0]);
  const dataLines = lines.filter(l => !l.match(/^\|[\s-|]+\|$/));
  const rows = dataLines.slice(1).map(parse);
  if (headers.length === 0 || rows.length === 0) return null;
  return { headers, rows };
}

/* ─── Main Component ─── */
interface RichMessageContentProps {
  text: string;
  isMine: boolean;
}

const RichMessageContent = ({ text, isMine }: RichMessageContentProps) => {
  const parts = useMemo(() => {
    const result: JSX.Element[] = [];
    let remaining = text;
    let key = 0;

    // Check for data table
    if (remaining.includes("|") && remaining.split("\n").filter(l => l.trim().startsWith("|")).length >= 2) {
      const table = parseDataTable(remaining);
      if (table) {
        result.push(
          <div key={key++} className="overflow-x-auto my-1.5 rounded-lg border border-border/50">
            <table className="w-full text-[11px] font-display">
              <thead>
                <tr className="bg-secondary/40">
                  {table.headers.map((h, i) => (
                    <th key={i} className="px-2.5 py-1.5 text-left font-semibold text-foreground/80 border-b border-border/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2.5 py-1.5 text-foreground/70">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        return result;
      }
    }

    // Split by code blocks first
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(remaining)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        result.push(
          <span key={key++}>{renderInlineContent(remaining.slice(lastIndex, match.index), isMine, key)}</span>
        );
      }

      const lang = match[1] || "code";
      const code = match[2].trim();

      result.push(
        <div key={key++} className="my-1.5 rounded-lg overflow-hidden border border-border/50">
          <div className="flex items-center justify-between px-3 py-1 bg-secondary/60 border-b border-border/30">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{lang}</span>
          </div>
          <div className="bg-secondary/20 px-3 py-2 font-mono text-[11px] leading-5 overflow-x-auto">
            {highlightCode(code, lang)}
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < remaining.length) {
      result.push(
        <span key={key++}>{renderInlineContent(remaining.slice(lastIndex), isMine, key * 100)}</span>
      );
    }

    return result;
  }, [text, isMine]);

  return <div className="whitespace-pre-wrap break-words">{parts}</div>;
};

/* Render inline content with LaTeX */
function renderInlineContent(text: string, isMine: boolean, baseKey: number): JSX.Element[] {
  const parts: JSX.Element[] = [];
  let key = baseKey;

  // Block LaTeX: $$...$$
  const blockLatexParts = text.split(/\$\$([\s\S]*?)\$\$/g);

  blockLatexParts.forEach((part, idx) => {
    if (idx % 2 === 1) {
      // Block LaTeX
      parts.push(
        <div key={key++} className="my-1.5 px-3 py-2 rounded-lg bg-secondary/30 border-l-2 border-accent/40 text-center">
          <span className="font-serif text-sm italic tracking-wide">{renderLatexText(part.trim())}</span>
        </div>
      );
    } else {
      // Process inline LaTeX: $...$
      const inlineParts = part.split(/\$([^$]+)\$/g);
      inlineParts.forEach((ip, iIdx) => {
        if (iIdx % 2 === 1) {
          parts.push(
            <span key={key++} className="font-serif italic text-[13px] px-0.5 text-accent/90">
              {renderLatexText(ip)}
            </span>
          );
        } else if (ip) {
          // Inline code: `...`
          const codeParts = ip.split(/`([^`]+)`/g);
          codeParts.forEach((cp, cIdx) => {
            if (cIdx % 2 === 1) {
              parts.push(
                <code key={key++} className="px-1 py-0.5 rounded bg-secondary/50 font-mono text-[11px] text-foreground/80 border border-border/30">
                  {cp}
                </code>
              );
            } else if (cp) {
              parts.push(<span key={key++}>{cp}</span>);
            }
          });
        }
      });
    }
  });

  return parts;
}

export default RichMessageContent;
