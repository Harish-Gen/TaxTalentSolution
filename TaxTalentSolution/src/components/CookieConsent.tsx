import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Cookie, X } from "lucide-react";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface CookieConsentProps {
  onPrivacyPolicyClick?: () => void;
}

export function CookieConsent({ onPrivacyPolicyClick }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tts_consent");
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const saveConsent = (consent: ConsentState) => {
    localStorage.setItem("tts_consent", JSON.stringify(consent));
    setVisible(false);
    setShowModal(false);
    loadScriptsBasedOnConsent(consent);
  };

  const loadScriptsBasedOnConsent = (consent: ConsentState) => {
    if (consent.analytics) {
      // Load analytics scripts here when configured
      console.log("[TTS] Analytics consent granted");
    }
    if (consent.marketing) {
      // Load marketing/tracking pixels here when configured
      console.log("[TTS] Marketing consent granted");
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const savePreferences = () => {
    saveConsent({
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
  };

  if (!visible) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0A3D62] text-white shadow-2xl"
        role="region"
        aria-label="Cookie consent"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-300" />
            <p className="text-sm leading-relaxed">
              We use cookies and process personal data to improve your experience, match tax
              professionals with employers, and analyse platform usage. See our{" "}
              <button
                onClick={onPrivacyPolicyClick}
                className="underline hover:text-yellow-300 transition-colors"
              >
                Privacy Policy
              </button>{" "}
              for details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white border-0"
              onClick={acceptAll}
            >
              Accept All
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={rejectAll}
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-0"
              onClick={() => setShowModal(true)}
            >
              Preferences
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Privacy Preferences</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Manage how Tax Talent Solution uses your data. Necessary cookies are always
              enabled as they are required for the platform to function.
            </p>

            <div className="space-y-4">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="font-medium text-gray-900">Necessary Cookies</Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Required for login, security, and core platform features.
                  </p>
                </div>
                <Checkbox checked disabled className="mt-0.5" />
              </div>

              <Separator />

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor="analytics-check" className="font-medium text-gray-900">
                    Analytics Cookies
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Help us understand how the platform is used (e.g. Google Analytics).
                  </p>
                </div>
                <Checkbox
                  id="analytics-check"
                  checked={analytics}
                  onCheckedChange={(v) => setAnalytics(v === true)}
                  className="mt-0.5"
                />
              </div>

              <Separator />

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor="marketing-check" className="font-medium text-gray-900">
                    Marketing Cookies
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Used to show relevant job and employer ads based on your profile.
                  </p>
                </div>
                <Checkbox
                  id="marketing-check"
                  checked={marketing}
                  onCheckedChange={(v) => setMarketing(v === true)}
                  className="mt-0.5"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={rejectAll}>
                Reject All
              </Button>
              <Button className="flex-1 bg-[#0A3D62] hover:bg-[#0A3D62]/90 text-white" onClick={savePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Utility: Reset consent so the banner re-appears (GDPR/DPDP withdrawal right) */
export function resetConsent() {
  localStorage.removeItem("tts_consent");
  window.location.reload();
}
