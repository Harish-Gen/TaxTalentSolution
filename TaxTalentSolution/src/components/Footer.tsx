import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Facebook,
  FileText,
  Shield,
  HelpCircle
} from "lucide-react";

export function Footer({ onPrivacyPolicyClick, onTermsClick, onCookiePolicyClick, onAboutClick }: { onPrivacyPolicyClick?: () => void; onTermsClick?: () => void; onCookiePolicyClick?: () => void; onAboutClick?: () => void }) {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/images/logo.png" alt="Tax Talent Solution" className="h-12 w-12 rounded-full" />
                <h3 className="text-2xl">Tax Talent Solution</h3>
              </div>
              <p className="text-primary-foreground/80">
                Connecting US Tax Professionals with Global Opportunities
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>Bengaluru, KA, India</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>hello@taxtalentsolution.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>+91-22-XXXX-XXXX</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Facebook className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="mb-6">For Professionals</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Create Profile</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Take Assessments</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Skill Certifications</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Career Resources</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Salary Guide</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="mb-6">For Employers</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Post Jobs</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Search Candidates</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Enterprise Solutions</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Hiring Tools</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Talent Analytics</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Account Management</a></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="mb-6">Support & Legal</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </a>
              </li>
              <li>
                <button
                  onClick={onTermsClick}
                  className="hover:text-primary-foreground transition-colors flex items-center w-full text-left"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={onPrivacyPolicyClick}
                  className="hover:text-primary-foreground transition-colors flex items-center w-full text-left"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onCookiePolicyClick}
                  className="hover:text-primary-foreground transition-colors w-full text-left"
                >
                  Cookie Policy
                </button>
              </li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact Us</a></li>
              <li>
                <button
                  onClick={onAboutClick}
                  className="hover:text-primary-foreground transition-colors w-full text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Bottom Footer */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-primary-foreground/80">
            © 2026 Tax Talent Solution. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-primary-foreground/80">
            <span>🇮🇳 Made in India for Global Tax Professionals</span>
            <span>•</span>
            <span>ISO 27001 Certified</span>
            <span>•</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}