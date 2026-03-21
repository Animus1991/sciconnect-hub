import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Shield, ChevronRight, Mail, Lock, Eye, Database, Trash2, Download, Globe, FileText, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "March 20, 2026";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    content: `Think!Hub (operated by SciConnect Ltd.) is committed to protecting the privacy of researchers and academics on our platform. This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and your rights over it.

Think!Hub is a platform designed for academic research. Our data practices are guided by the principle that your research belongs to you — we are stewards of your data, not owners of it.

This policy applies to all services accessible at thinkhub.science and related sub-domains. It is compliant with the General Data Protection Regulation (GDPR), the UK Data Protection Act 2018, and relevant international data protection standards.`,
  },
  {
    id: "data-collected",
    title: "2. Data We Collect",
    content: `We collect the following categories of data:

Account & Identity Data
• Name, email address, password (hashed)
• ORCID iD, institutional affiliation, academic position
• Profile photo (optional), biography, social links

Research & Professional Data
• Publications list (imported from ORCID, Scholar, BibTeX, or entered manually)
• Research fields, keywords, expertise areas
• Citation metrics, h-index (retrieved from public academic databases)
• Lab notebook entries, reading list, saved searches

Platform Activity Data
• Pages visited, features used, search queries
• Messages sent (stored encrypted at rest)
• Publications submitted, peer reviews completed
• Collaboration activity, contribution records

Blockchain & Attribution Data
• Cryptographic hashes anchored to public blockchains (these hashes are one-way — they do not reveal content)
• Soulbound Token (SBT) records linked to your research identity
• Contribution attribution metadata

Technical & Device Data
• IP address, browser type, device information (for security and abuse prevention)
• Session identifiers, cookies (see Cookie Policy)

Data You Provide Optionally
• Profile photo, website, academic interests
• Community posts, discussion replies
• Mentorship notes, funding application drafts`,
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Data",
    content: `We use your data to:

Operate the Platform (Contractual Necessity)
• Authenticate your account and maintain session security
• Display your profile, publications, and activity to other researchers
• Enable research collaboration features (workspaces, messages, projects)

Personalise Your Experience (Legitimate Interest)
• Recommend collaborators, papers, and opportunities based on your research interests
• Personalise your Feed with relevant research from your field
• Improve the accuracy of AI Copilot and research assistant features

Research Attribution (Legitimate Interest / Your Consent)
• Record your contributions to research projects (CRediT-compatible)
• Generate and display your Reputation Score
• Create blockchain-anchored records when you choose to do so

Communications (Consent / Contractual)
• Send in-app and email notifications you have subscribed to
• Inform you about platform updates, new features, and policy changes

Security & Compliance (Legal Obligation / Legitimate Interest)
• Detect and prevent fraud, abuse, and research misconduct
• Comply with applicable laws and legal processes
• Investigate reported content and enforce our Terms of Service

We do not use your data for targeted advertising. We do not sell your data to third parties.`,
  },
  {
    id: "data-sharing",
    title: "4. Data Sharing",
    content: `We share your data only in the following circumstances:

With Other Researchers (Based on Your Privacy Settings)
• Your public profile information is visible to other Think!Hub researchers by default
• You control visibility in Settings → Privacy: profile can be public, researchers-only, or connections-only
• Your publications are public by default; this can be restricted in settings

With Service Providers (Data Processing Agreements in Place)
• Cloud infrastructure: servers hosted on privacy-compliant EU/UK infrastructure
• Email delivery: transactional emails via a contracted processor
• AI models: research assistant features use contracted AI providers under strict data processing agreements

With Blockchain Networks (Irrevocable — Your Explicit Consent Required)
• When you choose to anchor content, a hash (not the content itself) is written to a public blockchain
• This is irreversible by design — we cannot delete on-chain records once confirmed
• You must explicitly initiate each anchoring action

With Regulators or Law Enforcement
• Where required by applicable law, court order, or to prevent imminent harm
• We notify users of such requests where legally permissible

We never share your personal data with data brokers, advertisers, or for marketing purposes.`,
  },
  {
    id: "your-rights",
    title: "5. Your Rights (GDPR & International)",
    content: `Under the GDPR and applicable data protection laws, you have the following rights:

Right of Access — Request a copy of all personal data we hold about you.
Right to Rectification — Correct inaccurate or incomplete data in your profile.
Right to Erasure ("Right to be Forgotten") — Delete your account and associated personal data. Note: blockchain hashes already confirmed cannot be deleted. Collaborative research contributions will be anonymised, not erased, to protect co-authors' integrity.
Right to Data Portability — Export your data in a machine-readable format (JSON/CSV) from Settings → Data & Privacy → Export My Data.
Right to Restrict Processing — Request that we pause processing your data in certain circumstances.
Right to Object — Object to processing based on legitimate interests, including profiling for recommendations.
Rights Related to Automated Decision-Making — Reputation Scores involve automated computation; you can request human review of your score.

To exercise any right, contact privacy@thinkhub.science or use the in-app controls in Settings → Data & Privacy. We respond within 30 days.`,
  },
  {
    id: "retention",
    title: "6. Data Retention",
    content: `We retain your personal data for as long as your account is active plus a 90-day grace period. After account deletion:

• Profile data, publications, and personal activity: deleted within 30 days
• Messages: deleted from our servers (your side) within 30 days
• Collaborative project contributions: anonymised (contributor name replaced with "Anonymous Contributor")
• Blockchain hashes: retained permanently on the public blockchain (immutable by design)
• Financial records (if applicable): retained 7 years per legal requirements
• Security logs: retained 12 months for fraud prevention

We perform annual data audits to purge data no longer required for operational or legal purposes.`,
  },
  {
    id: "security",
    title: "7. Security",
    content: `We implement technical and organisational measures to protect your research data:

• Passwords are hashed using bcrypt with per-user salts — we never store plaintext passwords
• All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
• Messages are stored encrypted at the database level
• Access to production systems is controlled by MFA and role-based permissions
• Regular third-party security audits and penetration testing
• Vulnerability disclosure program — report security issues to security@thinkhub.science

No system is perfectly secure. If you suspect unauthorised access to your account, contact security@thinkhub.science immediately.`,
  },
  {
    id: "cookies",
    title: "8. Cookies",
    content: `We use the following cookies:

Strictly Necessary Cookies
• Session authentication (cannot be disabled — required for the platform to function)
• CSRF protection tokens
• Theme and language preferences

Analytics Cookies (Opt-in)
• Usage analytics to improve platform features (privacy-preserving, aggregated, no cross-site tracking)
• No third-party advertising cookies

You can manage cookie preferences from the cookie consent banner on first visit or from Settings → Privacy → Cookie Preferences.`,
  },
  {
    id: "international",
    title: "9. International Data Transfers",
    content: `Think!Hub's primary servers are located in the UK and EU. Where data is processed outside these regions (e.g., by AI service providers), we ensure adequate safeguards through Standard Contractual Clauses (SCCs) approved by the UK ICO and European Commission.

For users in countries outside the UK/EU, local data protection laws may provide additional rights. Contact privacy@thinkhub.science for jurisdiction-specific information.`,
  },
  {
    id: "children",
    title: "10. Children's Privacy",
    content: `Think!Hub is intended for researchers 18 years of age and older. We do not knowingly collect data from persons under 18. If you believe a minor has registered, please contact privacy@thinkhub.science and we will delete the account promptly.`,
  },
  {
    id: "changes-privacy",
    title: "11. Changes to This Policy",
    content: `We will notify you of material changes to this Privacy Policy via email and in-app notification at least 30 days before changes take effect. Your continued use of Think!Hub after the effective date constitutes acknowledgement of the updated policy.

The current version and all historical versions are available at thinkhub.science/privacy/history.`,
  },
  {
    id: "contact-dpo",
    title: "12. Contact & Data Protection Officer",
    content: `Data Controller:
SciConnect Ltd.
privacy@thinkhub.science

For GDPR complaints, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk, or your local supervisory authority in the EU.`,
  },
];

