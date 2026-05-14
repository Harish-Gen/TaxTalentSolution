import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  ArrowLeft,
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building,
  Users,
  Calendar,
  Globe,
  Mail,
  Phone,
  BookmarkPlus,
  Share2,
  CheckCircle,
  Award,
  Target,
  TrendingUp,
  Star
} from "lucide-react";

interface JobDetailsProps {
  jobId: number;
  onBack: () => void;
  onJobApplication?: (jobTitle: string, companyName: string) => void;
}

// Mock detailed job data
const getJobDetails = (id: number) => {
  const jobDetails = {
    1: {
      id: 1,
      title: "Senior Tax Associate - 1040 Specialist",
      company: "TaxPro Solutions India",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8-12 LPA",
      postedDate: "2 days ago",
      applicationDeadline: "November 15, 2024",
      urgent: true,
      remote: "Hybrid",
      companySize: "500-1000 employees",
      industry: "Professional Services",
      companyDescription: "TaxPro Solutions India is a leading provider of US tax preparation services, specializing in individual, corporate, and partnership returns. With over 15 years of experience serving US clients, we've built a reputation for accuracy, efficiency, and exceptional client service. Our Mumbai office is our largest facility, housing over 200 tax professionals who work directly with US CPAs and clients during the US tax season.",
      companyBenefits: [
        "Health insurance coverage",
        "Flexible working hours during off-season", 
        "US shift allowance",
        "Professional development budget",
        "Annual performance bonuses",
        "Work from home options",
        "Paid certification training",
        "Team outings and events"
      ],
      jobDescription: "We are seeking an experienced Senior Tax Associate specializing in US individual tax returns (Form 1040) to join our growing team. The successful candidate will prepare complex individual tax returns, review junior staff work, and maintain direct communication with US clients and CPAs. This role offers excellent growth opportunities and exposure to diverse tax scenarios.",
      responsibilities: [
        "Prepare and review complex individual tax returns (Form 1040) including multi-state filings",
        "Handle high-net-worth clients with complex tax situations including rental properties, stock options, and business income",
        "Review and mentor junior associates' work to ensure accuracy and compliance",
        "Communicate directly with US clients via phone and email to resolve tax questions",
        "Research tax law changes and their impact on client returns",
        "Assist with tax planning strategies and year-end tax planning",
        "Maintain productivity standards while ensuring quality and accuracy",
        "Participate in team meetings and training sessions"
      ],
      requirements: [
        "Bachelor's degree in Commerce, Accounting, or related field",
        "3-5 years of experience in US individual tax preparation",
        "Strong knowledge of Form 1040 and related schedules (A, B, C, D, E, etc.)",
        "Experience with multi-state tax filings",
        "Proficiency in Drake Tax Software (preferred) or similar professional tax software",
        "Excellent English communication skills (written and verbal)",
        "Ability to work US hours during tax season (January-April)",
        "Strong attention to detail and ability to work under pressure",
        "US tax certification (EA, CPA, or equivalent) preferred but not required"
      ],
      preferredSkills: [
        "Multi-state tax filing experience",
        "Drake Software proficiency",
        "Tax research capabilities", 
        "Client communication skills",
        "Leadership/mentoring experience",
        "Advanced Excel skills",
        "ProConnect or UltraTax experience",
        "ITIN application experience"
      ],
      skills: ["1040", "Multi-state Filing", "Drake Software", "Tax Research"],
      workSchedule: "Monday to Friday, 7:00 PM to 4:00 AM IST (US business hours) during tax season. Regular hours during off-season with flexibility.",
      reportingTo: "Tax Manager - Individual Returns Division",
      careerGrowth: "This role offers a clear path to Tax Senior Associate and eventually Tax Manager positions. High performers may also have opportunities to specialize in specific areas like international tax or high-net-worth clients.",
      companyWebsite: "www.taxprosolutions.in",
      companyEmail: "careers@taxprosolutions.in",
      companyPhone: "+91-22-6789-1234",
      companyRating: 4.2,
      officeImages: [
        "Modern office space with latest technology",
        "Dedicated training rooms",
        "Comfortable workstations",
        "Recreation areas for breaks"
      ]
    },
    2: {
      id: 2,
      title: "Corporate Tax Manager - 1120 Focus",
      company: "Global Tax Services",
      location: "Bangalore, Karnataka", 
      type: "Full-time",
      experience: "5-8 years",
      salary: "₹15-20 LPA",
      postedDate: "1 week ago",
      applicationDeadline: "November 30, 2024",
      urgent: false,
      remote: "Office-based",
      companySize: "1000+ employees",
      industry: "Financial Services",
      companyDescription: "Global Tax Services is an international tax consulting firm with offices across India, serving Fortune 500 companies and mid-market businesses. Our Bangalore center of excellence focuses on US corporate tax compliance and planning, working with some of the world's largest corporations to ensure compliance with complex US tax regulations.",
      companyBenefits: [
        "Comprehensive health and life insurance",
        "Retirement savings plan with company matching",
        "Flexible PTO policy",
        "Professional development and training budget",
        "Annual salary reviews and performance bonuses",
        "Onsite opportunities in the US",
        "Latest technology and software tools",
        "Wellness programs and gym membership"
      ],
      jobDescription: "We are looking for an experienced Corporate Tax Manager to lead our 1120 corporate tax division. This leadership role involves managing a team of tax professionals, ensuring quality delivery of corporate tax returns, and maintaining relationships with US-based clients and partners.",
      responsibilities: [
        "Lead and manage a team of 8-12 corporate tax professionals",
        "Oversee preparation and review of complex C-Corporation returns (Form 1120)",
        "Manage client relationships and serve as primary point of contact for corporate clients",
        "Ensure compliance with US federal and state corporate tax regulations",
        "Develop and implement quality control procedures and best practices",
        "Conduct team training sessions and performance reviews",
        "Coordinate with US partners and client engagement teams",
        "Assist with corporate tax planning and strategy discussions",
        "Handle escalated tax issues and complex technical matters"
      ],
      requirements: [
        "Bachelor's degree in Accounting, Finance, or related field",
        "5-8 years of progressive experience in US corporate tax",
        "Strong expertise in Form 1120 and related corporate tax forms",
        "Previous team leadership or management experience required",
        "CPA, EA, or equivalent US tax certification strongly preferred",
        "Excellent communication and presentation skills",
        "Experience with CCH Axcess or similar enterprise tax software",
        "Strong analytical and problem-solving abilities",
        "Proven track record of managing complex tax projects"
      ],
      preferredSkills: [
        "Team Leadership",
        "CCH Axcess",
        "Tax Planning",
        "Client Management",
        "Corporate Accounting",
        "M&A Tax Experience",
        "International Tax Knowledge",
        "Project Management"
      ],
      skills: ["1120", "Team Leadership", "CCH Axcess", "Tax Planning"],
      workSchedule: "Standard business hours with flexibility. Extended hours during busy season (January-April and September-October).",
      reportingTo: "Senior Tax Director",
      careerGrowth: "This role provides a pathway to Senior Manager and Director positions. Opportunities for cross-functional experience and potential US assignments.",
      companyWebsite: "www.globaltaxservices.com",
      companyEmail: "careers.in@globaltaxservices.com",
      companyPhone: "+91-80-4567-8900",
      companyRating: 4.5,
      officeImages: [
        "State-of-the-art technology center",
        "Modern conference facilities",
        "Collaborative workspaces",
        "Employee cafeteria and lounges"
      ]
    },
    // Add more job details as needed...
  };

  return jobDetails[id as keyof typeof jobDetails] || jobDetails[1]; // Default to first job if ID not found
};

