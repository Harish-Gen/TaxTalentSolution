import { useEffect } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Shield,
  Mail,
} from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "scope", label: "Scope of Services" },
  { id: "eligibility", label: "User Eligibility" },
  { id: "accounts", label: "User Accounts" },
  { id: "content", label: "User Content" },
  { id: "platform-rights", label: "Platform Rights" },
  { id: "employer", label: "Employer Responsibilities" },
  { id: "candidate", label: "Candidate Responsibilities" },
  { id: "prohibited", label: "Prohibited Activities" },
  { id: "fees", label: "Fees & Payments" },
  { id: "ip", label: "Intellectual Property" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "disputes", label: "Dispute Resolution" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact" },
];

function SectionHeading({ num, id, title }: { num: number; id: string; title: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-4 scroll-mt-20">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
        {num}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Terms of Service</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
              Governed by Indian Law
            </Badge>
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              Bengaluru Jurisdiction
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These Terms constitute a legally binding agreement between you and{" "}
            <strong>Tax Talent Solution</strong>. Please read them carefully before using our
            platform.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Last updated: <strong>April 30, 2026</strong> &nbsp;|&nbsp; Effective: April 30, 2026
          </p>
        </div>

        {/* Notice box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            By accessing or using Tax Talent Solution you agree to be bound by these Terms. If you
            do not agree, you must not use our services.
          </p>
        </div>

        {/* Quick Nav */}
        <div className="bg-muted/40 rounded-xl p-6 mb-10">
          <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Jump to Section
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm px-3 py-1.5 rounded-md bg-white border hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* 1 */}
          <section id="introduction" className="scroll-mt-20">
            <SectionHeading num={1} id="introduction" title="Introduction" />
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                These Terms of Service ("<strong>Terms</strong>") constitute a legally binding
                agreement between you ("<strong>User</strong>", "you") and Tax Talent Solution ("
                <strong>Company</strong>", "we", "us").
              </p>
              <p>
                By accessing or using our platform at{" "}
                <strong>taxtalentsolution.com</strong>, you agree to be bound by these Terms. If you
                do not agree, you must not use our services.
              </p>
            </div>
          </section>

          <Separator />

          {/* 2 */}
          <section id="scope" className="scroll-mt-20">
            <SectionHeading num={2} id="scope" title="Scope of Services" />
            <p className="text-sm text-muted-foreground mb-2">
              Tax Talent Solution provides a platform to connect:
            </p>
            <BulletList items={["US CPA firms and employers", "Tax professionals and job seekers"]} />
            <p className="text-sm text-muted-foreground mt-4">
              We facilitate recruitment, talent matching, skill assessments, and related services.
              We do not guarantee hiring outcomes.
            </p>
          </section>

          <Separator />

          {/* 3 */}
          <section id="eligibility" className="scroll-mt-20">
            <SectionHeading num={3} id="eligibility" title="User Eligibility" />
            <BulletList
              items={[
                "You must be at least 18 years old",
                "You must provide accurate and complete information",
                "You must comply with all applicable Indian laws",
              ]}
            />
          </section>

          <Separator />

          {/* 4 */}
          <section id="accounts" className="scroll-mt-20">
            <SectionHeading num={4} id="accounts" title="User Accounts" />
            <p className="text-sm text-muted-foreground mb-2">You are responsible for:</p>
            <BulletList
              items={[
                "Maintaining the confidentiality of your account credentials",
                "All activities conducted under your account",
                "Providing accurate and up-to-date information",
              ]}
            />
          </section>

          <Separator />

          {/* 5 */}
          <section id="content" className="scroll-mt-20">
            <SectionHeading num={5} id="content" title="User Content" />
            <p className="text-sm text-muted-foreground mb-2">
              Users may submit resumes, job postings, and other content to the platform.
            </p>
            <BulletList
              items={[
                "You retain ownership of your content",
                "You grant us a non-exclusive license to use, display, and share it solely for service delivery",
                "You are solely responsible for the accuracy and legality of your content",
              ]}
            />
            <p className="text-sm text-muted-foreground mt-4">
              We do not verify or guarantee the accuracy of user-generated content.
            </p>
          </section>

          <Separator />

          {/* 6 */}
          <section id="platform-rights" className="scroll-mt-20">
            <SectionHeading num={6} id="platform-rights" title="Platform Rights" />
            <p className="text-sm text-muted-foreground mb-2">We reserve the right to:</p>
            <BulletList
              items={[
                "Review, remove, or reject any content at our sole discretion",
                "Suspend or terminate accounts that violate these Terms",
                "Modify, update, or discontinue services with or without notice",
              ]}
            />
          </section>

          <Separator />

          {/* 7 & 8 — side by side on larger screens */}
          <div className="grid md:grid-cols-2 gap-8">
            <section id="employer" className="scroll-mt-20">
              <SectionHeading num={7} id="employer" title="Employer Responsibilities" />
              <BulletList
                items={[
                  "Provide genuine and legally compliant job opportunities",
                  "Avoid misleading, fraudulent, or discriminatory postings",
                  "Comply with all employment laws applicable to your jurisdiction",
                  "Treat candidates with professionalism and respect",
                ]}
              />
            </section>

            <section id="candidate" className="scroll-mt-20">
              <SectionHeading num={8} id="candidate" title="Candidate Responsibilities" />
              <BulletList
                items={[
                  "Provide accurate qualifications, experience, and credentials",
                  "Avoid misrepresentation of skills or certifications",
                  "Maintain professional conduct in all interactions",
                  "Not share confidential employer information obtained through the platform",
                ]}
              />
            </section>
          </div>

          <Separator />

          {/* 9 */}
          <section id="prohibited" className="scroll-mt-20">
            <SectionHeading num={9} id="prohibited" title="Prohibited Activities" />
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-red-800 mb-3">
                The following activities are strictly prohibited:
              </p>
              <ul className="space-y-2">
                {[
                  "Submitting fraudulent, misleading, or defamatory content",
                  "Unauthorised data scraping, harvesting, or extraction",
                  "Uploading harmful, illegal, or infringing material",
                  "Attempting to breach platform security or circumvent access controls",
                  "Impersonating another user, employer, or company",
                  "Sending unsolicited communications or spam to other users",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Separator />

          {/* 10 */}
          <section id="fees" className="scroll-mt-20">
            <SectionHeading num={10} id="fees" title="Fees & Payments" />
            <p className="text-sm text-muted-foreground mb-2">
              Certain services may require payment. All fees:
            </p>
            <BulletList
              items={[
                "Are non-refundable unless explicitly stated otherwise in your subscription plan",
                "Must be paid as per the agreed billing terms",
                "Are subject to applicable GST and other taxes as per Indian law",
              ]}
            />
          </section>

          <Separator />

          {/* 11 */}
          <section id="ip" className="scroll-mt-20">
            <SectionHeading num={11} id="ip" title="Intellectual Property" />
            <p className="text-sm text-muted-foreground">
              All platform content, trademarks, logos, technology, and software are the exclusive
              property of Tax Talent Solution and are protected under applicable intellectual
              property laws. You may not reproduce, distribute, or create derivative works without
              our prior written consent.
            </p>
          </section>

          <Separator />

          {/* 12 */}
          <section id="disclaimer" className="scroll-mt-20">
            <SectionHeading num={12} id="disclaimer" title="Disclaimer of Warranties" />
            <div className="bg-gray-50 border rounded-lg p-5">
              <p className="text-sm text-muted-foreground mb-3">
                The platform is provided <strong>"as is"</strong> and{" "}
                <strong>"as available"</strong> without warranties of any kind, express or implied.
                We do not warrant or guarantee:
              </p>
              <BulletList
                items={[
                  "Job placement, hiring success, or employment outcomes",
                  "The accuracy, completeness, or reliability of listings or candidate profiles",
                  "Uninterrupted, error-free, or secure access to the platform",
                ]}
              />
            </div>
          </section>

          <Separator />

          {/* 13 */}
          <section id="liability" className="scroll-mt-20">
            <SectionHeading num={13} id="liability" title="Limitation of Liability" />
            <p className="text-sm text-muted-foreground mb-2">
              To the maximum extent permitted under Indian law:
            </p>
            <BulletList
              items={[
                "We are not liable for indirect, incidental, special, or consequential damages",
                "We are not responsible for interactions, disputes, or agreements between users",
                "Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim",
              ]}
            />
          </section>

          <Separator />

          {/* 14 */}
          <section id="indemnification" className="scroll-mt-20">
            <SectionHeading num={14} id="indemnification" title="Indemnification" />
            <p className="text-sm text-muted-foreground mb-2">
              You agree to indemnify, defend, and hold harmless Tax Talent Solution, its officers,
              directors, and employees from any claims, losses, or damages arising from:
            </p>
            <BulletList
              items={[
                "Your use of or access to the platform",
                "Your content, conduct, or misrepresentations",
                "Your violation of these Terms or any applicable law",
              ]}
            />
          </section>

          <Separator />

          {/* 15 */}
          <section id="termination" className="scroll-mt-20">
            <SectionHeading num={15} id="termination" title="Termination" />
            <p className="text-sm text-muted-foreground">
              We may suspend or terminate your access to the platform at any time, with or without
              notice, if you violate these Terms or engage in conduct we reasonably deem harmful to
              the platform or its users. Upon termination, your right to use the platform ceases
              immediately. Provisions relating to intellectual property, disclaimer, liability, and
              governing law shall survive termination.
            </p>
          </section>

          <Separator />

          {/* 16 */}
          <section id="governing-law" className="scroll-mt-20">
            <SectionHeading num={16} id="governing-law" title="Governing Law" />
            <div className="flex gap-3 border rounded-lg p-5 bg-blue-50/50">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  These Terms shall be governed by and construed in accordance with the{" "}
                  <strong className="text-foreground">laws of India</strong>.
                </p>
                <p>
                  Any disputes shall be subject to the exclusive jurisdiction of courts in{" "}
                  <strong className="text-foreground">Bengaluru, Karnataka, India</strong>.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* 17 */}
          <section id="disputes" className="scroll-mt-20">
            <SectionHeading num={17} id="disputes" title="Dispute Resolution" />
            <p className="text-sm text-muted-foreground mb-3">
              We encourage users to resolve disputes amicably by contacting our support team in the
              first instance. If a dispute cannot be resolved informally:
            </p>
            <BulletList
              items={[
                "Disputes may be referred to binding arbitration under the Arbitration and Conciliation Act, 1996 (India)",
                "Arbitration venue: Bengaluru, Karnataka, India",
                "Language of arbitration: English",
              ]}
            />
          </section>

          <Separator />

          {/* 18 */}
          <section id="changes" className="scroll-mt-20">
            <SectionHeading num={18} id="changes" title="Changes to Terms" />
            <p className="text-sm text-muted-foreground">
              We may update these Terms periodically to reflect changes in our services, legal
              requirements, or business practices. We will notify registered users of material
              changes via email or an in-platform notice. Continued use of the platform after
              changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <Separator />

          {/* 19 */}
          <section id="contact" className="scroll-mt-20">
            <SectionHeading num={19} id="contact" title="Contact" />
            <div className="border rounded-lg p-5 flex gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong className="text-foreground">Tax Talent Solution</strong>
                </p>
                <p>Bengaluru, KA, India</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:legal@taxtalentsolution.com"
                    className="text-primary underline"
                  >
                    legal@taxtalentsolution.com
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a
                    href="https://taxtalentsolution.com"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    taxtalentsolution.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* 20 */}
          <section id="acceptance" className="scroll-mt-20">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                By using Tax Talent Solution, you acknowledge that you have read, understood, and
                agreed to these Terms of Service. If you do not agree, please discontinue use of
                the platform immediately.
              </p>
            </div>
          </section>

          {/* Footer note */}
          <div className="bg-muted/40 rounded-xl p-6 text-center text-sm text-muted-foreground">
            <p>
              These Terms may be updated periodically. Registered users will be notified of material
              changes via email or in-platform notice.
            </p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
