
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, TrendingUp, Shield, Users } from "lucide-react";
import { assetUrl } from "../utils/appPaths";

interface EmployerInfoProps {
  onGetStartedClick: () => void;
  onCandidateClick: () => void;
}

const employerSections = [
  {
    title: "Get Your Dream Candidate",
    description:
      "Access a curated pool of US tax professionals with verified skills and certifications. Post jobs and receive applications from top talent ready to make an impact at your firm.",
  },
  {
    title: "Advanced Filtering",
    description:
      "Quickly find candidates by filtering for specific skills, certifications (1040, 1065, 1120, S Corp), years of experience, and more. Save time by shortlisting only the most relevant professionals.",
  },
  {
    title: "Rankings & Skill Assessments",
    description:
      "View candidate rankings based on assessment scores and certifications. Instantly identify the best matches for your open roles with our transparent ranking system.",
  },
  {
    title: "Compensation Predictions",
    description:
      "Get AI-powered compensation insights for each candidate based on their skills, experience, and market trends. Make competitive offers with confidence.",
  },
  {
    title: "Bulk Messaging & Interview Scheduling",
    description:
      "Easily reach out to multiple candidates at once and schedule interviews directly through the portal. Streamline your hiring process from start to finish.",
  },
  {
    title: "Detailed Analytics",
    description:
      "Track your job postings, candidate engagement, and hiring success with real-time analytics. Optimize your recruitment strategy using actionable insights.",
  },
];

