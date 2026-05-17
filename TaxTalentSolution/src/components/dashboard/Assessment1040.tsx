import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Award,
  FileText,
  Download,
  Share2,
  Trophy,
  Star
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

interface AssessmentState {
  currentQuestion: number;
  answers: Record<number, number>;
  timeRemaining: number;
  isCompleted: boolean;
  score: number;
  showResults: boolean;
  showCertificate: boolean;
}

const DEMO_1040_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the standard deduction for a single filer in tax year 2023?",
    options: ["$12,950", "$13,850", "$25,900", "$27,700"],
    correctAnswer: 1,
    explanation: "For tax year 2023, the standard deduction for single filers is $13,850.",
    difficulty: "Easy",
    topic: "Standard Deduction"
  },
  {
    id: 2,
    question: "Which form is used to report additional income and adjustments to income?",
    options: ["Schedule A", "Schedule B", "Schedule 1", "Schedule C"],
    correctAnswer: 2,
    explanation: "Schedule 1 is used to report additional income and adjustments to income on Form 1040.",
    difficulty: "Easy",
    topic: "Forms and Schedules"
  },
  {
    id: 3,
    question: "What is the maximum contribution limit for a traditional IRA in 2023 for someone under 50?",
    options: ["$5,500", "$6,000", "$6,500", "$7,000"],
    correctAnswer: 2,
    explanation: "The maximum IRA contribution for 2023 is $6,500 for individuals under age 50.",
    difficulty: "Medium",
    topic: "Retirement Contributions"
  },
  {
    id: 4,
    question: "Which of the following is NOT deductible as a medical expense?",
    options: ["Prescription medications", "Cosmetic surgery for appearance", "Dental treatment", "Eye glasses"],
    correctAnswer: 1,
    explanation: "Cosmetic surgery performed purely for appearance purposes is not deductible as a medical expense.",
    difficulty: "Medium",
    topic: "Medical Deductions"
  },
  {
    id: 5,
    question: "What is the threshold for medical expenses to be deductible as an itemized deduction?",
    options: ["5% of AGI", "7.5% of AGI", "10% of AGI", "2% of AGI"],
    correctAnswer: 1,
    explanation: "Medical expenses are deductible to the extent they exceed 7.5% of your adjusted gross income (AGI).",
    difficulty: "Medium",
    topic: "Medical Deductions"
  },
  {
    id: 6,
    question: "Which filing status generally provides the most favorable tax rates for married couples?",
    options: ["Single", "Married Filing Separately", "Married Filing Jointly", "Head of Household"],
    correctAnswer: 2,
    explanation: "Married Filing Jointly typically provides the most favorable tax rates and largest standard deduction for married couples.",
    difficulty: "Easy",
    topic: "Filing Status"
  },
  {
    id: 7,
    question: "What is the maximum amount of capital losses that can be deducted against ordinary income in a single year?",
    options: ["$1,500", "$3,000", "$5,000", "Unlimited"],
    correctAnswer: 1,
    explanation: "Capital losses can offset capital gains, and up to $3,000 of net capital losses can be deducted against ordinary income annually.",
    difficulty: "Medium",
    topic: "Capital Gains and Losses"
  },
  {
    id: 8,
    question: "Which of the following is required to claim the Child Tax Credit?",
    options: ["Child must be under 17", "Child must be a U.S. citizen", "Valid Social Security Number", "All of the above"],
    correctAnswer: 3,
    explanation: "To claim the Child Tax Credit, the child must be under 17, a U.S. citizen, and have a valid Social Security Number.",
    difficulty: "Medium",
    topic: "Tax Credits"
  },
  {
    id: 9,
    question: "What is the maximum Child Tax Credit amount per qualifying child for 2023?",
    options: ["$2,000", "$2,500", "$3,000", "$3,600"],
    correctAnswer: 0,
    explanation: "The Child Tax Credit is $2,000 per qualifying child for tax year 2023.",
    difficulty: "Easy",
    topic: "Tax Credits"
  },
  {
    id: 10,
    question: "Which form is used to report self-employment income?",
    options: ["Schedule A", "Schedule B", "Schedule C", "Schedule D"],
    correctAnswer: 2,
    explanation: "Schedule C (Profit or Loss from Business) is used to report self-employment income.",
    difficulty: "Easy",
    topic: "Self-Employment"
  },
  {
    id: 11,
    question: "At what rate is self-employment tax calculated?",
    options: ["12.4%", "15.3%", "2.9%", "28%"],
    correctAnswer: 1,
    explanation: "Self-employment tax is calculated at 15.3% (12.4% for Social Security and 2.9% for Medicare).",
    difficulty: "Medium",
    topic: "Self-Employment"
  },
  {
    id: 12,
    question: "What is the income threshold for the Additional Medicare Tax in 2023 for single filers?",
    options: ["$200,000", "$250,000", "$300,000", "$400,000"],
    correctAnswer: 0,
    explanation: "The Additional Medicare Tax of 0.9% applies to income over $200,000 for single filers in 2023.",
    difficulty: "Hard",
    topic: "Medicare Tax"
  },
  {
    id: 13,
    question: "Which of the following is NOT an acceptable method for calculating home office deduction?",
    options: ["Simplified method", "Actual expense method", "Square footage method", "Depreciation method"],
    correctAnswer: 3,
    explanation: "The acceptable methods are the simplified method (up to 300 sq ft at $5/sq ft) and the actual expense method. Depreciation is part of actual expenses, not a separate method.",
    difficulty: "Hard",
    topic: "Home Office Deduction"
  },
  {
    id: 14,
    question: "What is the maximum amount deductible under the simplified home office method?",
    options: ["$1,500", "$2,000", "$2,500", "$3,000"],
    correctAnswer: 0,
    explanation: "The simplified method allows a deduction of $5 per square foot up to 300 square feet, for a maximum of $1,500.",
    difficulty: "Medium",
    topic: "Home Office Deduction"
  },
  {
    id: 15,
    question: "Which of the following education credits has income limits that begin phasing out at lower AGI levels?",
    options: ["American Opportunity Credit", "Lifetime Learning Credit", "Both have the same limits", "Neither has income limits"],
    correctAnswer: 1,
    explanation: "The Lifetime Learning Credit begins phasing out at lower AGI levels compared to the American Opportunity Credit.",
    difficulty: "Hard",
    topic: "Education Credits"
  },
  {
    id: 16,
    question: "What is the maximum American Opportunity Credit per student per year?",
    options: ["$2,000", "$2,500", "$4,000", "$10,000"],
    correctAnswer: 1,
    explanation: "The American Opportunity Credit provides up to $2,500 per eligible student per year.",
    difficulty: "Medium",
    topic: "Education Credits"
  },
  {
    id: 17,
    question: "Which of the following income types is subject to Net Investment Income Tax (NIIT)?",
    options: ["Wages", "Self-employment income", "Dividend income", "Social Security benefits"],
    correctAnswer: 2,
    explanation: "Dividend income is considered investment income and may be subject to the 3.8% Net Investment Income Tax.",
    difficulty: "Hard",
    topic: "Investment Income"
  },
  {
    id: 18,
    question: "What is the AGI threshold for NIIT for single filers in 2023?",
    options: ["$200,000", "$250,000", "$400,000", "$500,000"],
    correctAnswer: 0,
    explanation: "The Net Investment Income Tax applies to single filers with modified AGI over $200,000.",
    difficulty: "Hard",
    topic: "Investment Income"
  },
  {
    id: 19,
    question: "Which schedule is used to report interest and dividend income?",
    options: ["Schedule A", "Schedule B", "Schedule C", "Schedule D"],
    correctAnswer: 1,
    explanation: "Schedule B is used to report interest and dividend income when required.",
    difficulty: "Easy",
    topic: "Investment Income"
  },
  {
    id: 20,
    question: "What is the threshold amount that requires filing Schedule B for interest income?",
    options: ["$1,000", "$1,500", "$2,000", "$2,500"],
    correctAnswer: 1,
    explanation: "Schedule B must be filed if you received more than $1,500 in taxable interest income.",
    difficulty: "Medium",
    topic: "Investment Income"
  },
  {
    id: 21,
    question: "Which of the following is NOT considered earned income for EITC purposes?",
    options: ["Wages", "Self-employment income", "Unemployment compensation", "Tips"],
    correctAnswer: 2,
    explanation: "Unemployment compensation is not considered earned income for Earned Income Tax Credit purposes.",
    difficulty: "Medium",
    topic: "Earned Income Tax Credit"
  },
  {
    id: 22,
    question: "What is the maximum AGI limit for contributing to a Roth IRA in 2023 (single filer)?",
    options: ["$138,000", "$153,000", "$228,000", "$240,000"],
    correctAnswer: 1,
    explanation: "For 2023, Roth IRA contributions phase out completely for single filers with AGI of $153,000 or more.",
    difficulty: "Hard",
    topic: "Retirement Contributions"
  },
  {
    id: 23,
    question: "Which form is used to report the sale of stocks, bonds, and other capital assets?",
    options: ["Schedule A", "Schedule B", "Schedule C", "Schedule D"],
    correctAnswer: 3,
    explanation: "Schedule D (Capital Gains and Losses) is used to report the sale of capital assets.",
    difficulty: "Easy",
    topic: "Capital Gains and Losses"
  },
  {
    id: 24,
    question: "What is the holding period requirement for long-term capital gains treatment?",
    options: ["6 months", "12 months", "More than 1 year", "18 months"],
    correctAnswer: 2,
    explanation: "Assets must be held for more than one year to qualify for long-term capital gains treatment.",
    difficulty: "Easy",
    topic: "Capital Gains and Losses"
  },
  {
    id: 25,
    question: "Which of the following is the highest long-term capital gains tax rate for high-income earners?",
    options: ["15%", "20%", "23.8%", "28%"],
    correctAnswer: 2,
    explanation: "The highest long-term capital gains rate is 20%, plus the 3.8% Net Investment Income Tax for high earners, totaling 23.8%.",
    difficulty: "Hard",
    topic: "Capital Gains and Losses"
  },
  {
    id: 26,
    question: "What is the annual gift tax exclusion amount for 2023?",
    options: ["$15,000", "$16,000", "$17,000", "$18,000"],
    correctAnswer: 2,
    explanation: "The annual gift tax exclusion for 2023 is $17,000 per recipient.",
    difficulty: "Medium",
    topic: "Gift and Estate Tax"
  },
  {
    id: 27,
    question: "Which of the following charitable contributions requires a written acknowledgment from the charity?",
    options: ["$50", "$150", "$250", "$500"],
    correctAnswer: 2,
    explanation: "Written acknowledgment from the charity is required for single contributions of $250 or more.",
    difficulty: "Medium",
    topic: "Charitable Contributions"
  },
  {
    id: 28,
    question: "What is the limit on cash charitable contributions as a percentage of AGI?",
    options: ["30%", "50%", "60%", "100%"],
    correctAnswer: 2,
    explanation: "Cash contributions to public charities are generally limited to 60% of AGI.",
    difficulty: "Medium",
    topic: "Charitable Contributions"
  },
  {
    id: 29,
    question: "Which of the following is NOT deductible as a state and local tax (SALT)?",
    options: ["State income tax", "Property tax", "Sales tax", "Federal income tax"],
    correctAnswer: 3,
    explanation: "Federal income tax is not deductible as a state and local tax. Only state and local taxes are deductible.",
    difficulty: "Easy",
    topic: "State and Local Taxes"
  },
  {
    id: 30,
    question: "What is the maximum SALT deduction limit for 2023?",
    options: ["$5,000", "$10,000", "$15,000", "Unlimited"],
    correctAnswer: 1,
    explanation: "The state and local tax (SALT) deduction is limited to $10,000 for 2023.",
    difficulty: "Easy",
    topic: "State and Local Taxes"
  },
  {
    id: 31,
    question: "Which penalty applies for early withdrawal from a traditional IRA before age 59½?",
    options: ["5%", "10%", "15%", "20%"],
    correctAnswer: 1,
    explanation: "Early withdrawals from traditional IRAs before age 59½ are subject to a 10% penalty, with certain exceptions.",
    difficulty: "Medium",
    topic: "Retirement Distributions"
  },
  {
    id: 32,
    question: "At what age must you begin taking Required Minimum Distributions (RMDs) from traditional IRAs?",
    options: ["70½", "72", "73", "75"],
    correctAnswer: 2,
    explanation: "Starting in 2023, RMDs from traditional IRAs must begin by age 73.",
    difficulty: "Medium",
    topic: "Retirement Distributions"
  },
  {
    id: 33,
    question: "Which of the following is NOT a requirement for Head of Household filing status?",
    options: ["Unmarried on last day of year", "Pay more than half the household costs", "Qualifying person lives with you", "Have earned income"],
    correctAnswer: 3,
    explanation: "Having earned income is not a specific requirement for Head of Household status.",
    difficulty: "Medium",
    topic: "Filing Status"
  },
  {
    id: 34,
    question: "What is the maximum Earned Income Tax Credit for a taxpayer with three or more qualifying children in 2023?",
    options: ["$6,604", "$6,935", "$7,430", "$8,000"],
    correctAnswer: 2,
    explanation: "The maximum EITC for taxpayers with three or more qualifying children is $7,430 in 2023.",
    difficulty: "Hard",
    topic: "Earned Income Tax Credit"
  },
  {
    id: 35,
    question: "Which form is used to compute the taxable amount of Social Security benefits?",
    options: ["Form 1040", "Schedule 1", "Worksheet in instructions", "Form 8812"],
    correctAnswer: 2,
    explanation: "The taxable amount of Social Security benefits is calculated using the worksheet in the Form 1040 instructions.",
    difficulty: "Medium",
    topic: "Social Security Benefits"
  },
  {
    id: 36,
    question: "What percentage of Social Security benefits may be taxable for high-income earners?",
    options: ["50%", "75%", "85%", "100%"],
    correctAnswer: 2,
    explanation: "Up to 85% of Social Security benefits may be taxable for high-income earners.",
    difficulty: "Medium",
    topic: "Social Security Benefits"
  },
  {
    id: 37,
    question: "Which of the following is considered a tax-free fringe benefit?",
    options: ["Company car for personal use", "Health insurance premiums paid by employer", "Cash bonuses", "Stock options"],
    correctAnswer: 1,
    explanation: "Health insurance premiums paid by the employer are generally a tax-free fringe benefit.",
    difficulty: "Medium",
    topic: "Fringe Benefits"
  },
  {
    id: 38,
    question: "What is the annual contribution limit for HSAs in 2023 for self-only coverage?",
    options: ["$3,650", "$4,300", "$7,750", "$8,550"],
    correctAnswer: 0,
    explanation: "The HSA contribution limit for self-only coverage in 2023 is $3,650.",
    difficulty: "Medium",
    topic: "Health Savings Accounts"
  },
  {
    id: 39,
    question: "Which of the following is NOT a qualified HSA expense?",
    options: ["Prescription medications", "Dental care", "Over-the-counter vitamins", "Mental health counseling"],
    correctAnswer: 2,
    explanation: "Over-the-counter vitamins are generally not qualified HSA expenses unless prescribed by a doctor.",
    difficulty: "Hard",
    topic: "Health Savings Accounts"
  },
  {
    id: 40,
    question: "What is the deadline for making prior-year IRA contributions?",
    options: ["December 31", "January 31", "Tax filing deadline", "April 15"],
    correctAnswer: 2,
    explanation: "Prior-year IRA contributions can be made up to the tax filing deadline (typically April 15).",
    difficulty: "Easy",
    topic: "Retirement Contributions"
  },
  {
    id: 41,
    question: "Which form is used to report foreign bank accounts with aggregate values over $10,000?",
    options: ["Form 8938", "FBAR (FinCEN 114)", "Form 3520", "Schedule B"],
    correctAnswer: 1,
    explanation: "FBAR (FinCEN Form 114) must be filed for foreign bank accounts with aggregate values over $10,000.",
    difficulty: "Hard",
    topic: "Foreign Accounts"
  },
  {
    id: 42,
    question: "What is the threshold for Form 8938 (FATCA) filing for unmarried taxpayers living in the US?",
    options: ["$50,000", "$75,000", "$200,000", "$300,000"],
    correctAnswer: 0,
    explanation: "Form 8938 must be filed by unmarried US residents if foreign assets exceed $50,000 at year-end or $75,000 at any time during the year.",
    difficulty: "Hard",
    topic: "Foreign Accounts"
  },
  {
    id: 43,
    question: "Which of the following modifications increases AGI for traditional IRA deductibility purposes?",
    options: ["IRA deduction", "Student loan interest", "Tuition and fees", "IRA contribution"],
    correctAnswer: 3,
    explanation: "For IRA deductibility purposes, AGI is calculated before the IRA deduction, so the IRA contribution effectively increases the AGI used for the calculation.",
    difficulty: "Hard",
    topic: "Retirement Contributions"
  },
  {
    id: 44,
    question: "What is the minimum distribution penalty for failing to take required RMDs?",
    options: ["10%", "25%", "50%", "100%"],
    correctAnswer: 1,
    explanation: "The penalty for failing to take required minimum distributions is 25% of the amount that should have been distributed (reduced from 50% in recent years).",
    difficulty: "Hard",
    topic: "Retirement Distributions"
  },
  {
    id: 45,
    question: "Which of the following is required to be reported on Form 1099-MISC?",
    options: ["Wages over $600", "Non-employee compensation over $600", "Interest over $600", "Dividends over $600"],
    correctAnswer: 1,
    explanation: "Non-employee compensation (payments to independent contractors) over $600 must be reported on Form 1099-MISC.",
    difficulty: "Medium",
    topic: "Information Returns"
  },
  {
    id: 46,
    question: "What is the penalty for filing Form 1040 late without reasonable cause?",
    options: ["5% per month", "0.5% per month", "25% maximum", "Both A and C"],
    correctAnswer: 3,
    explanation: "The failure-to-file penalty is 5% per month (or part of month) up to a maximum of 25% of unpaid taxes.",
    difficulty: "Medium",
    topic: "Penalties and Interest"
  },
  {
    id: 47,
    question: "Which safe harbor rule protects taxpayers from underpayment penalties?",
    options: ["Pay 90% of current year tax", "Pay 100% of prior year tax", "Pay 110% of prior year tax if AGI > $150,000", "All of the above"],
    correctAnswer: 3,
    explanation: "All three options are safe harbor rules: 90% of current year, 100% of prior year (110% if prior year AGI > $150,000).",
    difficulty: "Hard",
    topic: "Estimated Tax Payments"
  },
  {
    id: 48,
    question: "What is the de minimis threshold for underpayment penalties?",
    options: ["$500", "$1,000", "$1,500", "$2,000"],
    correctAnswer: 1,
    explanation: "No underpayment penalty is imposed if the total tax due is less than $1,000.",
    difficulty: "Medium",
    topic: "Estimated Tax Payments"
  },
  {
    id: 49,
    question: "Which of the following best describes the 'kiddie tax' rules?",
    options: ["Tax on child's earned income", "Tax on child's unearned income over threshold", "Tax on gifts to children", "Tax on child support payments"],
    correctAnswer: 1,
    explanation: "The 'kiddie tax' applies to a child's unearned income over a certain threshold, taxed at the parent's rates.",
    difficulty: "Hard",
    topic: "Kiddie Tax"
  },
  {
    id: 50,
    question: "What is the threshold amount for kiddie tax in 2023?",
    options: ["$1,150", "$2,300", "$2,500", "$2,750"],
    correctAnswer: 1,
    explanation: "For 2023, the kiddie tax applies to unearned income over $2,300 for children subject to the rules.",
    difficulty: "Hard",
    topic: "Kiddie Tax"
  }
];

