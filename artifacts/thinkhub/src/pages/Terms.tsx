import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { FileText, ExternalLink, ChevronRight, Shield, Globe, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "March 20, 2026";
const EFFECTIVE = "January 1, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using Think!Hub (operated by SciConnect Ltd., "we", "us", or "our"), you agree to be bound by these Terms of Service and our Privacy Policy. If you are using Think!Hub on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.

Think!Hub is a platform for academic researchers, scientists, and scholarly communities. You must be 18 years of age or older and affiliated with a recognised academic, research, or educational institution to create a full researcher account.`,
  },
  {
    id: "account",
    title: "2. Your Researcher Account",
    content: `You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information, including your institutional affiliation and, where linked, your ORCID iD. You may not impersonate another researcher or misrepresent your credentials.

You may link your account to your ORCID iD, Google Scholar profile, institutional SSO, or GitHub account. By linking these accounts, you authorise Think!Hub to read and import publicly available research data (publications, citations) from those services.

Think!Hub accounts are personal and non-transferable. You may not sell, trade, or otherwise transfer your account.`,
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use",
    content: `Think!Hub is a professional academic platform. You agree not to:

• Post false, misleading, or fabricated research data, results, or credentials
• Engage in research misconduct, plagiarism, or data manipulation
• Harass, threaten, or discriminate against other researchers
• Use the platform for commercial solicitation unrelated to research collaboration
• Attempt to circumvent blockchain attribution or provenance records
• Scrape or systematically harvest researcher data without authorisation
• Use automated bots to interact with the platform
• Share account access with others
• Violate applicable research ethics guidelines, institutional policies, or legal requirements

Violations may result in account suspension, permanent termination, and where appropriate, referral to institutional ethics bodies.`,
  },
  {
    id: "content",
    title: "4. Research Content & Intellectual Property",
    content: `You retain intellectual property rights to the research content you create or upload to Think!Hub (publications, datasets, lab notebook entries, discussion posts).

By posting content on Think!Hub, you grant SciConnect Ltd. a non-exclusive, worldwide, royalty-free licence to host, display, and distribute that content as part of the platform's operation. You do not grant us ownership of your research.

Collaborative content (co-authored papers, shared workspace documents) is owned jointly by the contributing researchers, governed by the collaboration agreement you establish in the workspace settings.

For blockchain-anchored records: the cryptographic hash of your content is written to a public blockchain. This hash is not your content itself — it proves existence and integrity without revealing the content. Removing your account does not remove on-chain hashes already written.`,
  },
  {
    id: "blockchain",
    title: "5. Blockchain Features & Research Attribution",
    content: `Think!Hub provides optional blockchain-based research attribution features including: content anchoring (creating tamper-proof timestamps), Soulbound Tokens (non-transferable achievement badges), Reputation Scores (composite research reputation), and Contribution Tracking (CRediT-compatible attribution).

Blockchain conversation validation features operate on an explicit consent basis:

Standard Chat: No blockchain recording. Private by default.
Single-Party Research Record: One researcher records their side. The other party is always notified.
Mutual Research Attribution: Requires explicit agreement from all parties.

You understand that blockchain records are immutable and public by nature. Think!Hub does not control or operate the underlying blockchain infrastructure and cannot alter or delete anchored records once confirmed.

We make no guarantees about blockchain network availability, gas costs, or confirmation times. Blockchain features are provided as-is and are described as research-oriented tools, not legally binding instruments in any jurisdiction.`,
  },
  {
    id: "privacy-section",
    title: "6. Privacy & Data",
    content: `Your privacy is fundamental to Think!Hub's values. We collect and process research-related personal data (name, institution, publications, research fields, activity) to operate the platform and personalise your experience.

We do not sell your personal data. We do not share identifiable research data with third parties for advertising purposes.

You have the right to export all your personal data, correct inaccurate information, and request deletion of your account and associated data. Collective research records (co-authored content, blockchain contributions) may be retained in anonymised form to preserve research integrity for your collaborators.

Full details are in our Privacy Policy. For GDPR-related requests, contact privacy@thinkhub.science.`,
  },
  {
    id: "ai",
    title: "7. AI Research Assistant Features",
    content: `Think!Hub includes AI-powered features (research recommendations, paper summaries, writing assistance, AI Copilot in Messenger). These features use large language models and may produce inaccurate, incomplete, or outdated information.

AI outputs on Think!Hub should be treated as research assistance tools, not authoritative sources. You are responsible for verifying AI-generated content before including it in research, publications, or grant applications.

Your use of AI features is governed by applicable AI usage policies. You must not use AI features to generate fabricated research data, plagiarise work, or produce misleading academic content.`,
  },
  {
    id: "termination",
    title: "8. Account Termination",
    content: `You may close your Think!Hub account at any time from Settings → Account → Delete Account. We will delete your personal data within 30 days, subject to legal retention requirements and research integrity obligations.

We may suspend or terminate accounts for violations of these Terms, fraudulent activity, or where required by law. We will notify you of account actions where legally permissible and practical, and provide reasonable opportunity to resolve disputes.`,
  },
  {
    id: "disclaimers",
    title: "9. Disclaimers & Limitation of Liability",
    content: `Think!Hub is provided "as is" and "as available". We do not warrant uninterrupted access, error-free operation, or the accuracy of research data imported from third-party sources (ORCID, PubMed, arXiv, Google Scholar).

To the maximum extent permitted by applicable law, SciConnect Ltd. is not liable for indirect, incidental, or consequential damages arising from use of the platform, including loss of research data, loss of access, or reliance on AI-generated content.

Our total liability to you for any claim arising from use of Think!Hub shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.`,
  },
  {
    id: "governing-law",
    title: "10. Governing Law & Disputes",
    content: `These Terms are governed by the laws of England and Wales. Disputes shall first be submitted to mediation. If mediation fails, disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

If you are an institution in the EU, you may also have rights under EU consumer protection law. Nothing in these Terms affects statutory rights that cannot be excluded by contract.`,
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    content: `We may update these Terms to reflect changes in law, platform features, or operational requirements. We will notify you of material changes via email and in-app notification at least 30 days before they take effect. Continued use of Think!Hub after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    id: "contact-legal",
    title: "12. Contact",
    content: `For legal enquiries regarding these Terms:

SciConnect Ltd.
Legal Department
legal@thinkhub.science

For privacy and data protection enquiries:
privacy@thinkhub.science

For DMCA/copyright notices:
copyright@thinkhub.science`,
  },
];

