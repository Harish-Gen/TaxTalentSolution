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

const interviews: Interview[] = [];

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
                <p className="text-2xl mt-1">{interviews.length}</p>
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
                  {interviews.length
                    ? (interviews.reduce((acc, int) => acc + int.overallRating, 0) / interviews.length).toFixed(1)
                    : "—"}
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
                  {interviews.filter(i => i.recommendation === "Highly Recommended").length}
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
                <p className="text-2xl mt-1">{new Set(interviews.map(i => i.company)).size}</p>
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
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No interview feedback yet. Feedback from employers will appear here after your interviews.
            </p>
          ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
