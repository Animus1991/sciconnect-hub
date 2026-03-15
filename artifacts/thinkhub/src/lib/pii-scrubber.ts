/* ─── PII Scrubbing Utility ─── */
import { PII_PATTERNS } from "@/components/ai-chat/types";

export interface ScrubResult {
  text: string;
  scrubbed: boolean;
  detectedTypes: string[];
}

export function scrubPII(input: string): ScrubResult {
  let text = input;
  const detectedTypes: string[] = [];

  for (const { pattern, replacement, label } of PII_PATTERNS) {
    // Reset regex lastIndex
    const regex = new RegExp(pattern.source, pattern.flags);
    if (regex.test(text)) {
      detectedTypes.push(label);
      text = text.replace(new RegExp(pattern.source, pattern.flags), replacement);
    }
  }

  return { text, scrubbed: detectedTypes.length > 0, detectedTypes };
}

export function hasPII(input: string): boolean {
  for (const { pattern } of PII_PATTERNS) {
    if (new RegExp(pattern.source, pattern.flags).test(input)) return true;
  }
  return false;
}
