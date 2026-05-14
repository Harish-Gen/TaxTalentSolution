import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  MapPin, 
  Briefcase, 
  Award,
  Star,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  Download,
  Send,
  UserPlus,
  CheckCircle,
  TrendingUp,
  FileText,
  LinkedinIcon
} from "lucide-react";

interface CandidateProfileViewProps {
  candidateId: number;
  onBack: () => void;
}

// Mock detailed candidate data
const candidateDetails = {
  id: 1,
  name: "Priya Sharma",
  title: "Senior Tax Analyst - 1040 Specialist",
  location: "Bangalore, Karnataka",
  experience: 5,
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  linkedin: "linkedin.com/in/priyasharma",
  profileViews: 156,
  rating: 4.8,
  availability: "Immediate",
  hourlyRate: 2500,
  preferredRate: "₹2,500 - ₹3,000",
  workMode: "Remote",
  timeZone: "IST (UTC+5:30)",
  summary: "Experienced tax professional specializing in individual returns with strong knowledge of complex tax scenarios. Proven track record of handling high-volume tax preparation while maintaining accuracy and compliance. Skilled in identifying tax-saving opportunities and providing strategic tax planning advice to clients.",
  
  skills: [
    { name: "Form 1040", proficiency: "Expert", verified: true },
    { name: "Schedule C", proficiency: "Expert", verified: true },
    { name: "Itemized Deductions", proficiency: "Advanced", verified: true },
    { name: "Tax Planning", proficiency: "Advanced", verified: false },
    { name: "ProConnect", proficiency: "Expert", verified: true },
    { name: "Drake Tax", proficiency: "Advanced", verified: false },
    { name: "State Tax Returns", proficiency: "Advanced", verified: true },
    { name: "Multi-State Filing", proficiency: "Intermediate", verified: false },
  ],
  
  certifications: [
    { name: "1040 Individual Income Tax - Advanced", issuer: "TaxTalent", year: 2024, score: 95 },
    { name: "Enrolled Agent (EA)", issuer: "IRS", year: 2022, score: null },
    { name: "Tax Planning Specialist", issuer: "NSA", year: 2023, score: null },
  ],
  
  assessments: [
    { name: "Form 1040 Assessment", score: 95, percentile: 92, date: "2024-11-15" },
    { name: "Schedule C Assessment", score: 92, percentile: 88, date: "2024-10-20" },
    { name: "Itemized Deductions", score: 88, percentile: 85, date: "2024-09-10" },
  ],
  
  experience_details: [
    {
      role: "Senior Tax Analyst",
      company: "ABC Tax Services",
      duration: "Jan 2022 - Present",
      description: "Lead tax preparation for 200+ individual clients annually. Specialized in complex 1040 scenarios including multi-state returns, self-employment income, and investment income reporting.",
      achievements: [
        "Maintained 99.8% accuracy rate across all filings",
        "Reduced average processing time by 25%",
        "Mentored 3 junior tax analysts"
      ]
    },
    {
      role: "Tax Analyst",
      company: "XYZ Consulting",
      duration: "Jun 2020 - Dec 2021",
      description: "Prepared individual and small business tax returns. Handled client communications and IRS correspondence.",
      achievements: [
        "Processed 150+ returns per tax season",
        "Achieved 98% client satisfaction rating",
        "Successfully resolved 30+ IRS notices"
      ]
    },
    {
      role: "Junior Tax Associate",
      company: "DEF Accounting",
      duration: "Jul 2019 - May 2020",
      description: "Assisted in tax return preparation and data entry. Learned fundamentals of US taxation.",
      achievements: [
        "Completed 100+ returns under supervision",
        "Earned 1040 certification"
      ]
    }
  ],
  
  education: [
    { degree: "Bachelor of Commerce", institution: "University of Bangalore", year: 2019 },
    { degree: "EA Certification", institution: "IRS", year: 2022 },
  ],
  
  languages: ["English (Fluent)", "Hindi (Native)", "Kannada (Native)"],
  
  tools: ["ProConnect Tax", "Drake Tax", "CCH Axcess", "Microsoft Excel", "QuickBooks"],
  
  interviewFeedback: {
    totalInterviews: 3,
    avgRating: 4.5,
    recommendations: {
      highly: 2,
      recommended: 1,
      maybe: 0,
      not: 0
    }
  },
  
  screening: {
    domainKnowledge: {
      rating: 8,
      comments: "Strong understanding of US tax regulations and forms. Demonstrates expertise in 1040 individual returns and multi-state filing requirements."
    },
    communicationSkills: {
      rating: 9,
      comments: "Excellent written and verbal communication skills. Responds promptly to emails and maintains professional tone in all interactions."
    },
    interpersonalSkills: {
      rating: 8,
      comments: "Works well with team members and clients. Demonstrates empathy and patience when explaining complex tax concepts."
    },
    leadershipAbility: {
      rating: 7,
      comments: "Shows potential for leadership roles. Has mentored junior team members and takes initiative on complex cases."
    },
    cultureFit: {
      rating: 9,
      comments: "Excellent cultural fit for US-based firms. Understands professional expectations and adapts well to remote work environments."
    },
    overallRating: {
      rating: 8,
      comments: "Highly recommended candidate with strong technical skills and professional demeanor. Ready for immediate placement with minimal training."
    },
    verifiedBy: "Admin Team",
    lastUpdated: "2024-12-15"
  }
};