export function EmployerInfo({ onGetStartedClick, onCandidateClick }: EmployerInfoProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-secondary/20 pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image - Left Side */}
            <div className="relative max-w-xl mx-auto order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={assetUrl("images/For Employer.png")}
                  alt="Find the Right Talent. Faster. Smarter."
                  className="w-full h-[325px] object-cover"
                />
                {/* Floating cards */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-primary">Active Recruiters</div>
                  <div className="text-2xl">500+</div>
                </div>
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-primary">Quality Hires</div>
                  <div className="text-2xl">95%</div>
                </div>
              </div>
            </div>

            {/* Content - Right Side */}
            <div className="max-w-xl order-1 lg:order-2">
              <div className="flex items-center gap-6 mb-8">
                <img src={assetUrl("images/logo.png")} alt="Tax Talent Solution" className="h-52 w-52 rounded-full shadow-xl" />
                <h2 className="text-4xl font-bold text-primary">Tax Talent Solution</h2>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  #1 Platform for US Tax Professionals
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl mb-6 text-foreground">
                Hire the Right US Tax Talent, Faster and Smarter
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Access a curated pool of pre-assessed US tax professionals skilled in 1040, 1065, 1120, S-Corp, and more. Review verified profiles, technical ratings, and hire with confidence — all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="px-8" onClick={onGetStartedClick}>
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="px-8" onClick={onCandidateClick}>
                  <Search className="w-5 h-5 mr-2" />
                  For Candidates
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* How Tax Talent Solution Works */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 mt-8">
            <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
              How Tax Talent Solution Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, streamlined process that connects you with the best tax professionals in just four easy steps.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image on the Left */}
            <div className="relative max-w-sm mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-[235px] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                  <svg 
                    viewBox="0 0 400 400" 
                    className="w-full h-full drop-shadow-lg"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Circle */}
                    <circle cx="200" cy="200" r="180" fill="#E0E7FF" opacity="0.5"/>
                    
                    {/* Document/Job Post */}
                    <rect x="80" y="100" width="100" height="130" rx="8" fill="#FFFFFF" stroke="#0066cc" strokeWidth="3"/>
                    <line x1="95" y1="120" x2="165" y2="120" stroke="#0066cc" strokeWidth="3"/>
                    <line x1="95" y1="140" x2="150" y2="140" stroke="#0066cc" strokeWidth="2" opacity="0.5"/>
                    <line x1="95" y1="155" x2="165" y2="155" stroke="#0066cc" strokeWidth="2" opacity="0.5"/>
                    <line x1="95" y1="170" x2="140" y2="170" stroke="#0066cc" strokeWidth="2" opacity="0.5"/>
                    
                    {/* Arrow 1 */}
                    <path d="M 180 165 L 220 165" stroke="#10B981" strokeWidth="3" fill="none"/>
                    <polygon points="220,165 210,160 210,170" fill="#10B981"/>
                    
                    {/* Matching System/AI */}
                    <circle cx="260" cy="165" r="40" fill="#10B981" opacity="0.2"/>
                    <circle cx="260" cy="165" r="25" fill="#10B981"/>
                    <path d="M 250 165 L 260 175 L 275 155" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    
                    {/* Arrow 2 */}
                    <path d="M 230 200 L 200 240" stroke="#8B5CF6" strokeWidth="3" fill="none"/>
                    <polygon points="200,240 208,234 205,225" fill="#8B5CF6"/>
                    
                    {/* Profiles */}
                    <g transform="translate(120, 250)">
                      <circle cx="0" cy="0" r="35" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="3"/>
                      <circle cx="0" cy="-10" r="10" fill="#8B5CF6"/>
                      <path d="M -15 10 Q 0 0 15 10" stroke="#8B5CF6" strokeWidth="3" fill="none"/>
                    </g>
                    
                    {/* Arrow 3 */}
                    <path d="M 180 285 L 220 285" stroke="#F59E0B" strokeWidth="3" fill="none"/>
                    <polygon points="220,285 210,280 210,290" fill="#F59E0B"/>
                    
                    {/* Interview/Calendar */}
                    <rect x="230" y="265" width="60" height="50" rx="6" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3"/>
                    <rect x="230" y="265" width="60" height="15" rx="6" fill="#F59E0B"/>
                    <circle cx="245" cy="290" r="3" fill="#F59E0B"/>
                    <circle cx="260" cy="290" r="3" fill="#F59E0B"/>
                    <circle cx="275" cy="290" r="3" fill="#F59E0B"/>
                    <circle cx="245" cy="302" r="3" fill="#F59E0B"/>
                    <circle cx="260" cy="302" r="3" fill="#F59E0B"/>
                  </svg>
                </div>
                
                {/* Floating success metrics */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-primary">Active Jobs</div>
                  <div className="text-2xl">150+</div>
                </div>
                
                <div className="absolute top-1/2 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-primary">Match Rate</div>
                  <div className="text-2xl">96%</div>
                </div>
                
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-sm text-primary">Avg. Time to Hire</div>
                  <div className="text-2xl">7 days</div>
                </div>
              </div>
            </div>

            {/* Steps on the Right */}
            <div className="space-y-8">
              {/* Step 1 */}
              <Card className="bg-white border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Search className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-primary mr-3">Step 1</span>
                        <h3 className="text-xl">Create the Job with Required Skillset</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Post your job opening and specify the exact tax skills, certifications, and experience levels you need.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="bg-white border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-primary mr-3">Step 2</span>
                        <h3 className="text-xl">System Shows Best Match Candidates</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Our AI-powered matching system automatically identifies and ranks the most qualified candidates based on your requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="bg-white border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-primary mr-3">Step 3</span>
                        <h3 className="text-xl">Review Profiles and Shortlist</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Browse detailed candidate profiles with verified skills, assessment scores, and experience. Shortlist your top choices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="bg-white border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-primary mr-3">Step 4</span>
                        <h3 className="text-xl">Schedule Interview</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Connect with your shortlisted candidates and schedule interviews directly through our platform.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-24">
            <Button size="lg" className="px-10 py-7 text-lg" onClick={onGetStartedClick}>
              Start Hiring Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 pb-32 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-foreground font-bold">
            Why Employers Love Tax Talent Solution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how our platform empowers employers to find, evaluate, and hire the best US tax professionals in India—faster and smarter.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employerSections.map((section, idx) => (
            <Card key={idx} className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
