import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ClipboardCheck,
  Users,
  Mic,
  Building2,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Share2,
} from "lucide-react";

interface Article {
  id: number;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badgeVariant: "default" | "secondary" | "outline";
  readTime: string;
  title: string;
  summary: string;
  body: string;
}

const articles: Article[] = [
  {
    id: 1,
    category: "Talent Quality",
    icon: ShieldCheck,
    iconColor: "text-primary",
    badgeVariant: "default",
    readTime: "4 min read",
    title: "How We Source Only the Most Skilled US Tax Professionals",
    summary:
      "Not every resume tells the full story. At Tax Talent Solution, we go beyond credentials — screening, assessing, and verifying every professional before they ever appear in an employer's search results.",
    body: `Finding the right US tax professional in today's market is harder than ever. With thousands of candidates claiming expertise in 1040 preparation, S-Corp filings, and partnership returns, employers face an uphill battle distinguishing genuine skill from inflated résumés.

**Our Rigorous Intake Process**

Every professional who joins Tax Talent Solution goes through a structured onboarding evaluation. We review their employment history, the types of returns they've handled, the volume of filings, and the complexity of the engagements — not just the job titles they've held.

**Domain-Specific Vetting**

We don't treat "US tax" as a single skill. Our intake questionnaire covers over 40 sub-specializations — from individual 1040 and Schedule C through complex partnership returns (Form 1065), C-Corp returns (Form 1120), and multi-state filings. Candidates are mapped to the precise areas they are genuinely qualified in.

**Quality Over Quantity**

Our platform is intentionally selective. We would rather present an employer with five deeply qualified candidates than fifty average ones. This philosophy means employers save hours in screening and move faster to confident hiring decisions.

**Continuous Profile Maintenance**

Profiles don't just sit static. As candidates complete new assessments, earn certifications, or accumulate experience, their profiles update — so employers always see a current, accurate picture of what each professional brings to the table.

The result: a talent pool where every profile is a genuine signal, not noise.`,
  },
  {
    id: 2,
    category: "Skill Assessment",
    icon: ClipboardCheck,
    iconColor: "text-emerald-600",
    badgeVariant: "secondary",
    readTime: "5 min read",
    title: "Verified Skills, Not Just Claimed Skills: Our Assessment Framework",
    summary:
      "Anyone can list '1040 expert' on their profile. We built a comprehensive assessment framework that objectively measures technical knowledge across every major US tax form and specialty.",
    body: `The gap between what candidates claim and what they can actually do is one of the most costly problems in professional hiring. A single mis-hire in a tax role can mean missed deadlines, IRS penalties for clients, and damaged firm reputation.

**Purpose-Built Tax Assessments**

Our assessments were developed in collaboration with experienced US tax practitioners. Each test is timed, scenario-based, and designed to probe real working knowledge — not textbook memorization.

**Coverage Across All Major Forms and Specialties**

- **Form 1040** — Individual returns, itemized deductions, credits, AMT
- **Schedule C / E / F** — Self-employment, rental income, farm income
- **Form 1065** — Partnership returns, K-1 allocations, basis calculations
- **Form 1120 / 1120-S** — C-Corp and S-Corp returns, built-in gains, AAA tracking
- **Private Equity & Operating Partnerships** — Complex waterfall allocations, Section 754 elections
- **Multi-state taxation** — Apportionment, nexus analysis, composite returns

**Scored and Certified**

Each completed assessment produces a numeric score and, when a passing threshold is met, a verified certificate that is displayed directly on the candidate's public profile. Employers can see exactly how a candidate performed — not just whether they "passed."

**Re-assessment and Growth Tracking**

Candidates can retake assessments after a cooling-off period, and their improvement over time is visible to employers. This rewards professionals who invest in their growth and gives employers confidence in candidates who show upward trajectory.

**Why This Matters for Employers**

When you search for a "Form 1065 specialist" on our platform, every result carries a verified assessment score. You're not guessing anymore — you're deciding.`,
  },
  {
    id: 3,
    category: "Interview Preparation",
    icon: Mic,
    iconColor: "text-violet-600",
    badgeVariant: "outline",
    readTime: "5 min read",
    title: "Mock Interviews: Why We Prepare Candidates Before They Meet You",
    summary:
      "A technically brilliant candidate who stumbles in an interview is a missed opportunity for everyone. Our mock interview program ensures that when candidates sit down with your team, they are composed, articulate, and ready.",
    body: `Technical knowledge and interview performance are two different skills. We've seen candidates with exceptional tax expertise lose opportunities simply because they weren't prepared to communicate their experience under pressure.

**Structured Mock Interview Program**

Every candidate on our platform has access to structured mock interviews before they engage with employers. These sessions simulate real hiring conversations — covering behavioral questions, technical deep-dives, scenario-based problem solving, and salary negotiation.

**Tax-Specific Interview Coaching**

Generic interview prep isn't enough for specialized tax roles. Our coaching is built around the actual questions that US CPA firms, Big Four, and corporate tax departments ask:

- *"Walk me through how you handle a complex K-1 with multiple activity types."*
- *"A client received a CP2000 notice — what's your process?"*
- *"How do you approach a first-year S-Corp election for a converting C-Corp?"*

Candidates practice articulating their actual experience with these scenarios, not just reciting definitions.

**Feedback and Iteration**

After each mock session, candidates receive structured feedback — what they communicated well, where they were vague, and how to improve their answers before the real interview. Most candidates do two to three mock sessions before they feel fully confident.

**The Employer Benefit**

When a candidate walks into your interview having already been through our mock program, the conversation is richer, faster, and more productive. You spend less time on surface-level questions and more time evaluating genuine fit for your specific role and culture.

**Reduced Drop-Off Rates**

Firms that hire through Tax Talent Solution report significantly lower offer-decline rates. Candidates who are well-prepared are more confident in their decisions and less likely to back out after an offer is extended.`,
  },
  {
    id: 4,
    category: "Employer Connection",
    icon: Building2,
    iconColor: "text-orange-500",
    badgeVariant: "default",
    readTime: "4 min read",
    title: "Bridging the Gap: How We Connect Verified Tax Talent to the Right Employers",
    summary:
      "Matching isn't just about finding someone with the right skills — it's about finding the right fit for your team's size, culture, work style, and specific tax practice. Our intelligent matching engine does the heavy lifting.",
    body: `The best hire isn't always the most technically qualified candidate. It's the one whose skills, experience level, and working style align with what your team actually needs right now.

**Intelligent Matching Engine**

Our platform doesn't just perform keyword searches. The matching algorithm considers:

- **Tax form specializations** — We match on specific forms and complexity levels, not broad categories
- **Experience depth** — Entry-level, mid-level, senior, and manager-level candidates are categorized and matched appropriately
- **Firm type preference** — Some professionals thrive in Big Four environments; others prefer boutique or regional firms. We surface candidates who are genuinely interested in your firm type
- **Compensation alignment** — Salary expectations are captured upfront so both sides only invest time in conversations where the economics can work
- **Location and work arrangement** — Remote-only, hybrid, and in-office preferences are matched before a connection is made

**Employer Profiles That Attract the Best**

We also help employers present themselves well. Your firm's profile — including culture, growth opportunities, team structure, and the types of returns you handle — is visible to candidates evaluating their options. The best candidates choose carefully, and we make sure your firm stands out.

**Direct Messaging and Interview Scheduling**

Once a match is confirmed, employers can message candidates directly and schedule interviews through the platform. No middlemen, no delays. The entire process from search to scheduled interview can happen in under 24 hours.

**Pipeline Transparency**

Employers see every stage of every candidate they're engaging — applied, reviewed, interviewing, offer extended. Candidates see the same for their applications. Full transparency reduces ghosting, miscommunication, and wasted time on both sides.`,
  },
  {
    id: 5,
    category: "Candidate Success",
    icon: TrendingUp,
    iconColor: "text-blue-600",
    badgeVariant: "secondary",
    readTime: "4 min read",
    title: "From Profile to Placement: A Candidate's Journey on Tax Talent Solution",
    summary:
      "What does it actually look like to go from creating your profile to receiving a job offer? We walk through the complete candidate experience — designed to maximize your chances at every step.",
    body: `Getting hired for a US tax role from India is not just about having the right experience. It's about presenting that experience in a way that resonates with US employers, demonstrating verified skills, and being ready when the right opportunity arrives. Here's how our platform makes that happen.

**Step 1: Build a Complete Profile**

Your profile is your digital first impression. We guide you through building a thorough profile that includes:
- All tax forms you've worked on and at what complexity level
- Years of experience in each specialty
- Prior employers and the size of tax practices you've supported
- Professional certifications and continuing education

**Step 2: Take Targeted Assessments**

Based on your stated experience, our platform recommends the assessments most relevant to your profile. Taking and passing these adds verified badges to your profile, immediately increasing your visibility to employers searching for those skills.

**Step 3: Complete Mock Interview Preparation**

Before your profile is fully activated for employer searches, we encourage you to complete at least one mock interview session. Candidates who do this report significantly higher confidence and better outcomes in real interviews.

**Step 4: Get Discovered by Employers**

Once your profile is active, employers searching for your specializations will find you. You'll receive notifications when an employer views your profile or expresses interest. You can also actively browse and apply to posted positions.

**Step 5: Interview and Offer**

Our in-platform messaging and scheduling tools make the interview process smooth. After interviews, you receive structured feedback and, when the fit is right, an offer directly through the platform.

**Step 6: Continuous Growth**

Even after placement, your profile remains active and your assessment history grows. Many professionals on our platform return when they're ready for their next move — and find the process even faster the second time.`,
  },
  {
    id: 6,
    category: "Industry Insight",
    icon: Users,
    iconColor: "text-rose-500",
    badgeVariant: "outline",
    readTime: "3 min read",
    title: "Why US CPA Firms Are Turning to Verified Talent Platforms to Hire Faster",
    summary:
      "The traditional hiring process for US tax roles is broken. Unverified résumés, lengthy screening cycles, and high mis-hire rates are pushing forward-thinking firms toward smarter, skill-verified alternatives.",
    body: `The demand for qualified US tax professionals — particularly those based in India serving US firms — has never been higher. Yet the hiring process at most firms remains stuck in a model designed decades ago: post a job, receive hundreds of résumés, spend weeks screening, interview finalists, and hope the one you choose actually has the skills they claimed.

**The Cost of the Traditional Model**

Research consistently shows that a bad hire in a professional services role costs the equivalent of six to nine months of that employee's salary when you account for onboarding, lost productivity, client impact, and rehiring costs. In tax, where errors have direct financial and legal consequences for clients, the stakes are even higher.

**What Forward-Thinking Firms Are Doing Differently**

The CPA firms and corporate tax departments seeing the best hiring outcomes share several practices:

1. **They require verified skills before the first interview.** Rather than taking a candidate's word for their 1065 experience, they rely on third-party assessment scores.

2. **They use platform-based recruiting over job boards.** General job boards surface volume. Specialized platforms surface quality. When every candidate in a pool has been pre-screened for US tax domain knowledge, the hiring team's time is used far more efficiently.

3. **They invest in candidate experience.** The best candidates have options. Firms that respond quickly, communicate clearly, and run structured interview processes win more often than firms that keep candidates waiting.

4. **They look at profile trajectory, not just credentials.** A candidate who scored 72% on their first 1120 assessment and 91% on their second is showing growth that a static résumé would never reveal.

**Tax Talent Solution as a Hiring Advantage**

Our platform was built specifically to solve these problems. The result: firms that hire through Tax Talent Solution report faster time-to-hire, higher quality candidates, and significantly better retention at the 12-month mark.

The future of tax hiring is verified, transparent, and fast. We're already there.`,
  },
];