export function CandidateProfileView({ candidateId, onBack }: CandidateProfileViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Search
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </Button>
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Request Interview
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Shortlist Candidate
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl">
                {candidateDetails.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              {/* Basic Info */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl">{candidateDetails.name}</h2>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{candidateDetails.title}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidateDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidateDetails.experience} years exp.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidateDetails.availability}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidateDetails.preferredRate}/hr</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    {renderStars(candidateDetails.rating)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {candidateDetails.profileViews} profile views
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{candidateDetails.email}</span>
              </div>
              <div className="flex items-center justify-end space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{candidateDetails.phone}</span>
              </div>
              <div className="flex items-center justify-end space-x-2 text-sm">
                <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                <a href={`https://${candidateDetails.linkedin}`} className="text-primary hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full justify-start">
          <TabsTrigger value="overview" className="flex-1 text-sm">Overview</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 text-sm">Skills</TabsTrigger>
          <TabsTrigger value="experience" className="flex-1 text-sm">Experience</TabsTrigger>
          <TabsTrigger value="certifications" className="flex-1 text-sm">Certs</TabsTrigger>
          <TabsTrigger value="screening" className="flex-1 text-sm">Screening</TabsTrigger>
          <TabsTrigger value="interviews" className="flex-1 text-sm">Interviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {candidateDetails.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Work Mode:</span>
                  <span className="text-sm">{candidateDetails.workMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time Zone:</span>
                  <span className="text-sm">{candidateDetails.timeZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Availability:</span>
                  <Badge variant="secondary">{candidateDetails.availability}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Rate:</span>
                  <span className="text-sm">{candidateDetails.preferredRate}/hr</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {candidateDetails.languages.map((lang, i) => (
                      <Badge key={i} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Software Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {candidateDetails.tools.map((tool, i) => (
                      <Badge key={i} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills & Assessments Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Matrix</CardTitle>
              <CardDescription>Verified and self-reported skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidateDetails.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {skill.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm">{skill.name}</span>
                    </div>
                    <Badge variant={skill.proficiency === "Expert" ? "default" : "secondary"}>
                      {skill.proficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>Verified skill assessments completed on TaxTalent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidateDetails.assessments.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Award className="w-5 h-5 text-primary" />
                        <h4 className="text-sm">{assessment.name}</h4>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Completed: {new Date(assessment.date).toLocaleDateString()}</span>
                        <span>Top {100 - assessment.percentile}% of test takers</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl mb-1">{assessment.score}%</div>
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {assessment.percentile}th percentile
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidateDetails.experience_details.map((exp, index) => (
                  <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary last:border-l-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-primary rounded-full"></div>
                    <div>
                      <h4 className="mb-1">{exp.role}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{exp.company}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{exp.duration}</span>
                      </div>
                      <p className="text-sm mb-3">{exp.description}</p>
                      <div>
                        <p className="text-sm mb-2">Key Achievements:</p>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidateDetails.education.map((edu, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="text-sm mb-1">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <Badge variant="outline">{edu.year}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Certifications</CardTitle>
              <CardDescription>Verified credentials and licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidateDetails.certifications.map((cert, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <Award className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm mb-1">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{cert.issuer}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Year: {cert.year}</Badge>
                            {cert.score && (
                              <Badge className="bg-green-100 text-green-800">
                                Score: {cert.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screening Tab - Visible to Employers */}
        <TabsContent value="screening" className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Platform Screening Assessment</CardTitle>
              <CardDescription>
                Internal evaluation conducted by Tax Talent Solution admin team - Last updated: {candidateDetails.screening.lastUpdated}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Categories */}
              <div className="space-y-6">
                {/* Domain Knowledge */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Domain Knowledge</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.domainKnowledge.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {candidateDetails.screening.domainKnowledge.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidateDetails.screening.domainKnowledge.comments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Communication Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.communicationSkills.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {candidateDetails.screening.communicationSkills.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidateDetails.screening.communicationSkills.comments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Interpersonal Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Interpersonal Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.interpersonalSkills.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {candidateDetails.screening.interpersonalSkills.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidateDetails.screening.interpersonalSkills.comments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Leadership Ability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Leadership Ability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.leadershipAbility.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {candidateDetails.screening.leadershipAbility.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidateDetails.screening.leadershipAbility.comments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Culture Fit */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Culture Fit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.cultureFit.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {candidateDetails.screening.cultureFit.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">{candidateDetails.screening.cultureFit.comments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Rating */}
                <Card className="border-2 border-primary bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">Overall Rating</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              num <= candidateDetails.screening.overallRating.rating
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <Badge className="bg-green-600 text-white text-base px-4 py-2">
                        {candidateDetails.screening.overallRating.rating}/10
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comments</Label>
                      <p className="text-sm mt-1 p-3 bg-white rounded-md">{candidateDetails.screening.overallRating.comments}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <span>Verified by: {candidateDetails.screening.verifiedBy}</span>
                <span>Last updated: {new Date(candidateDetails.screening.lastUpdated).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Feedback Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.totalInterviews}</div>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.avgRating}</div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.recommendations.highly}</div>
                <p className="text-sm text-muted-foreground">Highly Recommended</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl mb-1">{candidateDetails.interviewFeedback.recommendations.recommended}</div>
                <p className="text-sm text-muted-foreground">Recommended</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Interview Performance</CardTitle>
              <CardDescription>
                Limited view - Full interview feedback visible to admins only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Detailed interview feedback is available to platform administrators</p>
                <p className="text-sm mt-2">Summary ratings and recommendations are displayed above</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
