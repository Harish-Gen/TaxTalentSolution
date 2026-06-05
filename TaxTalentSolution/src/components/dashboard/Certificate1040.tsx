import { useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Award, Download, Share2, ArrowLeft, CheckCircle } from "lucide-react";
import { assetUrl } from "../../utils/appPaths";
import { getProfileDisplayName } from "../../database/profileStore";

export interface CertificateViewData {
  title: string;
  score: number;
  issueDate: string;
  validUntil: string;
  credentialId: string;
  level: string;
  description?: string;
}

interface Certificate1040Props {
  onBack: () => void;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: { name?: string };
  } | null;
  certificate?: CertificateViewData | null;
}

export function Certificate1040({ onBack, user, certificate }: Certificate1040Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const userId = user?.id ?? "guest";

  const cert = useMemo(() => {
    const title = certificate?.title ?? "1040 Individual Tax Returns";
    const level = certificate?.level ?? "Expert";
    const score = certificate?.score ?? 0;
    return {
      recipientName: getProfileDisplayName(userId, user),
      title,
      score,
      issueDate:
        certificate?.issueDate ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      validUntil:
        certificate?.validUntil ||
        new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      credentialId:
        certificate?.credentialId ||
        `TT-1040-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      level,
      description:
        certificate?.description ||
        `In recognition of successfully completing the ${title} assessment and demonstrating ${level}-level expertise in U.S. tax preparation, deductions, credits, and complex scenarios.`,
      signature: "Tax Talent Solution",
    };
  }, [certificate, user, userId]);

  const handleDownload = async () => {
    const element = certRef.current;
    if (!element) return;
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
          // html2canvas 1.4.1 cannot parse oklch() used by Tailwind CSS v4.
          // Strip every external stylesheet and style tag from the clone,
          // then re-inject a minimal CSS using only hex/rgb colors.
          // The certificate's critical visuals are inline styles, so this
          // only affects utility-class layout/typography.
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
  const handleShare = () => {
    const text = `I earned my ${cert.title} certification with ${cert.score}% on TaxTalent! 🎓 #TaxProfessional #Certification`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Action bar */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Certificates
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownload} disabled={downloading} className="bg-blue-700 hover:bg-blue-800">
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Generating PDF…" : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share on LinkedIn
          </Button>
        </div>
      </div>

      {/* ── CERTIFICATE ── */}
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
            background: "linear-gradient(90deg, #1e3a8a, #1d4ed8, #1e3a8a)",
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
            background: "linear-gradient(90deg, #1e3a8a, #1d4ed8, #1e3a8a)",
            borderRadius: "80px 80px 0 0",
            zIndex: 1,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}
        />

        {/* Header */}
        <div className="relative pt-10 w-full text-center text-white" style={{ zIndex: 2 }}>
          <h1 className="text-4xl tracking-wide font-semibold">CERTIFICATE OF COMPLETION</h1>
          <p className="text-blue-900 font-bold tracking-wide text-xl uppercase" style={{ marginTop: "4%" }}>
            {cert.title}&nbsp;·&nbsp;{cert.level} Level
          </p>
        </div>

        {/* Two-column body: Badge left, Content right */}
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
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" />;
                })}
                <circle cx="81" cy="81" r="60" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="3" />
                <circle cx="81" cy="81" r="52" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <polyline points="55,81 72,98 107,63" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-blue-800 text-xs font-semibold tracking-widest uppercase mt-2">Completion</p>
          </div>

          {/* Content */}
          <div className="flex-1 text-center" style={{ paddingTop: "6%" }}>
            <p className="text-gray-500 text-lg mb-3">This Certificate is Proudly Presented to</p>

            <h2 className="text-5xl text-blue-900 font-bold mb-4 italic">{cert.recipientName}</h2>

            <div
              className="mb-4 mx-auto"
              style={{ height: 2, width: 240, background: "linear-gradient(90deg,transparent,#1e40af,transparent)" }}
            />

            <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto mb-4">
              {cert.description}
            </p>


          </div>

          {/* Logo Badge (right) */}
          <div className="flex-shrink-0 flex flex-col items-center" style={{ marginRight: "3%", marginTop: "-4%" }}>
            <div
              className="rounded-full shadow-lg border-4 border-blue-700 overflow-hidden flex items-center justify-center bg-black"
              style={{ width: 162, height: 162 }}
            >
              <img src={assetUrl("images/logo.png")} alt="TaxTalent Logo" style={{ width: 154, height: 154, objectFit: "cover", borderRadius: "50%" }} />
            </div>
            <p className="text-blue-800 text-xs font-semibold tracking-widest uppercase mt-2">TaxTalent</p>
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

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center text-sm">
            <Award className="w-4 h-4 mr-2 text-blue-600" />
            Certification Benefits
          </h3>
          <ul className="space-y-2">
            {[
              "Enhanced profile visibility to employers",
              "Verified expertise in 1040 tax preparation",
              "Access to premium job opportunities",
              "Professional networking advantages",
            ].map((b, i) => (
              <li key={i} className="flex items-start text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center text-sm">
            <Share2 className="w-4 h-4 mr-2 text-blue-600" />
            Share Your Achievement
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Showcase your certification on professional networks and your resume to highlight your tax expertise.
          </p>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleShare} className="bg-blue-700 hover:bg-blue-800">
              Share on LinkedIn
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
