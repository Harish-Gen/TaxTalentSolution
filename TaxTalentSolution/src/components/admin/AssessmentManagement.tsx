import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Award,
  FileText,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Copy
} from "lucide-react";

interface Assessment {
  id: number;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  questions: number;
  duration: number;
  passingScore: number;
  totalAttempts: number;
  avgScore: number;
  status: "active" | "draft" | "archived";
  createdDate: string;
}

interface Question {
  id: number;
  assessmentId: number;
  question: string;
  type: "multiple-choice" | "true-false" | "scenario";
  difficulty: string;
  points: number;
  options?: string[];
  correctAnswer: string;
}

// Mock assessments data
const mockAssessments: Assessment[] = [
  {
    id: 1,
    title: "Form 1040 - Individual Income Tax",
    category: "Individual Taxation",
    difficulty: "Advanced",
    questions: 30,
    duration: 60,
    passingScore: 70,
    totalAttempts: 245,
    avgScore: 82.4,
    status: "active",
    createdDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Form 1065 - Partnership Tax",
    category: "Partnership Taxation",
    difficulty: "Advanced",
    questions: 25,
    duration: 50,
    passingScore: 70,
    totalAttempts: 156,
    avgScore: 78.6,
    status: "active",
    createdDate: "2024-02-10"
  },
  {
    id: 3,
    title: "Form 1120 - Corporate Tax",
    category: "Corporate Taxation",
    difficulty: "Expert",
    questions: 35,
    duration: 75,
    passingScore: 75,
    totalAttempts: 132,
    avgScore: 75.2,
    status: "active",
    createdDate: "2024-03-05"
  },
  {
    id: 4,
    title: "S Corporation Taxation Fundamentals",
    category: "Corporate Taxation",
    difficulty: "Intermediate",
    questions: 20,
    duration: 40,
    passingScore: 65,
    totalAttempts: 98,
    avgScore: 80.1,
    status: "active",
    createdDate: "2024-04-20"
  },
  {
    id: 5,
    title: "Private Equity Tax Structures",
    category: "Advanced Tax Planning",
    difficulty: "Expert",
    questions: 40,
    duration: 90,
    passingScore: 80,
    totalAttempts: 45,
    avgScore: 72.5,
    status: "active",
    createdDate: "2024-05-15"
  },
  {
    id: 6,
    title: "Operating Partnership Advanced",
    category: "Partnership Taxation",
    difficulty: "Expert",
    questions: 30,
    duration: 60,
    passingScore: 75,
    totalAttempts: 0,
    avgScore: 0,
    status: "draft",
    createdDate: "2024-12-28"
  },
];

// Mock questions data
const mockQuestions: Question[] = [
  {
    id: 1,
    assessmentId: 1,
    question: "What is the standard deduction for a single filer in tax year 2024?",
    type: "multiple-choice",
    difficulty: "Beginner",
    points: 5,
    options: ["$12,950", "$13,850", "$14,600", "$15,000"],
    correctAnswer: "$14,600"
  },
  {
    id: 2,
    assessmentId: 1,
    question: "Schedule C is used to report self-employment income.",
    type: "true-false",
    difficulty: "Beginner",
    points: 3,
    correctAnswer: "True"
  },
  {
    id: 3,
    assessmentId: 1,
    question: "A taxpayer received $50,000 in self-employment income and has $15,000 in business expenses. They also have W-2 income of $80,000. Calculate the total adjusted gross income.",
    type: "scenario",
    difficulty: "Intermediate",
    points: 10,
    correctAnswer: "$115,000"
  },
];

export function AssessmentManagement() {
  const [activeTab, setActiveTab] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-blue-100 text-blue-800";
      case "Intermediate":
        return "bg-purple-100 text-purple-800";
      case "Advanced":
        return "bg-orange-100 text-orange-800";
      case "Expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl">Create New Assessment</h3>
            <p className="text-sm text-muted-foreground">
              Set up a new skill assessment for candidates
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Assessment Title</Label>
                  <Input 
                    placeholder="e.g., Form 1040 - Individual Income Tax" 
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Taxation</SelectItem>
                      <SelectItem value="partnership">Partnership Taxation</SelectItem>
                      <SelectItem value="corporate">Corporate Taxation</SelectItem>
                      <SelectItem value="advanced">Advanced Tax Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty Level</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Number of Questions</Label>
                  <Input 
                    type="number" 
                    placeholder="30" 
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Passing Score (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="70" 
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Points per Question</Label>
                  <Input 
                    type="number" 
                    placeholder="3.33" 
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe what this assessment covers..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button type="button">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Assessment
                </Button>
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedAssessment) {
    const assessmentQuestions = mockQuestions.filter(q => q.assessmentId === selectedAssessment.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl">{selectedAssessment.title}</h3>
            <p className="text-sm text-muted-foreground">
              Manage questions and settings
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
              ← Back to Assessments
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Assessment Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                <p className="text-2xl">{selectedAssessment.questions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl">{selectedAssessment.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Passing Score</p>
                <p className="text-2xl">{selectedAssessment.passingScore}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-2xl">{selectedAssessment.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Bank */}
        <Card>
          <CardHeader>
            <CardTitle>Question Bank ({assessmentQuestions.length})</CardTitle>
            <CardDescription>Manage assessment questions and answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessmentQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline">{question.points} points</Badge>
                          <Badge variant="secondary">{question.type}</Badge>
                        </div>
                        
                        <p className="mb-3">{question.question}</p>
                        
                        {question.options && (
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, i) => (
                              <div 
                                key={i} 
                                className={`p-2 rounded border ${
                                  option === question.correctAnswer 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {option === question.correctAnswer && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  <span className="text-sm">{option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-sm text-muted-foreground">
                          Correct Answer: <span className="text-green-600">{question.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {assessmentQuestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl">Assessment Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage skill assessments
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl mt-1">{mockAssessments.length}</p>
              </div>
              <Award className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl mt-1 text-green-600">
                  {mockAssessments.filter(a => a.status === "active").length}
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
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl mt-1">
                  {mockAssessments.reduce((acc, a) => acc + a.totalAttempts, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl mt-1">
                  {(mockAssessments
                    .filter(a => a.avgScore > 0)
                    .reduce((acc, a) => acc + a.avgScore, 0) / 
                    mockAssessments.filter(a => a.avgScore > 0).length
                  ).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>Manage existing assessments and question banks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4>{assessment.title}</h4>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status}
                        </Badge>
                        <Badge className={getDifficultyColor(assessment.difficulty)}>
                          {assessment.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{assessment.category}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Questions</p>
                          <p>{assessment.questions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p>{assessment.duration} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passing Score</p>
                          <p>{assessment.passingScore}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p>{assessment.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Score</p>
                          <p className={assessment.avgScore >= assessment.passingScore ? "text-green-600" : "text-orange-600"}>
                            {assessment.avgScore > 0 ? `${assessment.avgScore}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Questions
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
