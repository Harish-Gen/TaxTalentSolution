import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Assessment1040 } from "./Assessment1040";
import { Certificate1040, type CertificateViewData } from "./Certificate1040";
import { 
  Award, 
  Play, 
  Clock, 
  CheckCircle, 
  Star, 
  Trophy,
  BookOpen,
  Target,
  Download,
  Share2,
  Eye,
  Loader2
} from "lucide-react";
import { useAssessments, useCertificates, useUserAssessmentActivity } from "../../database";
import { getSubscription } from "../../database/userStore";
import {
  markAssessmentInProgress,
  markAssessmentCompleted,
} from "../../database/assessmentUserStore";
import { userAssessmentService, isUuid } from "../../api/userAssessmentService";
import {
  questionService,
  mapFrontendQuestionsToExam,
  type ExamQuestion,
} from "../../api/questionService";
import { certificateService } from "../../api/certificateService";
import { candidateService } from "../../api/candidateService";
import type { CandidatePlan } from "../../database/types";
import { toast } from "sonner";

interface AssessmentCertificatesProps {
  user?: any;
}

export function AssessmentCertificates({ user }: AssessmentCertificatesProps) {
  const [activeTab, setActiveTab] = useState("available");
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateViewData | null>(null);
  const [plan, setPlan] = useState<CandidatePlan>("free");
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[] | null>(null);
  const [startingAssessment, setStartingAssessment] = useState(false);

  const userId = user?.id as string | undefined;
  const {
    assessments: dbAssessments,
    loading: assessmentsLoading,
    error: assessmentsError,
    refresh: refreshAssessments,
  } = useAssessments();
  const { certificates: dbCertificates, loading: certificatesLoading } = useCertificates(userId);
  const { apiRecords, localRecords, loading: activityLoading } = useUserAssessmentActivity(
    userId,
    activityRefresh
  );

  const loading = assessmentsLoading || certificatesLoading || activityLoading;

  useEffect(() => {
    if (user?.id) {
      const sub = getSubscription(user.id);
      setPlan(sub.plan);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "available") {
      void refreshAssessments();
    }
  }, [activeTab, refreshAssessments]);

  const formatDifficulty = (d?: string) => {
    const v = (d || "intermediate").toLowerCase();
    if (v === "beginner") return "Beginner";
    if (v === "advanced" || v === "expert") return "Advanced";
    return "Intermediate";
  };

  const availableAssessments = useMemo(() => {
    return dbAssessments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || a.category || "",
      duration: `${a.duration_minutes || 45} minutes`,
      questions: a.question_count || 0,
      difficulty: formatDifficulty(a.difficulty),
      priceNum: a.price || 299,
      skills: a.skills_validated?.length ? a.skills_validated : a.category ? [a.category] : [],
      rating: a.rating || 0,
      completedBy: a.total_attempts || 0,
    }));
  }, [dbAssessments]);

  const renderPrice = (originalPrice: number) => {
    if (plan === 'premium') {
      return (
        <div className="text-right mb-4">
          <div className="text-sm line-through text-muted-foreground">₹{originalPrice}</div>
          <div className="text-2xl font-bold text-green-600">FREE</div>
          <div className="text-xs text-green-600">Premium Plan</div>
        </div>
      );
    }
    if (plan === 'professional') {
      const discounted = Math.round(originalPrice * 0.5);
      return (
        <div className="text-right mb-4">
          <div className="text-sm line-through text-muted-foreground">₹{originalPrice}</div>
          <div className="text-2xl font-bold text-primary">₹{discounted}</div>
          <div className="text-xs text-blue-600">50% off — Pro Plan</div>
        </div>
      );
    }
    // free plan — full price
    return (
      <div className="text-right mb-4">
        <div className="text-2xl font-bold text-primary">₹{originalPrice}</div>
        <div className="text-sm text-muted-foreground">Assessment Fee</div>
      </div>
    );
  };
  
  const earnedCertificates = useMemo(() => {
    type CertRow = {
      id: string;
      assessmentId?: string;
      title: string;
      description?: string;
      issueDate: string;
      score: number;
      validUntil: string;
      credentialId: string;
      level: string;
      skillsValidated: string[];
    };

    const rows: CertRow[] = dbCertificates.map((c) => ({
      id: c.id,
      assessmentId: c.assessment_id,
      title: c.title,
      issueDate: c.issue_date
        ? new Date(c.issue_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      score: c.score || 0,
      validUntil: c.expiry_date
        ? new Date(c.expiry_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "",
      credentialId: c.credential_id || "",
      level:
        c.level === "expert"
          ? "Expert"
          : c.level === "specialist"
            ? "Specialist"
            : "Professional",
      skillsValidated: c.skills_validated || [],
    }));

    for (const local of localRecords.filter((r) => r.status === "completed")) {
      if (rows.some((r) => r.assessmentId === local.assessmentId)) continue;
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2);
      rows.push({
        id: `local-${local.assessmentId}`,
        assessmentId: local.assessmentId,
        title: local.title,
        issueDate: local.completedAt
          ? new Date(local.completedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "",
        score: local.score ?? 0,
        validUntil: expiry.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        credentialId: local.credentialId || "",
        level: (local.score ?? 0) >= 85 ? "Expert" : "Professional",
        skillsValidated: [],
      });
    }

    for (const api of apiRecords.filter((r) =>
      (r.status || "").toLowerCase() === "completed"
    )) {
      if (rows.some((r) => r.assessmentId === api.assessmentid)) continue;
      const meta = dbAssessments.find((a) => a.id === api.assessmentid);
      rows.push({
        id: api.id,
        assessmentId: api.assessmentid,
        title: meta?.title || "Assessment",
        issueDate: api.completedon
          ? new Date(api.completedon).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "",
        score: 0,
        validUntil: "",
        credentialId: api.id.slice(0, 8).toUpperCase(),
        level: "Professional",
        skillsValidated: meta?.skills_validated || [],
      });
    }

    return rows;
  }, [dbCertificates, localRecords, apiRecords, dbAssessments]);

  const inProgressAssessments = useMemo(() => {
    const rows: Array<{
      id: string;
      assessmentId: string;
      title: string;
      progress: number;
      timeLeft: string;
      questionsAnswered: number;
      totalQuestions: number;
    }> = [];

    for (const local of localRecords.filter((r) => r.status === "in_progress")) {
      rows.push({
        id: local.assessmentId,
        assessmentId: local.assessmentId,
        title: local.title,
        progress: local.progress,
        timeLeft: local.timeLeftMinutes
          ? `${local.timeLeftMinutes} minutes`
          : "—",
        questionsAnswered: local.questionsAnswered ?? 0,
        totalQuestions: local.totalQuestions ?? 0,
      });
    }

    for (const api of apiRecords) {
      const status = (api.status || "").toLowerCase();
      if (status === "completed") continue;
      if (rows.some((r) => r.assessmentId === api.assessmentid)) continue;
      const meta = dbAssessments.find((a) => a.id === api.assessmentid);
      rows.push({
        id: api.id,
        assessmentId: api.assessmentid,
        title: meta?.title || "Assessment",
        progress: 0,
        timeLeft: meta?.duration_minutes ? `${meta.duration_minutes} minutes` : "—",
        questionsAnswered: 0,
        totalQuestions: meta?.question_count ?? 0,
      });
    }

    return rows;
  }, [localRecords, apiRecords, dbAssessments]);

  const stats = useMemo(() => {
    const scores = earnedCertificates.map((c) => c.score).filter((s) => s > 0);
    return {
      certificatesEarned: earnedCertificates.length,
      averageScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
      inProgressCount: inProgressAssessments.length,
    };
  }, [earnedCertificates, inProgressAssessments]);

  const is1040Assessment = (title: string) => /1040/i.test(title);
  const is1040Certificate = (cert: { title: string; assessmentId?: string }) =>
    is1040Assessment(cert.title) ||
    (cert.assessmentId
      ? is1040Assessment(
          dbAssessments.find((a) => a.id === cert.assessmentId)?.title || ""
        )
      : false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-purple-100 text-purple-800";
      case "Specialist": return "bg-blue-100 text-blue-800";
      case "Professional": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartAssessment = async (assessment: (typeof availableAssessments)[0]) => {
    setStartingAssessment(true);
    try {
      const apiQuestions = await questionService.getQuestionsByAssessment(assessment.id);
      const mapped = mapFrontendQuestionsToExam(apiQuestions);
      setExamQuestions(mapped.length > 0 ? mapped : null);
      if (mapped.length === 0) {
        toast.info("No questions linked yet — using sample questions for this session.");
      }
    } catch (error) {
      console.error("Failed to load assessment questions:", error);
      setExamQuestions(null);
      toast.error("Could not load questions; using sample questions.");
    } finally {
      setStartingAssessment(false);
    }

    if (userId) {
      markAssessmentInProgress(
        userId,
        assessment.id,
        assessment.title,
        assessment.questions || 50
      );
      if (isUuid(userId) && isUuid(assessment.id)) {
        try {
          await userAssessmentService.upsert({
            userid: userId,
            assessmentid: assessment.id,
            status: "in_progress",
            startedon: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to save assessment start:", error);
        }
      }
      setActivityRefresh((n) => n + 1);
    }
    setCurrentAssessmentId(assessment.id);
  };

  const handleBackToAssessments = () => {
    setCurrentAssessmentId(null);
    setExamQuestions(null);
    setActivityRefresh((n) => n + 1);
  };

  const handleAssessmentComplete = async (score: number) => {
    const active = availableAssessments.find((a) => a.id === currentAssessmentId);
    if (userId && active) {
      markAssessmentCompleted(
        userId,
        active.id,
        active.title,
        score,
        active.questions || 50
      );
      if (isUuid(userId) && isUuid(active.id)) {
        try {
          await userAssessmentService.upsert({
            userid: userId,
            assessmentid: active.id,
            status: "completed",
            completedon: new Date().toISOString(),
            score,
          });
          const candidate = await candidateService.getCandidateByUserId(userId, {
            ensure: true,
          });
          if (candidate?.id) {
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 2);
            await certificateService.create({
              candidateid: candidate.id,
              userid: userId,
              assessmentid: active.id,
              credentialid: `TT-${active.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
              title: active.title,
              score: Math.round(score),
              level: score >= 90 ? "expert" : score >= 75 ? "specialist" : "professional",
              issuedate: new Date().toISOString().slice(0, 10),
              expirydate: expiry.toISOString().slice(0, 10),
              skillsvalidated: active.skills?.length ? active.skills : [active.description],
            });
          }
        } catch (error) {
          console.error("Failed to persist assessment completion:", error);
        }
      }
    }
    setActivityRefresh((n) => n + 1);
  };

  const handleShowCertificate = (cert: {
    id: string;
    title: string;
    score: number;
    issueDate: string;
    validUntil: string;
    credentialId: string;
    level: string;
    description?: string;
  }) => {
    if (!is1040Certificate(cert)) return;
    setSelectedCertificate({
      title: cert.title,
      score: cert.score,
      issueDate: cert.issueDate,
      validUntil: cert.validUntil,
      credentialId: cert.credentialId,
      level: cert.level,
      description: cert.description,
    });
    setShowCertificate("1040");
  };

  const handleBackToCertificates = () => {
    setShowCertificate(null);
    setSelectedCertificate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading assessments...</span>
      </div>
    );
  }

  if (startingAssessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Preparing assessment...</span>
      </div>
    );
  }

  if (currentAssessmentId) {
    const active = availableAssessments.find((a) => a.id === currentAssessmentId);
    const durationMinutes = dbAssessments.find((a) => a.id === currentAssessmentId)?.duration_minutes;
    return (
      <Assessment1040
        onBack={handleBackToAssessments}
        onComplete={handleAssessmentComplete}
        assessmentTitle={active?.title}
        examQuestions={examQuestions ?? undefined}
        durationMinutes={durationMinutes || undefined}
        user={user}
      />
    );
  }

  if (showCertificate === "1040") {
    return (
      <Certificate1040
        onBack={handleBackToCertificates}
        user={user}
        certificate={selectedCertificate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Award className="w-6 h-6 mr-2" />
            Assessments & Certifications
          </CardTitle>
          <p className="text-muted-foreground">
            Validate your skills and earn industry-recognized certifications to boost your profile
          </p>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
            <div className="text-sm text-muted-foreground">Certificates Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.averageScore > 0 ? `${stats.averageScore}%` : "—"}</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.inProgressCount}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{availableAssessments.length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Assessments</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
        </TabsList>

        {/* Available Assessments */}
        <TabsContent value="available" className="space-y-4">
          {availableAssessments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
                <p className="text-muted-foreground">
                  {assessmentsLoading
                    ? "Loading assessments…"
                    : assessmentsError
                      ? `Could not load assessments: ${assessmentsError}. Is the API running at ${import.meta.env.VITE_API_URL || "VITE_API_URL"}?`
                      : "No assessments in the catalog. Run migrations (012 seed) or create assessments in Admin and set status to Active."}
                </p>
                {assessmentsError && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => refreshAssessments()}>
                    Retry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-4">
            {availableAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{assessment.title}</h3>
                          <p className="text-muted-foreground">{assessment.description}</p>
                        </div>
                        <Badge className={getDifficultyColor(assessment.difficulty)}>
                          {assessment.difficulty}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {assessment.duration}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {assessment.questions} questions
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {assessment.rating}/5
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {assessment.completedBy} completed
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {assessment.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      {renderPrice(assessment.priceNum)}
                      <Button 
                        className="w-full lg:w-auto"
                        onClick={() => handleStartAssessment(assessment)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        {/* My Certificates */}
        <TabsContent value="certificates" className="space-y-4">
          <div className="grid gap-4">
            {earnedCertificates.map((cert) => (
              <Card key={cert.id} className={`${is1040Certificate(cert) ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-l-4 border-l-green-500'}`}>
                <CardContent className="p-6">
                  {is1040Certificate(cert) ? (
                    // Special design for 1040 Certificate
                    <div className="space-y-6">
                      {/* Certificate Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Trophy className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-blue-800 mb-1">{cert.title}</h3>
                            <p className="text-sm text-blue-600 max-w-2xl">
                              {cert.description}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 px-3 py-2 text-lg font-semibold">
                          {cert.level}
                        </Badge>
                      </div>

                      {/* Certificate Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                          <div className="text-3xl font-bold text-green-600 mb-1">{cert.score}%</div>
                          <div className="text-sm text-muted-foreground">Score Achieved</div>
                          <div className="text-xs text-green-600 mt-1">Excellent Performance</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                          <div className="text-lg font-semibold text-blue-600 mb-1">{cert.issueDate}</div>
                          <div className="text-sm text-muted-foreground">Issue Date</div>
                          <div className="text-xs text-blue-600 mt-1">Recently Earned</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                          <div className="text-lg font-semibold text-purple-600 mb-1">{cert.validUntil}</div>
                          <div className="text-sm text-muted-foreground">Valid Until</div>
                          <div className="text-xs text-purple-600 mt-1">2 Years Validity</div>
                        </div>
                      </div>

                      {/* Skills Validated */}
                      <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Skills Validated
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cert.skillsValidated?.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Credential Info */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-muted-foreground">Credential ID</div>
                          <div className="font-mono text-sm font-semibold">{cert.credentialId}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white"
                            onClick={() => handleShowCertificate(cert)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Certificate
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share on LinkedIn
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Standard design for other certificates
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{cert.title}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>Issued: {cert.issueDate}</div>
                            <div>Valid Until: {cert.validUntil}</div>
                            <div>Score: {cert.score}%</div>
                            <div>Credential ID: {cert.credentialId}</div>
                          </div>
                          <Badge className={`mt-2 ${getLevelColor(cert.level)}`}>
                            {cert.level}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="progress" className="space-y-4">
          {inProgressAssessments.length > 0 ? (
            <div className="grid gap-4">
              {inProgressAssessments.map((assessment) => (
                <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-3">{assessment.title}</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{assessment.progress}%</span>
                            </div>
                            <Progress value={assessment.progress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>Questions: {assessment.questionsAnswered}/{assessment.totalQuestions}</div>
                            <div>Time Left: {assessment.timeLeft}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          Save & Exit
                        </Button>
                        <Button
                          onClick={() => {
                            const meta = availableAssessments.find(
                              (a) => a.id === assessment.assessmentId
                            );
                            if (meta) handleStartAssessment(meta);
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments in Progress</h3>
                <p className="text-muted-foreground mb-4">
                  Start an assessment to track your progress here
                </p>
                <Button onClick={() => setActiveTab("available")}>
                  Browse Assessments
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}