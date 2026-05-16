import { useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle, Star, Lightbulb, TrendingUp, BadgeCheck, Zap, Globe } from "lucide-react";
import { assetUrl } from "../utils/appPaths";

interface AboutProps {
  onBack: () => void;
}

// Founder photo component
function FounderPhoto({ initials, gradient, src, size = "w-44 h-44" }: { initials: string; gradient: string; src: string; size?: string }) {
  return (
    <div className={`${size} rounded-full ${gradient} flex items-center justify-center shadow-xl flex-shrink-0 overflow-hidden ring-4 ring-white`}>
      <img
        src={src}
        alt={initials}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.parentElement as HTMLElement).querySelector("span")!.style.display = "flex";
        }}
      />
      <span className="text-white text-4xl font-bold tracking-wide hidden">{initials}</span>
    </div>
  );
}

export function About({ onBack }: AboutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky nav bar ── */}
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-primary hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div>
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">About Us</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Tax Talent Solution
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
              The most trusted platform for connecting CPA firms with pre-verified US tax
              professionals — built by practitioners, powered by technology.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Body */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-4">Who We Are</h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                Tax Talent Solution is a specialised platform built to solve one of the biggest
                challenges in the accounting industry — finding the right US tax talent quickly,
                efficiently, and reliably.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                We connect CPA firms with pre-verified, highly skilled tax professionals, helping
                firms reduce hiring time, improve quality, and scale operations with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission band ── */}
      <section className="bg-gradient-to-r from-primary/10 via-blue-50 to-primary/5 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <Star className="w-4 h-4 fill-primary" /> Our Mission
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary leading-snug">
            "To build the most trusted ecosystem for US tax talent — where firms find the right
            professionals faster, and talent finds meaningful global opportunities."
          </p>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-primary mb-3">What We Do</h2>
            <p className="text-muted-foreground max-w-xl">
              Our approach is simple — eliminate noise, reduce hiring friction, and deliver quality
              talent that can perform from day one.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BadgeCheck, label: "Pre-verified US tax professionals", sub: "1040, 1120, 1065, 990" },
              { icon: Zap,         label: "Fast & efficient hiring support",  sub: "Reduced time-to-hire" },
              { icon: Globe,       label: "India's growing tax talent pool",  sub: "Global quality, local rates" },
              { icon: Lightbulb,   label: "Technology-driven matching",       sub: "Smart screening & fit" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-gradient-to-br from-primary/5 to-blue-50 border border-primary/10 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Founders ── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Meet Our Founders</h2>
            <p className="text-muted-foreground max-w-xl">
              Seasoned practitioners who have lived the problem — and built the solution.
            </p>
          </div>

          {/* ── Sarita (top) ── */}
          <div className="flex flex-row gap-6 items-start bg-white rounded-3xl shadow-lg border border-slate-100 p-10 mb-10">
            <div className="w-1/5 flex-shrink-0 flex justify-center">
              <FounderPhoto initials="SR" gradient="bg-gradient-to-br from-purple-500 to-pink-400" src={assetUrl("images/sarita.jpg")} size="w-[88px] h-[88px]" />
            </div>
            <div className="w-4/5">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-foreground">Sarita Rochwani</h3>
              </div>
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold rounded-full px-3 py-1 mb-4">
                Co-Founder &amp; COO
              </span>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>
                  Sarita Rochwani is a Chartered Accountant, US CPA, and a PCC-certified leadership
                  and transformation coach.
                </p>
                <p>
                  She brings a unique blend of finance expertise and human-centered leadership,
                  helping individuals and organisations unlock their full potential. Her work focuses
                  on leadership development, cultural transformation, and building high-performing
                  teams.
                </p>
                <p>
                  Sarita believes that true growth happens when people grow together — a philosophy
                  reflected in her coaching, facilitation, and leadership approach.
                </p>
              </div>
              <div className="mt-5 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg px-5 py-3">
                <p className="text-sm text-purple-800 italic">
                  "Her ability to combine technical excellence with deep people insight makes her a
                  powerful force behind building strong, resilient, and purpose-driven organisations."
                </p>
              </div>
            </div>
          </div>

          {/* ── Vijay (below) ── */}
          <div className="flex flex-row gap-6 items-start bg-white rounded-3xl shadow-lg border border-slate-100 p-10">
            <div className="w-1/5 flex-shrink-0 flex justify-center">
              <FounderPhoto initials="VN" gradient="bg-gradient-to-br from-primary to-blue-400" src={assetUrl("images/vijay.png")} size="w-[106px] h-[106px]" />
            </div>
            <div className="w-4/5">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-foreground">Vijay Narayandas</h3>
              </div>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1 mb-4">
                Co-Founder &amp; CEO
              </span>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>
                  Vijay Narayandas is a US CPA and a seasoned tax leader with over two decades of
                  experience in building and scaling US tax practices.
                </p>
                <p>
                  He has been at the forefront of developing offshore tax capabilities for global
                  accounting firms and is widely recognised for his deep expertise in US taxation,
                  operational excellence, and automation-led transformation.
                </p>
                <p>
                  With a strong vision to revolutionise tax outsourcing, Vijay combines domain
                  knowledge with technology to create scalable, high-performance tax ecosystems. His
                  entrepreneurial journey is driven by a clear mission — to unlock global tax talent
                  and redefine how CPA firms build their teams.
                </p>
              </div>
              <div className="mt-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-5 py-3">
                <p className="text-sm text-blue-800 italic">
                  "Vijay's work is rooted in innovation, efficiency, and a relentless focus on
                  delivering measurable value to CPA firms."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Philosophy + Why TTS side-by-side ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl grid md:grid-cols-2 gap-8">

          {/* Philosophy */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl p-8 border border-primary/10">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Philosophy</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              At Tax Talent Solution, we believe that hiring is not just about filling roles — it
              is about building capability, culture, and long-term success.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our platform is designed to support firms not just in hiring talent, but in building
              teams that drive growth, efficiency, and innovation.
            </p>
          </div>

          {/* Why TTS */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Why Tax Talent Solution</h2>
            <ul className="space-y-3">
              {[
                "Deep understanding of the US tax ecosystem",
                "Founder-led domain expertise",
                "Quality-first talent approach",
                "Technology-enabled hiring model",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Looking Ahead ── */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 py-20 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Looking Ahead</h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-3">
            We are building more than a hiring platform — we are creating a global tax talent
            network that will power the next generation of accounting firms.
          </p>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            As the demand for skilled tax professionals continues to grow, Tax Talent Solution is
            committed to being the bridge between opportunity and expertise.
          </p>
          <Button
            variant="outline"
            className="bg-white text-primary hover:bg-blue-50 border-0 font-semibold px-8 py-5 text-base rounded-xl shadow-lg"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </section>

    </div>
  );
}
