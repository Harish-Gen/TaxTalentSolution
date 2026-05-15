import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
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
  Loader2
} from "lucide-react";
import { useAssessments } from "../../database/hooks";
import { assessmentService } from "../../api/assessmentService";
import { questionService, type FrontendQuestion, type QuestionQAJson } from "../../api/questionService";
import type { Assessment as DBAssessment } from "../../database/types";
import { toast } from "sonner";

const DEFAULT_QUESTION_FORM = {
  question: "",
  type: "multiple-choice" as QuestionQAJson["type"],
  difficulty: "Beginner",
  points: 5,
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correctAnswer: "",
};

export function AssessmentManagement() {
  const { assessments: dbAssessments, loading } = useAssessments();
  const [selectedAssessment, setSelectedAssessment] = useState<DBAssessment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<DBAssessment | null>(null);

  // Live questions state for the selected assessment
  const [liveQuestions, setLiveQuestions] = useState<FrontendQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Add Question modal state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({ ...DEFAULT_QUESTION_FORM });
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    difficulty: "",
    questions: 0,
    duration: 0,
    passingScore: 0,
    pointsPerQuestion: 0,
    description: "",
    status: "draft"
  });

  const assessments = useMemo(() => {
    return dbAssessments.filter(a => a.is_active !== false);
  }, [dbAssessments]);

  // Fetch live questions whenever selectedAssessment changes
  useEffect(() => {
    if (!selectedAssessment) {
      setLiveQuestions([]);
      return;
    }
    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const data = await questionService.getQuestionsByAssessment(selectedAssessment.id);
        setLiveQuestions(data);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setLiveQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedAssessment]);

  const handleAddQuestion = async () => {
    if (!selectedAssessment) return;
    if (!questionForm.question.trim()) {
      toast.error('Question text is required');
      return;
    }
    const options = questionForm.type === 'multiple-choice'
      ? [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4].filter(Boolean)
      : undefined;
    const qajson: QuestionQAJson = {
      question: questionForm.question.trim(),
      type: questionForm.type,
      difficulty: questionForm.difficulty,
      points: questionForm.points,
      ...(options ? { options } : {}),
      ...(questionForm.correctAnswer ? { correctAnswer: questionForm.correctAnswer } : {}),
    };
    setSavingQuestion(true);
    try {
      const created = await questionService.createQuestion({
        qajson,
        assessment_ids: [selectedAssessment.id],
      });
      setLiveQuestions(prev => [...prev, created]);
      toast.success('Question added successfully');
      setShowAddQuestion(false);
      setQuestionForm({ ...DEFAULT_QUESTION_FORM });
    } catch (err) {
      console.error('Failed to add question:', err);
      toast.error('Failed to add question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await questionService.deleteQuestion(id);
      setLiveQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted');
    } catch (err) {
      console.error('Failed to delete question:', err);
      toast.error('Failed to delete question');
    } finally {
      setQuestionToDelete(null);
    }
  };

  const resetForm = () => {
    setEditForm({
      title: "",
      category: "",
      difficulty: "",
      questions: 0,
      duration: 0,
      passingScore: 0,
      pointsPerQuestion: 0,
      description: "",
      status: "draft"
    });
    setEditingAssessment(null);
  };

  const handleEdit = async (assessment: DBAssessment) => {
    try {
      const fresh = await assessmentService.getAssessmentById(assessment.id);
      setEditingAssessment(fresh);
      setEditForm({
        title: fresh.title,
        category: fresh.category || "Individual Taxation",
        difficulty: fresh.difficulty as any,
        questions: fresh.question_count,
        duration: fresh.duration_minutes,
        passingScore: fresh.passing_score,
        pointsPerQuestion: 0,
        description: fresh.description || "",
        status: fresh.status as any
      });
      setShowCreateForm(true);
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
      toast.error("Failed to load assessment data");
    }
  };

  const handleSave = async () => {
    try {
      await assessmentService.upsertAssessment({
        id: editingAssessment?.id,
        title: editForm.title,
        category: editForm.category,
        difficulty: editForm.difficulty as any,
        question_count: editForm.questions,
        duration_minutes: editForm.duration,
        passing_score: editForm.passingScore,
        description: editForm.description,
        status: editForm.status as any,
        is_active: true
      });
      toast.success(editingAssessment ? "Assessment updated" : "Assessment created");
      setShowCreateForm(false);
      setEditingAssessment(null);
    } catch (error) {
      console.error("Failed to save assessment:", error);
      toast.error("Failed to save assessment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assessmentService.deleteAssessment(id);
      toast.success("Assessment deleted");
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      toast.error("Failed to delete assessment");
    } finally {
      setAssessmentToDelete(null);
    }
  };

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
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-blue-100 text-blue-800";
      case "intermediate":
        return "bg-purple-100 text-purple-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading assessments...</span>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl">{editingAssessment ? "Edit Assessment" : "Create New Assessment"}</h3>
            <p className="text-sm text-muted-foreground">
              {editingAssessment ? "Update assessment settings" : "Set up a new skill assessment for candidates"}
            </p>
          </div>
          <Button variant="outline" onClick={() => { setShowCreateForm(false); setEditingAssessment(null); }}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Assessment Title</Label>
                  <Input 
                    placeholder="e.g., Form 1040 - Individual Income Tax" 
                    className="mt-2"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={editForm.category} onValueChange={(v: string) => setEditForm({ ...editForm, category: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual Taxation">Individual Taxation</SelectItem>
                      <SelectItem value="Partnership Taxation">Partnership Taxation</SelectItem>
                      <SelectItem value="Corporate Taxation">Corporate Taxation</SelectItem>
                      <SelectItem value="Advanced Tax Planning">Advanced Tax Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty Level</Label>
                  <Select value={editForm.difficulty} onValueChange={(v: string) => setEditForm({ ...editForm, difficulty: v })}>
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
                    value={editForm.questions}
                    onChange={(e) => setEditForm({ ...editForm, questions: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    className="mt-2"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Passing Score (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="70" 
                    className="mt-2"
                    value={editForm.passingScore}
                    onChange={(e) => setEditForm({ ...editForm, passingScore: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(v: string) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe what this assessment covers..."
                    className="mt-2"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <Button onClick={handleSave}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingAssessment ? "Update Assessment" : "Create Assessment"}
                </Button>
                <Button variant="outline" onClick={() => { setShowCreateForm(false); setEditingAssessment(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedAssessment) {
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
            <Button onClick={() => { setQuestionForm({ ...DEFAULT_QUESTION_FORM }); setShowAddQuestion(true); }}>
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
                <p className="text-2xl">{selectedAssessment.question_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl">{selectedAssessment.duration_minutes} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Passing Score</p>
                <p className="text-2xl">{selectedAssessment.passing_score}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-2xl">{selectedAssessment.avg_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Bank */}
        <Card>
          <CardHeader>
            <CardTitle>Question Bank ({liveQuestions.length})</CardTitle>
            <CardDescription>Questions linked to this assessment via API</CardDescription>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading questions...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {liveQuestions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.points} pts</Badge>
                            <Badge variant="secondary">{question.type}</Badge>
                          </div>
                          <p className="mb-3 font-medium">{question.question}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="space-y-2">
                              {question.options.map((option, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded border text-sm flex items-center space-x-2 ${
                                    option === question.correctAnswer
                                      ? 'bg-green-50 border-green-300'
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  {option === question.correctAnswer && (
                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                  )}
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => setQuestionToDelete(question.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {liveQuestions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No questions added yet</p>
                    <Button className="mt-4" onClick={() => { setQuestionForm({ ...DEFAULT_QUESTION_FORM }); setShowAddQuestion(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Question
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Question Modal */}
        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>
                Create a new question for <strong>{selectedAssessment.title}</strong>. It will be automatically linked to this assessment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Question Text */}
              <div>
                <Label>Question Text <span className="text-red-500">*</span></Label>
                <Textarea
                  className="mt-2"
                  rows={3}
                  placeholder="Enter the question..."
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Question Type */}
                <div>
                  <Label>Question Type</Label>
                  <Select
                    value={questionForm.type}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, type: v as QuestionQAJson["type"] })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True / False</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={questionForm.difficulty}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, difficulty: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Points */}
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    min={1}
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Options (for multiple-choice) */}
              {questionForm.type === "multiple-choice" && (
                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  {["option1", "option2", "option3", "option4"].map((key, i) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={(questionForm as any)[key]}
                        onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* True/False options */}
              {questionForm.type === "true-false" && (
                <div>
                  <Label>Correct Answer</Label>
                  <Select
                    value={questionForm.correctAnswer}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, correctAnswer: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Correct Answer for multiple-choice */}
              {questionForm.type === "multiple-choice" && (
                <div>
                  <Label>Correct Answer</Label>
                  <Select
                    value={questionForm.correctAnswer}
                    onValueChange={(v) => setQuestionForm({ ...questionForm, correctAnswer: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select the correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {[questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4]
                        .filter(Boolean)
                        .map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAddQuestion(false)} disabled={savingQuestion}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} disabled={savingQuestion}>
                {savingQuestion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {savingQuestion ? "Saving..." : "Add Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
          <DialogContent className="max-w-md sm:max-w-md">
            <DialogHeader className="sm:text-center flex flex-col items-center pt-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-center pt-2 text-base">
                Are you sure you want to delete this question? This action cannot be undone and will remove it from the assessment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center mt-6 flex-row gap-3 justify-center w-full">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setQuestionToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={() => questionToDelete && handleDeleteQuestion(questionToDelete)}>
                Delete Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            Create and manage skill assessments (Connected to API)
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateForm(true); }}>
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
                <p className="text-2xl mt-1">{assessments.length}</p>
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
                  {assessments.filter(a => a.status === "active").length}
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
                  {assessments.reduce((acc, a) => acc + (a.total_attempts || 0), 0)}
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
                  {assessments.filter(a => a.avg_score > 0).length > 0 
                    ? (assessments
                        .filter(a => a.avg_score > 0)
                        .reduce((acc, a) => acc + a.avg_score, 0) / 
                        assessments.filter(a => a.avg_score > 0).length
                      ).toFixed(1)
                    : "0.0"}%
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
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{assessment.title}</h4>
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
                          <p>{assessment.question_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p>{assessment.duration_minutes} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passing Score</p>
                          <p>{assessment.passing_score}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p>{assessment.total_attempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Score</p>
                          <p className={assessment.avg_score >= assessment.passing_score ? "text-green-600" : "text-orange-600"}>
                            {assessment.avg_score > 0 ? `${assessment.avg_score}%` : "N/A"}
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
                      <Button size="sm" variant="outline" onClick={() => handleEdit(assessment)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAssessmentToDelete(assessment.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {assessments.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No assessments found.</p>
                <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setShowCreateForm(true); }}>
                  Create Your First Assessment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!assessmentToDelete} onOpenChange={(open) => !open && setAssessmentToDelete(null)}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader className="sm:text-center flex flex-col items-center pt-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Are you sure you want to delete this assessment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 flex-row gap-3 justify-center w-full">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAssessmentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => assessmentToDelete && handleDelete(assessmentToDelete)}>
              Delete Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