function renderBodyToHtml(body: string): string {
  return body
    .split("\n\n")
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      const rendered = lines
        .map((line) => {
          const escaped = line
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>");

          if (line.startsWith("- ")) {
            return `<li>${escaped.slice(3)}</li>`;
          }
          if (line.match(/^\d+\. /)) {
            return `<li>${escaped.replace(/^\d+\. /, "")}</li>`;
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return `<h3>${line.replace(/\*\*/g, "")}</h3>`;
          }
          return `<p>${escaped}</p>`;
        })
        .join("");

      if (lines.some((l) => l.startsWith("- "))) {
        return `<ul>${rendered}</ul>`;
      }
      if (lines.some((l) => l.match(/^\d+\. /))) {
        return `<ol>${rendered}</ol>`;
      }
      return rendered;
    })
    .join("");
}

function openArticleInNewWindow(article: Article) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.title} — Tax Talent Solution</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.7;
    }
    .topbar {
      background: #1a56db;
      color: white;
      padding: 12px 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .topbar strong { font-size: 16px; }
    .container {
      max-width: 760px;
      margin: 48px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .hero {
      background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
      padding: 40px 48px 32px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .badge {
      background: #1a56db;
      color: white;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .readtime {
      color: #64748b;
      font-size: 13px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.35;
      margin-bottom: 16px;
    }
    .summary {
      border-left: 4px solid #1a56db;
      padding: 12px 16px;
      background: rgba(26,86,219,0.05);
      color: #334155;
      font-size: 15px;
      border-radius: 0 6px 6px 0;
      margin-top: 8px;
    }
    .body {
      padding: 36px 48px 48px;
    }
    .body h3 {
      font-size: 17px;
      font-weight: 700;
      color: #1a56db;
      margin: 28px 0 10px;
    }
    .body p {
      color: #475569;
      font-size: 15px;
      margin-bottom: 10px;
    }
    .body ul, .body ol {
      margin: 8px 0 14px 20px;
      color: #475569;
      font-size: 15px;
    }
    .body li { margin-bottom: 6px; }
    .body strong { color: #1e293b; }
    .close-btn {
      display: inline-block;
      margin: 0 48px 40px;
      padding: 10px 24px;
      background: #1a56db;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .close-btn:hover { background: #1648c8; }
  </style>
</head>
<body>
  <div class="topbar">
    <strong>Tax Talent Solution</strong>
    <span>· Insights &amp; Resources</span>
  </div>
  <div class="container">
    <div class="hero">
      <div class="meta">
        <span class="badge">${article.category}</span>
        <span class="readtime">&#128337; ${article.readTime}</span>
      </div>
      <h1>${article.title}</h1>
      <div class="summary">${article.summary}</div>
    </div>
    <div class="body">
      ${renderBodyToHtml(article.body)}
    </div>
    <button class="close-btn" onclick="window.close()">Close Window</button>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=840,height=720,scrollbars=yes,resizable=yes");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function ShareDropdown({ article, onClose }: { article: Article; onClose: () => void }) {
  const handleShare = (platform: "linkedin" | "facebook") => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);
    let shareUrl = "";
    if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
    }
    window.open(shareUrl, "_blank", "width=620,height=440,scrollbars=yes,resizable=yes");
    onClose();
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white border border-border rounded-lg shadow-xl p-1.5 z-50 min-w-[160px]">
      <button
        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md hover:bg-slate-50 transition-colors"
        style={{ color: "#0077b5" }}
        onClick={() => handleShare("linkedin")}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share on LinkedIn
      </button>
      <button
        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md hover:bg-slate-50 transition-colors"
        style={{ color: "#1877f2" }}
        onClick={() => handleShare("facebook")}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Share on Facebook
      </button>
    </div>
  );
}

export function Articles() {
  const [shareOpenId, setShareOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (shareOpenId === null) return;
    const handleClickOutside = () => setShareOpenId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [shareOpenId]);

  return (
    <section id="articles" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights & Resources
          </span>
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
            Why Tax Talent Solution Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how our platform delivers skilled, assessment-verified, interview-ready
            US tax professionals — and connects them with the employers who need them most.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <CardHeader className="pb-3">
                {/* Icon + Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <article.icon className={`w-5 h-5 ${article.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={article.badgeVariant} className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                </div>

                {/* Read time */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground leading-snug">
                  {article.title}
                </h3>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {article.summary}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="self-start px-0 text-primary hover:text-primary/80 hover:bg-transparent font-medium"
                    onClick={() => openArticleInNewWindow(article)}
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <div className="relative">
                    <button
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareOpenId(shareOpenId === article.id ? null : article.id);
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                    {shareOpenId === article.id && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <ShareDropdown
                          article={article}
                          onClose={() => setShareOpenId(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

