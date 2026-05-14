import { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Assessment1040 } from "./Assessment1040";
import { Certificate1040 } from "./Certificate1040";
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
import { useAssessments, useCertificates } from "../../database";
import { getSubscription } from "../../database/userStore";
import type { CandidatePlan } from "../../database/types";

interface AssessmentCertificatesProps {
  user?: any;
}

export function AssessmentCertificates({ user }: AssessmentCertificatesProps) {
  const [activeTab, setActiveTab] = useState("available");
  const [currentAssessment, setCurrentAssessment] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);
  const [plan, setPlan] = useState<CandidatePlan>("free");
  
  // Fetch from database
  const { assessments: dbAssessments, loading: assessmentsLoading } = useAssessments();
  const { certificates: dbCertificates, loading: certificatesLoading } = useCertificates();
  
  const loading = assessmentsLoading || certificatesLoading;

  useEffect(() => {
    if (user?.id) {
      const sub = getSubscription(user.id);
      setPlan(sub.plan);
    }
  }, [user?.id]);

  // Transform database data
  const availableAssessments = useMemo(() => {
    return dbAssessments.map(a => ({
      id: parseInt(a.id.split('-').pop() || '0'),
      title: a.title,
      description: a.description || '',
      duration: `${a.duration_minutes || 45} minutes`,
      questions: a.question_count || 50,
      difficulty: a.difficulty === 'beginner' ? 'Beginner' : 
                  a.difficulty === 'intermediate' ? 'Intermediate' : 
                  a.difficulty === 'advanced' ? 'Advanced' : 'Intermediate',
      price: `₹${a.price || 299}`,
      priceNum: a.price || 299,
      skills: a.skills_validated || [],
      rating: a.rating || 4.5,
      completedBy: a.total_attempts || 0
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
    return dbCertificates.map(c => ({
      id: parseInt(c.id.split('-').pop() || '0'),
      title: c.title,
      issueDate: c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
      score: c.score || 0,
      validUntil: c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
      credentialId: c.credential_id || '',
      level: c.level === 'expert' ? 'Expert' : 
             c.level === 'specialist' ? 'Specialist' : 'Professional',
      skillsValidated: c.skills_validated || []
    }));
  }, [dbCertificates]);

  const inProgressAssessments = [
    {
      id: 1,
      title: "1065 Partnership Returns",
      progress: 60,
      timeLeft: "25 minutes",
      questionsAnswered: 30,
      totalQuestions: 75
    }
  ];

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

  const handleStartAssessment = (assessmentId: number) => {
    if (assessmentId === 1) {
      setCurrentAssessment("1040");
    } else {
      // Handle other assessments
      alert("This assessment will be available soon!");
    }
  };

  const handleBackToAssessments = () => {
    setCurrentAssessment(null);
  };

  const handleShowCertificate = (certificateId: string) => {
    setShowCertificate(certificateId);
  };

  const handleBackToCertificates = () => {
    setShowCertificate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading assessments...</span>
      </div>
    );
  }

  if (currentAssessment === "1040") {
    return <Assessment1040 onBack={handleBackToAssessments} />;
  }

  if (showCertificate === "1040") {
    return <Certificate1040 onBack={handleBackToCertificates} />;
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
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Certificates Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">89.0%</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">Top 5%</div>
            <div className="text-sm text-muted-foreground">Global Ranking</div>
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
                        onClick={() => handleStartAssessment(assessment.id)}
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
        </TabsContent>

        {/* My Certificates */}
        <TabsContent value="certificates" className="space-y-4">
          <div className="grid gap-4">
            {earnedCertificates.map((cert) => (
              <Card key={cert.id} className={`${cert.id === 1 ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-l-4 border-l-green-500'}`}>
                <CardContent className="p-6">
                  {cert.id === 1 ? (
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
                            onClick={() => handleShowCertificate("1040")}
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
                        <Button>
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