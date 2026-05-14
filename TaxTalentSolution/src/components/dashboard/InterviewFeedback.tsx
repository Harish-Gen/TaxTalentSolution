import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { 
  Calendar, 
  User, 
  Star, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

interface Interview {
  id: number;
  date: string;
  interviewer: string;
  interviewerRole: string;
  company: string;
  position: string;
  overallRating: number;
  ratings: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    taxKnowledge: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  recommendation: "Highly Recommended" | "Recommended" | "Maybe" | "Not Recommended";
  status: "completed" | "pending";
}

// Mock data for interviews
const mockInterviews: Interview[] = [
  {
    id: 1,
    date: "2024-12-15",
    interviewer: "Sarah Johnson",
    interviewerRole: "Senior Tax Manager",
    company: "KPMG India",
    position: "Senior Tax Analyst - 1040 Specialist",
    overallRating: 4.5,
    ratings: {
      technicalSkills: 5,
      communication: 4,
      problemSolving: 4.5,
      taxKnowledge: 5
    },
    strengths: [
      "Exceptional knowledge of Form 1040 complexities",
      "Strong understanding of Schedule C and self-employment tax",
      "Excellent analytical skills in identifying deductions",
      "Proactive in asking clarifying questions"
    ],
    areasForImprovement: [
      "Could enhance knowledge of international tax treaties",
      "Recommended to gain more experience with state tax considerations"
    ],
    detailedFeedback: "The candidate demonstrated excellent technical proficiency in individual tax return preparation. Their understanding of complex 1040 scenarios, including self-employment income and itemized deductions, was impressive. They showed strong problem-solving abilities when presented with a multi-state tax scenario. Communication was clear and professional throughout the interview.",
    recommendation: "Highly Recommended",
    status: "completed"
  },
  {
    id: 2,
    date: "2024-12-10",
    interviewer: "Michael Chen",
    interviewerRole: "Tax Director",
    company: "Deloitte USI",
    position: "Tax Consultant - Partnership",
    overallRating: 3.8,
    ratings: {
      technicalSkills: 4,
      communication: 3.5,
      problemSolving: 4,
      taxKnowledge: 4
    },
    strengths: [
      "Good grasp of partnership taxation fundamentals",
      "Solid understanding of Form 1065",
      "Demonstrated knowledge of K-1 reporting"
    ],
    areasForImprovement: [
      "Needs more exposure to complex partnership allocations",
      "Recommended training in operating partnership structures",
      "Could improve presentation skills"
    ],
    detailedFeedback: "Candidate shows promise in partnership taxation. While the foundational knowledge is solid, there's room for growth in handling more complex scenarios. With additional training and exposure, they could become a valuable team member.",
    recommendation: "Recommended",
    status: "completed"
  },
  {
    id: 3,
    date: "2024-12-05",
    interviewer: "Jennifer Williams",
    interviewerRole: "HR Manager",
    company: "PwC AC",
    position: "Tax Associate - Corporate",
    overallRating: 4.2,
    ratings: {
      technicalSkills: 4,
      communication: 4.5,
      problemSolving: 4,
      taxKnowledge: 4.5
    },
    strengths: [
      "Excellent communication and interpersonal skills",
      "Strong work ethic and eagerness to learn",
      "Good understanding of corporate tax concepts",
      "Team player with positive attitude"
    ],
    areasForImprovement: [
      "Expand knowledge of international corporate tax",
      "Gain more practical experience with tax software"
    ],
    detailedFeedback: "Very impressive candidate from both technical and soft skills perspective. Shows great potential for growth and adaptation to our team culture.",
    recommendation: "Highly Recommended",
    status: "completed"
  }
];

export function InterviewFeedback() {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Highly Recommended":
        return "bg-green-100 text-green-800 border-green-300";
      case "Recommended":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Maybe":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Not Recommended":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

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

  if (selectedInterview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl">Interview Feedback Details</h3>
            <p className="text-sm text-muted-foreground">
              Review your interview performance and feedback
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedInterview(null)}>
            ← Back to All Interviews
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedInterview.position}</CardTitle>
                <CardDescription className="mt-2">
                  {selectedInterview.company}
                </CardDescription>
              </div>
              <Badge className={getRecommendationColor(selectedInterview.recommendation)}>
                {selectedInterview.recommendation}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interview Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Interview Date</p>
                  <p className="text-sm">{new Date(selectedInterview.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Interviewer</p>
                  <p className="text-sm">{selectedInterview.interviewer}</p>
                  <p className="text-xs text-muted-foreground">{selectedInterview.interviewerRole}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Overall Rating */}
            <div>
              <h4 className="mb-4">Overall Rating</h4>
              <div className="flex items-center justify-center p-6 bg-secondary/20 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">{selectedInterview.overallRating.toFixed(1)}</div>
                  {renderStars(selectedInterview.overallRating)}
                  <p className="text-sm text-muted-foreground mt-2">out of 5.0</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Ratings */}
            <div>
              <h4 className="mb-4">Performance Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Technical Skills</span>
                    {renderStars(selectedInterview.ratings.technicalSkills)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Communication</span>
                    {renderStars(selectedInterview.ratings.communication)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Problem Solving</span>
                    {renderStars(selectedInterview.ratings.problemSolving)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tax Knowledge</span>
                    {renderStars(selectedInterview.ratings.taxKnowledge)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Strengths */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4>Strengths</h4>
              </div>
              <ul className="space-y-2">
                {selectedInterview.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Areas for Improvement */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <h4>Areas for Improvement</h4>
              </div>
              <ul className="space-y-2">
                {selectedInterview.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Detailed Feedback */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h4>Detailed Feedback</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedInterview.detailedFeedback}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl mt-1">{mockInterviews.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl mt-1">
                  {(mockInterviews.reduce((acc, int) => acc + int.overallRating, 0) / mockInterviews.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 opacity-50 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highly Recommended</p>
                <p className="text-2xl mt-1">
                  {mockInterviews.filter(i => i.recommendation === "Highly Recommended").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl mt-1">{new Set(mockInterviews.map(i => i.company)).size}</p>
              </div>
              <User className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <CardDescription>
            View feedback from your previous interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInterviews.map((interview) => (
              <Card key={interview.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4>{interview.position}</h4>
                        <Badge className={getRecommendationColor(interview.recommendation)}>
                          {interview.recommendation}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{interview.company}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(interview.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{interview.interviewer}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Overall Rating:</span>
                          {renderStars(interview.overallRating)}
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={() => setSelectedInterview(interview)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