export function JobDetails({ jobId, onBack, onJobApplication }: JobDetailsProps) {
  const job = getJobDetails(jobId);

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save Job
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Job Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
                  <div className="flex items-center text-lg text-primary">
                    <Building className="w-5 h-5 mr-2" />
                    {job.company}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{job.type}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {job.urgent && (
                  <Badge variant="destructive">Urgent Hiring</Badge>
                )}
                <Badge variant="outline">{job.remote}</Badge>
                <Badge variant="outline">{job.companySize}</Badge>
                <Badge variant="outline">{job.industry}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="px-8"
                onClick={() => onJobApplication?.(job.title, job.company)}
              >
                Apply Now
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Deadline: {job.applicationDeadline}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {job.jobDescription}
              </p>
            </CardContent>
          </Card>

          {/* Key Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Key Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                About {job.company}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {job.companyDescription}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>{job.companyRating}/5.0 Rating</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <a href={`https://${job.companyWebsite}`} className="text-primary hover:underline">
                    {job.companyWebsite}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Benefits & Perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {job.companyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Apply */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Apply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => onJobApplication?.(job.title, job.company)}
              >
                Apply Now
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Your TaxTalent profile will be submitted
              </div>
            </CardContent>
          </Card>

          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{job.postedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span>{job.applicationDeadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span>{job.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Mode:</span>
                  <span>{job.remote}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reports to:</span>
                  <span className="text-right">{job.reportingTo}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${job.companyEmail}`} className="text-primary hover:underline">
                  {job.companyEmail}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{job.companyPhone}</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                <a href={`https://${job.companyWebsite}`} className="text-primary hover:underline">
                  {job.companyWebsite}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Career Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Career Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {job.careerGrowth}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}