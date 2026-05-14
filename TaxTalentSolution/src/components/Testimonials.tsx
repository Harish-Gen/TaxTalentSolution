import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Senior Tax Analyst",
    company: "Global Tax Solutions",
    content: "Tax Talent Solution helped me showcase my 1040 and 1065 expertise effectively. The assessment certifications gave me credibility with employers. I landed my dream job within 3 weeks!",
    rating: 5,
    initials: "PS"
  },
  {
    name: "Raj Patel",
    role: "Tax Manager",
    company: "Elite Financial Services", 
    content: "The platform's focus on US taxation is exactly what we needed. We found qualified professionals with verified S Corp and Private Equity experience quickly.",
    rating: 5,
    initials: "RP"
  },
  {
    name: "Anita Kumar",
    role: "Tax Consultant",
    company: "Independent Practitioner",
    content: "As someone transitioning to US tax from Indian taxation, the skill assessments helped me prove my competency. The 1120 certification opened many doors.",
    rating: 5,
    initials: "AK"
  },
  {
    name: "David Chen",
    role: "HR Director",
    company: "MidSize CPA Firm",
    content: "Tax Talent Solution's filtering system is incredible. We can find candidates with specific experience in Operating Partnerships and get detailed assessment scores upfront.",
    rating: 5,
    initials: "DC"
  },
  {
    name: "Meera Reddy",
    role: "Tax Senior",
    company: "Big Four Firm",
    content: "The platform's professional network helped me connect with peers and mentors. The continuous learning resources keep me updated with latest tax laws.",
    rating: 5,
    initials: "MR"
  },
  {
    name: "Sarah Johnson",
    role: "Talent Acquisition",
    company: "Fortune 500 Company",
    content: "We've reduced our hiring time by 60%. The verified skill assessments mean we're interviewing only qualified candidates. Highly recommend for any firm hiring US tax talent.",
    rating: 5,
    initials: "SJ"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-secondary/20 hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">
            Trusted by Professionals & Employers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what tax professionals and employers are saying about their experience with Tax Talent Solution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl text-primary mb-2">4.9/5</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Success Stories</div>
            </div>
            <div>
              <div className="text-3xl text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Hired within 30 days</div>
            </div>
            <div>
              <div className="text-3xl text-primary mb-2">$75k</div>
              <div className="text-muted-foreground">Average salary increase</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}