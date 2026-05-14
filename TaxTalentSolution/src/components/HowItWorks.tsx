import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { UserPlus, FileCheck, Search, Handshake } from "lucide-react";

interface HowItWorksProps {
  onGetStartedClick?: () => void;
}

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up for free and build a comprehensive profile highlighting your US tax expertise, certifications, and experience."
  },
  {
    icon: FileCheck,
    title: "Take Assessments",
    description: "Complete skill-based assessments in areas like 1040, 1065, 1120, S Corp to earn verified certifications."
  },
  {
    icon: Search,
    title: "Get Discovered",
    description: "Employers search and filter candidates based on your verified skills, experience, and assessment scores."
  },
  {
    icon: Handshake,
    title: "Land Your Dream Job",
    description: "Connect with top employers and secure positions that match your expertise and career goals."
  }
];

export function HowItWorks({ onGetStartedClick }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 mt-8">
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
            How Tax Talent Solution Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, streamlined process that connects qualified US tax professionals 
            with the right opportunities in just four easy steps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="bg-white border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-primary mr-3">Step {index + 1}</span>
                        <h3 className="text-xl">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1709880945165-d2208c6ad2ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXglMjBkb2N1bWVudHMlMjBjYWxjdWxhdG9yfGVufDF8fHx8MTc1NzkxNjU2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Tax documents and calculator on desk"
                className="w-full h-[336px] object-cover"
              />
              
              {/* Floating success metrics */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-primary">Profile Complete</div>
                <div className="text-2xl">98%</div>
              </div>
              
              <div className="absolute top-1/2 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-primary">Assessment Score</div>
                <div className="text-2xl">94/100</div>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-primary">Job Matches</div>
                <div className="text-2xl">23</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-24">
          <Button size="lg" className="px-10 py-7 text-lg" onClick={onGetStartedClick}>
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </section>
  );
}