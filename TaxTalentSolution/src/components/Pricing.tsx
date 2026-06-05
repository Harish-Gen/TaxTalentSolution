import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Star, Building, User } from "lucide-react";

interface Plan {
  name: string;
  target: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  originalPrice?: string;
  period: string;
  popular: boolean;
  features: string[];
  assessments: string[];
}

const plans: Plan[] = [
  {
    name: "Professional",
    target: "For Tax Professionals",
    icon: User,
    price: "Free",
    period: "Forever",
    popular: false,
    features: [
      "Complete profile creation",
      "Basic job search & applications",
      "Profile visibility to employers",
      "Email job alerts",
      "Basic support"
    ],
    assessments: [
      "Assessment Fee",
      "1040 Individual Tax Returns",
      "1065 Partnership Returns", 
      "1120 Corporate Returns",
      "S Corporation Returns",
      "Private Equity & Partnerships"
    ]
  },
  {
    name: "Professional Pro",
    target: "For Advanced Professionals",
    icon: Star,
    price: "₹2,000",
    period: "per month",
    popular: true,
    features: [
      "Everything in Professional",
      "Priority job matching",
      "Personalized Job Recommendations",
      "Unlimited assessment retakes",
      "Profile badge verification",
      "Resume Enhancer",
      "Mock Interview"
    ],
    assessments: [
      "50% off",
      "All available assessments",
      "Detailed performance reports",
      "Skill gap analysis"
    ]
  },
  {
    name: "Premium",
    target: "For Aspiring Leaders",
    icon: Building,
    price: "₹10,000",
    originalPrice: "₹15,000",
    period: "per month",
    popular: false,
    features: [
      "Everything in Professional pro",
      "Session with Technical Mentor",
      "Goal Setting",
      "Career Counseling",
      "Leadership Roles",
      "Coaching Session",
      "Mentorship Sessions"
    ],
    assessments: [
      "All Assessments",
      "Leadership Skill Gap Analysis",
      "EA, CPA Recommendations",
      "Soft Skill Trainings Recommendations"
    ]
  }
];

import { PendingPlan } from "./PaymentModal";

export function Pricing({ onGetStarted }: { onGetStarted?: (plan: PendingPlan) => void }) {
  const [proBilling, setProBilling] = useState<"monthly" | "sixMonth">("sixMonth");

  const handleGetStarted = (plan: Plan) => {
    if (!onGetStarted) return;
    if (plan.name === "Professional Pro") {
      onGetStarted({
        name: plan.name,
        price: proBilling === "monthly" ? "₹2,000" : "₹6,000",
        period: proBilling === "monthly" ? "per month" : "for 6 months",
        billing: proBilling === "monthly" ? "monthly" : "annual",
      });
    } else {
      onGetStarted({
        name: plan.name,
        price: plan.price,
        period: plan.period,
      });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. Start free and upgrade as you grow. 
            No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'} transition-all hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.target}</p>

                {plan.name === "Professional Pro" ? (
                  <div className="mt-4">
                    <div className="flex justify-center gap-6 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pro-billing"
                          value="monthly"
                          checked={proBilling === "monthly"}
                          onChange={() => setProBilling("monthly")}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground">Monthly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pro-billing"
                          value="sixMonth"
                          checked={proBilling === "sixMonth"}
                          onChange={() => setProBilling("sixMonth")}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground">6 Months</span>
                      </label>
                    </div>
                    <span className="text-4xl text-foreground">
                      {proBilling === "monthly" ? "₹2,000" : "₹6,000"}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {proBilling === "monthly" ? "per month" : "for 6 months"}
                    </span>
                    {proBilling === "sixMonth" && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">Save ₹6,000 vs monthly</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    {plan.originalPrice && (
                      <span className="text-xl text-muted-foreground mr-2" style={{ textDecoration: "line-through" }}>{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                    {plan.originalPrice && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">Limited time offer</p>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-4">Core Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="mb-4">Assessments & Certifications</h4>
                  <ul className="space-y-2">
                    {plan.assessments.map((assessment, assessmentIndex) => (
                      <li key={assessmentIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{assessment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full mt-6 ${plan.popular ? 'bg-primary' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleGetStarted(plan)}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}