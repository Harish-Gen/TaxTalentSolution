import { Button } from "./ui/button";
import { Menu, Search, User } from "lucide-react";
import { assetUrl } from "../utils/appPaths";

interface HeaderProps {
  onLoginClick: () => void;
  onAboutClick?: () => void;
}

export function Header({ onLoginClick, onAboutClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <img src={assetUrl("images/logo.png")} alt="Tax Talent Solution" className="h-10 w-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-primary">Tax Talent Solution</h1>
                <p className="text-xs text-muted-foreground">US Tax Professionals</p>
              </div>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#articles" className="text-foreground hover:text-primary transition-colors">
              Articles
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <button onClick={onAboutClick} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLoginClick}>
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button onClick={onLoginClick}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}