const Terms = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-foreground">Terms of Service</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE}
            </p>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-[13px] text-foreground leading-relaxed">
            <strong className="font-semibold">Plain language summary:</strong> Think!Hub is a platform for researchers. You own your work. We never sell your data. Blockchain features are always opt-in and consent-based. You can delete your account and export your data at any time.
            These full terms govern your use of the platform.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link to="/privacy" className="flex items-center gap-1.5 text-[12px] text-primary hover:underline">
              <Shield className="w-3.5 h-3.5" /> Privacy Policy <ChevronRight className="w-3 h-3" />
            </Link>
            <button onClick={() => {}} className="flex items-center gap-1.5 text-[12px] text-primary hover:underline">
              <Globe className="w-3.5 h-3.5" /> Cookie Policy <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
          <div className="grid sm:grid-cols-2 gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[13px] text-muted-foreground hover:text-primary transition-colors py-0.5 flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="scroll-mt-20"
          >
            <h2 className="text-[16px] font-semibold text-foreground mb-3">{section.title}</h2>
            <div className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line border-l-2 border-border pl-4">
              {section.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-foreground">Questions about these Terms?</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Our legal team is available at legal@thinkhub.science</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/privacy" className="px-4 py-2 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </Link>
          <a href="mailto:legal@thinkhub.science" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Contact Legal
          </a>
        </div>
      </div>
    </div>
  </AppLayout>
);

export default Terms;