const highlights = [
  { icon: Lock, label: "We don't sell your data", desc: "Never shared with advertisers or data brokers", color: "text-primary bg-primary/10" },
  { icon: Eye, label: "You control visibility", desc: "Fine-grained profile and publication privacy", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { icon: Download, label: "Full data portability", desc: "Export everything anytime — JSON and CSV", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  { icon: Trash2, label: "Right to deletion", desc: "Delete your account and data in one step", color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
];

const Privacy = () => (
  <AppLayout>
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-foreground">Privacy Policy</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Last updated: {LAST_UPDATED} · GDPR & UK DPA 2018 compliant</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {highlights.map((h) => (
            <div key={h.label} className="bg-card border border-border rounded-xl p-3 text-center space-y-1.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${h.color}`}>
                <h.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold text-foreground leading-tight">{h.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Table of Contents */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
          <div className="grid sm:grid-cols-2 gap-1">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-[13px] text-muted-foreground hover:text-primary transition-colors py-0.5 flex items-center gap-1.5">
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

      {/* Quick Rights Access */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[13px] font-semibold text-foreground mb-3">Exercise Your Rights</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Download, label: "Export My Data", desc: "Download everything in JSON/CSV", path: "/settings" },
            { icon: Eye, label: "Privacy Settings", desc: "Control who sees your profile", path: "/settings" },
            { icon: Trash2, label: "Delete Account", desc: "Permanently remove your data", path: "/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors group"
            >
              <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              <div>
                <p className="text-[12px] font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-muted-foreground">For GDPR requests or complaints about data processing, contact <a href="mailto:privacy@thinkhub.science" className="text-primary hover:underline">privacy@thinkhub.science</a></p>
          </div>
          <Link to="/terms" className="flex items-center gap-1.5 text-[12px] text-primary hover:underline flex-shrink-0">
            <FileText className="w-3.5 h-3.5" /> Terms of Service <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  </AppLayout>
);

export default Privacy;