export function Assessment1040({
  onBack,
  onComplete,
  assessmentTitle,
  examQuestions,
  durationMinutes,
}: {
  onBack: () => void;
  onComplete?: (score: number) => void;
  assessmentTitle?: string;
  examQuestions?: Question[];
  durationMinutes?: number;
}) {
  const questionBank = examQuestions?.length ? examQuestions : DEMO_1040_QUESTIONS;
  const durationSeconds = (durationMinutes ?? 45) * 60;
  const displayTitle = assessmentTitle || "1040 Individual Tax Returns Assessment";

  const [assessment, setAssessment] = useState<AssessmentState>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: durationSeconds,
    isCompleted: false,
    score: 0,
    showResults: false,
    showCertificate: false
  });

  useEffect(() => {
    setAssessment({
      currentQuestion: 0,
      answers: {},
      timeRemaining: durationSeconds,
      isCompleted: false,
      score: 0,
      showResults: false,
      showCertificate: false,
    });
  }, [examQuestions, durationMinutes, durationSeconds]);

  // Timer effect
  useEffect(() => {
    if (assessment.timeRemaining > 0 && !assessment.isCompleted) {
      const timer = setTimeout(() => {
        setAssessment(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (assessment.timeRemaining === 0 && !assessment.isCompleted) {
      handleCompleteAssessment();
    }
  }, [assessment.timeRemaining, assessment.isCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestion]: answerIndex
      }
    }));
  };

  const handleNextQuestion = () => {
    if (assessment.currentQuestion < questionBank.length - 1) {
      setAssessment(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (assessment.currentQuestion > 0) {
      setAssessment(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    }
  };

  const handleCompleteAssessment = () => {
    const correctAnswers = questionBank.reduce((count, question, index) => {
      return assessment.answers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const scorePercentage = Math.round((correctAnswers / questionBank.length) * 100);
    
    setAssessment(prev => ({
      ...prev,
      isCompleted: true,
      score: scorePercentage,
      showResults: true
    }));
    onComplete?.(scorePercentage);
  };

  const handleShowCertificate = () => {
    setAssessment(prev => ({
      ...prev,
      showCertificate: true
    }));
  };

  const currentQuestion = questionBank[assessment.currentQuestion];
  const progress = ((assessment.currentQuestion + 1) / questionBank.length) * 100;
  const answeredQuestions = Object.keys(assessment.answers).length;

  if (assessment.showCertificate) {
    return (
      <div className="space-y-6">
        {/* Certificate Display */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 text-center border-8 border-blue-200 rounded-lg">
              <div className="mb-8">
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
                <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
              </div>
              
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
                <p className="text-4xl font-bold text-blue-700 mb-4">John Doe</p>
                <p className="text-lg text-gray-600 mb-2">has successfully completed the</p>
                <p className="text-2xl font-semibold text-gray-800 mb-6">{displayTitle}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{assessment.score}%</div>
                  <div className="text-sm text-gray-600">Score Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{questionBank.length}</div>
                  <div className="text-sm text-gray-600">Questions Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Expert</div>
                  <div className="text-sm text-gray-600">Certification Level</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date of Completion:</p>
                  <p className="font-semibold">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Certificate ID:</p>
                  <p className="font-semibold">TT-1040-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valid Until:</p>
                  <p className="font-semibold">{new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Issued by:</p>
                  <p className="font-semibold">TaxTalent Assessment Center</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline" onClick={() => {/* Share functionality */}}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Assessments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assessment.showResults) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <CheckCircle className="w-8 h-8 text-green-500" />
              Assessment Completed!
            </CardTitle>
            <p className="text-muted-foreground">
              {displayTitle} Results
            </p>
          </CardHeader>
        </Card>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{assessment.score}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <Badge className={`mt-2 ${assessment.score >= 80 ? 'bg-green-100 text-green-800' : assessment.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {assessment.score >= 80 ? 'Excellent' : assessment.score >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{Object.keys(assessment.answers).filter(key => assessment.answers[parseInt(key)] === questionBank[parseInt(key)].correctAnswer).length}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
              <div className="text-xs text-muted-foreground mt-1">out of {questionBank.length} questions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{formatTime(durationSeconds - assessment.timeRemaining)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
              <div className="text-xs text-muted-foreground mt-1">out of {formatTime(durationSeconds)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionBank.map((question, index) => {
              const userAnswer = assessment.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Question {index + 1}
                      </Badge>
                      <Badge className={`text-xs ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">{question.question}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = userAnswer === optionIndex;
                      const isCorrectAnswer = question.correctAnswer === optionIndex;
                      
                      return (
                        <div key={optionIndex} className={`p-2 rounded text-sm ${
                          isCorrectAnswer 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : isUserAnswer 
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-50 text-gray-600'
                        }`}>
                          {option}
                          {isCorrectAnswer && <CheckCircle className="w-4 h-4 inline ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {assessment.score >= 70 && (
            <Button onClick={handleShowCertificate} className="bg-green-600 hover:bg-green-700">
              <Award className="w-4 h-4 mr-2" />
              Get Certificate
            </Button>
          )}
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {displayTitle}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Question {assessment.currentQuestion + 1} of {questionBank.length}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                {formatTime(assessment.timeRemaining)}
              </div>
              <Badge variant="outline">
                {answeredQuestions}/{questionBank.length} answered
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${
              currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.topic}
            </Badge>
          </div>
          <CardTitle className="text-lg">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={assessment.answers[assessment.currentQuestion]?.toString() || ""} 
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={assessment.currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {assessment.currentQuestion === questionBank.length - 1 ? (
            <Button 
              onClick={handleCompleteAssessment}
              className="bg-green-600 hover:bg-green-700"
              disabled={answeredQuestions < questionBank.length}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Assessment
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              disabled={assessment.currentQuestion === questionBank.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questionBank.map((_, index) => (
              <Button
                key={index}
                variant={assessment.currentQuestion === index ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 p-0 ${
                  assessment.answers[index] !== undefined 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : ''
                }`}
                onClick={() => setAssessment(prev => ({ ...prev, currentQuestion: index }))}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}