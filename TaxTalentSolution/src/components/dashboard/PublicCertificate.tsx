import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle, 
  Link, 
  ExternalLink, 
  ShieldCheck, 
  Loader2,
  Calendar,
  User,
  GraduationCap,
  Linkedin
} from "lucide-react";
import { assetUrl } from "../../utils/appPaths";
import { useCertificate } from "../../database";
import { candidateService } from "../../api/candidateService";
import { getProfileDisplayName } from "../../database/profileStore";
import { toast } from "sonner";

interface PublicCertificateProps {
  id?: string;
}

export function PublicCertificate({ id }: PublicCertificateProps) {
  const { certificate, loading: certLoading } = useCertificate(id);
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [recipientName, setRecipientName] = useState("Certificate Recipient");
  const [loadingName, setLoadingName] = useState(true);

  // Load recipient name from candidate record or fallback to local storage
  useEffect(() => {
    if (!certificate) {
      setLoadingName(false);
      return;
    }

    const loadName = async () => {
      setLoadingName(true);
      try {
        if (certificate.candidate_id && !certificate.id.startsWith("local-")) {
          const cand = await candidateService.getCandidateById(certificate.candidate_id);
          if (cand?.name) {
            setRecipientName(cand.name);
            setLoadingName(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch candidate name:", err);
      }

      // Fallback to local profile or email
      const localName = getProfileDisplayName(certificate.candidate_id);
      setRecipientName(localName);
      setLoadingName(false);
    };

    void loadName();
  }, [certificate]);

  const cert = useMemo(() => {
    if (!certificate) return null;

    const title = certificate.title || "1040 Individual Tax Returns";
    const level = certificate.level 
      ? certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1) 
      : "Professional";
    const score = certificate.score ?? 0;

    return {
      recipientName,
      title,
      score,
      issueDate: certificate.issue_date
        ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
      validUntil: certificate.expiry_date
        ? new Date(certificate.expiry_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
      credentialId: certificate.credential_id || `TT-${title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      level,
      description: `In recognition of successfully completing the ${title} assessment and demonstrating ${level}-level expertise in tax preparation, regulations, compliance, and scenarios.`,
      signature: "Tax Talent Solution",
      skills: certificate.skills_validated || [],
    };
  }, [certificate, recipientName]);

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleShare = () => {
    if (!cert) return;
    const shareUrl = getShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success("Verification link copied to clipboard!");
  };

  const handleDownload = async () => {
    const element = certRef.current;
    if (!element || !cert) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const scale = 2;
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc: Document) => {
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());

          const style = clonedDoc.createElement("style");
          style.textContent = `
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; padding: 0; }
            .font-serif { font-family: Georgia, 'Times New Roman', serif; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .w-full { width: 100%; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            .flex-shrink-0 { flex-shrink: 0; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .text-center { text-align: center; }
            .overflow-hidden { overflow: hidden; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-full { border-radius: 9999px; }
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            .border { border-width: 1px; border-style: solid; }
            .border-4 { border-width: 4px; border-style: solid; }
            .border-t { border-top-width: 1px; border-top-style: solid; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-800 { border-color: #1f2937; }
            .border-blue-700 { border-color: #1d4ed8; }
            .bg-white { background-color: #ffffff; }
            .bg-black { background-color: #000000; }
            .text-white { color: #ffffff; }
            .text-blue-900 { color: #1e3a8a; }
            .text-blue-800 { color: #1e40af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            .text-5xl { font-size: 3rem; line-height: 1; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .font-medium { font-weight: 500; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .tracking-widest { letter-spacing: 0.1em; }
            .leading-relaxed { line-height: 1.625; }
            .gap-10 { gap: 2.5rem; }
            .px-16 { padding-left: 4rem; padding-right: 4rem; }
            .px-20 { padding-left: 5rem; padding-right: 5rem; }
            .pt-10 { padding-top: 2.5rem; }
            .pb-36 { padding-bottom: 9rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .max-w-2xl { max-width: 42rem; }
            .max-w-md { max-width: 28rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width / scale;
      const imgHeight = canvas.height / scale;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [imgWidth, imgHeight],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate_${cert.title.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading(false);
    }
  };

  if (certLoading || loadingName) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm border border-slate-100">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-800 font-semibold text-lg">Verifying Certificate</p>
          <p className="text-slate-500 text-sm mt-1">Retrieving secure credential info...</p>
        </div>
      </div>
    );
  }

  if (!certificate || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Certificate</h2>
          <p className="text-slate-600 mb-6">
            The credential link is invalid, expired, or has been revoked. Please verify the link URL and try again.
          </p>
          <Button onClick={() => window.location.href = "/"} className="bg-blue-700 hover:bg-blue-800 w-full">
            Go to TaxTalent Home
          </Button>
        </div>
      </div>
    );
  }

  // Choose border accent color based on certificate level
  const borderGradient = certificate.title.toLowerCase().includes("1040")
    ? "linear-gradient(90deg, #1e3a8a, #1d4ed8, #1e3a8a)"
    : "linear-gradient(90deg, #059669, #10b981, #059669)";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <img src={assetUrl("images/logo.png")} alt="Logo" className="w-8 h-8 object-cover rounded-full" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
            TaxTalent Solution
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Credential</span>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Certificate viewer container (Left) */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div
            id="certificate-print-area"
            ref={certRef}
            className="w-full bg-white relative shadow-2xl border border-gray-300 overflow-hidden font-serif rounded-xl"
            style={{ minHeight: 528 }}
          >
            {/* Top Wave */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: 65,
                background: borderGradient,
                borderRadius: "0 0 80px 80px",
                zIndex: 1,
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            />

            {/* Bottom Wave */}
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{
                height: 55,
                background: borderGradient,
                borderRadius: "80px 80px 0 0",
                zIndex: 1,
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            />

            {/* Header */}
            <div className="relative pt-10 w-full text-center text-white" style={{ zIndex: 2 }}>
              <h1 className="text-4xl tracking-wide font-semibold">CERTIFICATE OF COMPLETION</h1>
              <p className="font-bold tracking-wide text-xl uppercase" style={{ marginTop: "4%", color: certificate.title.toLowerCase().includes("1040") ? "#1e3a8a" : "#065f46" }}>
                {cert.title}&nbsp;·&nbsp;{cert.level} Level
              </p>
            </div>

            {/* Two-column body */}
            <div className="relative flex items-center gap-10 px-16 mt-6 pb-36" style={{ zIndex: 2 }}>

              {/* Completion Seal (left) */}
              <div className="flex-shrink-0 flex flex-col items-center" style={{ marginLeft: "3%", marginTop: "-4%" }}>
                <div style={{ width: 162, height: 162, position: "relative" }}>
                  <svg viewBox="0 0 162 162" width={162} height={162}>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const angle = (i * 360) / 20;
                      const rad = (angle * Math.PI) / 180;
                      const x1 = 81 + 72 * Math.cos(rad);
                      const y1 = 81 + 72 * Math.sin(rad);
                      const x2 = 81 + 62 * Math.cos(rad);
                      const y2 = 81 + 62 * Math.sin(rad);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={certificate.title.toLowerCase().includes("1040") ? "#1d4ed8" : "#10b981"} strokeWidth="4" strokeLinecap="round" />;
                    })}
                    <circle cx="81" cy="81" r="60" fill={certificate.title.toLowerCase().includes("1040") ? "#1e3a8a" : "#065f46"} stroke={certificate.title.toLowerCase().includes("1040") ? "#1d4ed8" : "#10b981"} strokeWidth="3" />
                    <circle cx="81" cy="81" r="52" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                    <polyline points="55,81 72,98 107,63" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-slate-800 text-xs font-semibold tracking-widest uppercase mt-2">Verified</p>
              </div>

              {/* Content */}
              <div className="flex-1 text-center" style={{ paddingTop: "6%" }}>
                <p className="text-gray-500 text-lg mb-3">This Certificate is Proudly Presented to</p>
                <h2 className="text-5xl text-blue-900 font-bold mb-4 italic">{cert.recipientName}</h2>
                <div
                  className="mb-4 mx-auto"
                  style={{ height: 2, width: 240, background: "linear-gradient(90deg,transparent,#1e40af,transparent)" }}
                />
                <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto mb-4 font-sans">
                  {cert.description}
                </p>
              </div>

              {/* Logo Badge (right) */}
              <div className="flex-shrink-0 flex flex-col items-center" style={{ marginRight: "3%", marginTop: "-4%" }}>
                <div
                  className="rounded-full shadow-lg border-4 border-slate-200 overflow-hidden flex items-center justify-center bg-black"
                  style={{ width: 162, height: 162 }}
                >
                  <img src={assetUrl("images/logo.png")} alt="Logo" style={{ width: 154, height: 154, objectFit: "cover", borderRadius: "50%" }} />
                </div>
                <p className="text-slate-800 text-xs font-semibold tracking-widest uppercase mt-2">TaxTalent</p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-5 w-full flex justify-between px-20" style={{ zIndex: 2, color: "#111827" }}>
              <div className="text-center">
                <div className="border-t border-gray-800 w-40 mx-auto" />
                <p className="text-xs mt-1 font-semibold">Date</p>
                <p className="text-sm font-medium">{cert.issueDate}</p>
              </div>

              <div className="text-center self-end pb-1">
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Credential&nbsp;ID:&nbsp;{cert.credentialId}
                </p>
                <p className="text-xs mt-0.5">Valid until {cert.validUntil}</p>
              </div>

              <div className="text-center">
                <div className="border-t border-gray-800 w-48 mx-auto" />
                <p className="text-xs mt-1 font-semibold">Signature</p>
                <p className="text-sm font-medium">{cert.signature}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Summary & Actions Sidebar (Right) */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          {/* Verification Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
              Credential Verification
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Recipient</p>
                  <p className="text-sm font-semibold text-slate-800">{cert.recipientName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Assessment</p>
                  <p className="text-sm font-semibold text-slate-800">{cert.title}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Score & Level</p>
                  <p className="text-sm font-semibold text-slate-800">{cert.score}% ({cert.level})</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Validity Period</p>
                  <p className="text-sm font-semibold text-slate-800">{cert.issueDate} - {cert.validUntil}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-5" />

            <div className="space-y-3">
              <Button onClick={handleDownload} disabled={downloading} className="w-full bg-blue-700 hover:bg-blue-800">
                <Download className="w-4 h-4 mr-2" />
                {downloading ? "Generating PDF…" : "Download PDF"}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleShare} className="w-full">
                  <Linkedin className="w-4 h-4 mr-1.5" />
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={handleCopyLink} className="w-full">
                  <Link className="w-4 h-4 mr-1.5" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>

          {/* Call to action card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl shadow-md p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <Award className="w-48 h-48" />
            </div>
            <h4 className="font-bold text-lg mb-2">Want to get certified?</h4>
            <p className="text-slate-200 text-sm mb-4 leading-relaxed">
              Validate your tax preparation, regulatory expertise, and compliance skills on TaxTalent Solution to enhance your profile.
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-white text-blue-950 hover:bg-slate-100 font-semibold"
            >
              Get Started on TaxTalent
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} TaxTalent Solution. All rights reserved.</p>
        <p className="text-xs text-slate-600 mt-1">Verified secure certificate verification system.</p>
      </footer>
    </div>
  );
}
