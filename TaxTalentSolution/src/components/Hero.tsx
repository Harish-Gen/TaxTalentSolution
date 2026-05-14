import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, TrendingUp, Shield } from "lucide-react";

interface HeroProps {
  onGetStartedClick: () => void;
  onEmployersClick: () => void;
}

export function Hero({ onGetStartedClick, onEmployersClick }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-white to-secondary/20 pt-20 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="max-w-xl">
            <div className="flex items-center gap-6 mb-8">
              <img src="/images/logo.png" alt="Tax Talent Solution" className="h-52 w-52 rounded-full shadow-xl" />
              <h2 className="text-4xl font-bold text-primary">Tax Talent Solution</h2>
            </div>
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                #1 Platform for US Tax Professionals
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl mb-6 text-foreground">
              Land Your Dream Role in US Taxation
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join a premier platform built for US tax professionals in India. Showcase your expertise in 1040, 1065, 1120, S-Corp, and more. Get skill-verified, stand out with assessments, and connect with top firms looking for talent like you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="px-8" onClick={onGetStartedClick}>
                <Search className="w-5 h-5 mr-2" />
                Find Your Dream Job
              </Button>
              <Button variant="outline" size="lg" className="px-8" onClick={onEmployersClick}>
                <Shield className="w-5 h-5 mr-2" />
                For Employers
              </Button>
            </div>

          </div>

          {/* Image */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="/images/For Candidate.png"
                alt="Build the Career You've Been Working Toward"
                className="w-full h-[325px] object-cover"
              />
              {/* Floating cards */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-primary">Live Jobs</div>
                <div className="text-2xl">2,847</div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-primary">Avg. Salary</div>
                <div className="text-2xl">$65k</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}