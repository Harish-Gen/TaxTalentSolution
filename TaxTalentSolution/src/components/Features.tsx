import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  User, 
  FileCheck, 
  Search, 
  Award, 
  DollarSign, 
  Users,
  BookOpen,
  BarChart3,
  Shield
} from "lucide-react";

const features = [
  {
    icon: User,
    title: "Comprehensive Profiles",
    description: "Create detailed profiles showcasing your skills, certifications, employment history, and expertise in specific tax areas."
  },
  {
    icon: Award,
    title: "Skill Certifications",
    description: "Take skill-based assessments and earn certificates to validate your proficiency in 1040, 1065, 1120, S Corp, and more."
  },
  {
    icon: Search,
    title: "Smart Job Matching",
    description: "Advanced search and filtering system that connects the right talent with the right opportunities based on verified skills."
  },
  {
    icon: FileCheck,
    title: "Expertise Validation",
    description: "Demonstrate your knowledge in Operating Partnership, Private Equity, and other specialized tax areas through our assessment platform."
  },
  {
    icon: BarChart3,
    title: "Real Time Status Update",
    description: "Get instant notifications on your application status, interview schedules, and job offers in real-time."
  },
  {
    icon: Shield,
    title: "Verified Employers",
    description: "Connect with pre-screened, legitimate employers who are specifically looking for US tax expertise."
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Free profile creation for professionals with nominal assessment fees. Employers pay for premium access to our talent pool."
  },
  {
    icon: BookOpen,
    title: "Industry Updates",
    description: "Stay informed about new companies hiring, industry trends, and emerging opportunities in the US tax sector."
  },
  {
    icon: Users,
    title: "Mentorship Program",
    description: "Connect with experienced tax professionals who can guide your career growth and help you navigate the US tax industry."
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform provides comprehensive tools and features designed specifically 
            for US tax professionals to showcase their expertise and connect with top employers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}