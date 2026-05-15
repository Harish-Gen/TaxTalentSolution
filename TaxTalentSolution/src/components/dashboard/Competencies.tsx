import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CheckCircle, Briefcase, Percent, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { competencyService } from "../../api/competencyService";

type SkillLevel = "basic" | "intermediate" | "expert" | "not-applicable" | "";

interface SkillRatings {
  [key: string]: SkillLevel;
}

interface RoleEntry {
  id: string;
  responsibility: string;
  percentage: string;
}

interface CompetenciesProps {
  user?: any;
}

export function Competencies({ user }: CompetenciesProps) {
  const userId = user?.id ?? 'guest';
  const STORE_KEY = `tts_competencies_${userId}`;

  const [skillRatings, setSkillRatings] = useState<SkillRatings>({});
  const [whyHireMe, setWhyHireMe] = useState("");
  const [roleEntries, setRoleEntries] = useState<RoleEntry[]>([
    { id: `role-${Date.now()}`, responsibility: "", percentage: "" }
  ]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [recordId, setRecordId] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load persisted competencies on mount
  useEffect(() => {
    const fetchCompetencies = async () => {
      const storedUserId = sessionStorage.getItem('userId');
      const targetUserId = storedUserId || userId;
      
      if (!targetUserId || targetUserId === 'guest') {
        setIsInitialLoading(false);
        return;
      }

      try {
        const data = await competencyService.getCompetencies(targetUserId);
        
        // Handle array responses by taking the latest record (sorted by savedAt or createdon)
        let result = null;
        if (Array.isArray(data) && data.length > 0) {
          result = [...data].sort((a, b) => {
            const dateA = new Date(a.competenciesjson?.savedAt || a.createdon || 0).getTime();
            const dateB = new Date(b.competenciesjson?.savedAt || b.createdon || 0).getTime();
            return dateB - dateA; // Descending
          })[0];
        } else {
          result = data;
        }
        
        if (result) {
          if (result.id) setRecordId(result.id);
          
          if (result.competenciesjson) {
            const saved = typeof result.competenciesjson === 'string' 
              ? JSON.parse(result.competenciesjson) 
              : result.competenciesjson;
              
            if (saved.skillRatings) setSkillRatings(saved.skillRatings);
            if (saved.whyHireMe !== undefined) setWhyHireMe(saved.whyHireMe);
            if (saved.roleEntries?.length) {
              setRoleEntries(saved.roleEntries);
            } else if (saved.roleDistribution) {
              const entries = Object.entries(saved.roleDistribution).map(([resp, perc]) => ({
                id: `role-${Math.random().toString(36).substr(2, 9)}`,
                responsibility: resp,
                percentage: String(perc)
              }));
              if (entries.length) setRoleEntries(entries);
            }
            if (saved.customSkills?.length) setCustomSkills(saved.customSkills);
            if (saved.savedAt) setLastSavedAt(new Date(saved.savedAt));
          }
        }
      } catch (err) {
        console.error("Failed to load competencies from backend:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchCompetencies();
  }, [userId]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const skills = [
    "1040HNI",
    "1040GMS", 
    "1040 COE",
    "1120 Federal",
    "1120 State",
    "1065 Federal",
    "1065 State",
    "1120S",
    "1065 Operating Partnership",
    "990"
  ];

  const responsibilities = [
    "Preparation",
    "First Level Review",
    "Second Level Review",
    "Managing Teams",
    "Client Management",
    "Strategy Meetings",
    "Other"
  ];

  const skillLevels = [
    { value: "basic", label: "Basic" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
    { value: "not-applicable", label: "Not Applicable" }
  ];

  const handleSkillRating = (skill: string, level: SkillLevel) => {
    setSkillRatings(prev => ({
      ...prev,
      [skill]: level
    }));
    setIsSaved(false);
  };

  const addCustomSkill = () => {
    const trimmedSkill = newSkillInput.trim();
    if (!trimmedSkill) {
      toast.error("Please enter a skill name");
      return;
    }
    if (skills.includes(trimmedSkill) || customSkills.includes(trimmedSkill)) {
      toast.error("This skill already exists");
      return;
    }
    setCustomSkills(prev => [...prev, trimmedSkill]);
    setNewSkillInput("");
    setIsSaved(false);
    toast.success("Skill added successfully");
  };

  const removeCustomSkill = (skillToRemove: string) => {
    setCustomSkills(prev => prev.filter(skill => skill !== skillToRemove));
    setSkillRatings(prev => {
      const updated = { ...prev };
      delete updated[skillToRemove];
      return updated;
    });
    setIsSaved(false);
    toast.success("Skill removed");
  };

  const addRoleEntry = () => {
    const newEntry: RoleEntry = {
      id: `role-${Date.now()}`,
      responsibility: "",
      percentage: ""
    };
    setRoleEntries(prev => [...prev, newEntry]);
    setIsSaved(false);
  };

  const removeRoleEntry = (id: string) => {
    if (roleEntries.length === 1) {
      toast.error("At least one responsibility entry is required");
      return;
    }
    setRoleEntries(prev => prev.filter(entry => entry.id !== id));
    setIsSaved(false);
  };

  const updateRoleEntry = (id: string, field: 'responsibility' | 'percentage', value: string) => {
    setRoleEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        if (field === 'percentage') {
          const numValue = value.replace(/\D/g, '');
          if (numValue === '' || (parseInt(numValue) >= 0 && parseInt(numValue) <= 100)) {
            return { ...entry, [field]: numValue };
          }
          return entry;
        }
        return { ...entry, [field]: value };
      }
      return entry;
    }));
    setIsSaved(false);
  };

  const calculateTotalPercentage = () => {
    return roleEntries.reduce((sum, entry) => {
      return sum + (parseInt(entry.percentage) || 0);
    }, 0);
  };

  const getAvailableResponsibilities = (currentId: string) => {
    const selectedResponsibilities = roleEntries
      .filter(entry => entry.id !== currentId && entry.responsibility)
      .map(entry => entry.responsibility);
    return responsibilities.filter(r => !selectedResponsibilities.includes(r));
  };

  const validateForm = () => {
    const allSkills = [...skills, ...customSkills];
    const unratedSkills = allSkills.filter(skill => !skillRatings[skill]);
    if (unratedSkills.length > 0) {
      toast.error(`Please rate your proficiency in all skills. Missing: ${unratedSkills[0]}`);
      return false;
    }

    if (!whyHireMe.trim()) {
      toast.error("Please tell us why we should hire you");
      return false;
    }

    if (whyHireMe.trim().length < 50) {
      toast.error("Please provide a more detailed response (at least 50 characters)");
      return false;
    }

    if (roleEntries.length === 0) {
      toast.error("Please add at least one responsibility");
      return false;
    }

    const incompleteEntries = roleEntries.filter(entry => !entry.responsibility || !entry.percentage);
    if (incompleteEntries.length > 0) {
      toast.error("Please complete all responsibility entries");
      return false;
    }

    const totalPercentage = calculateTotalPercentage();
    if (totalPercentage !== 100) {
      toast.error(`Role distribution must total 100%. Current total: ${totalPercentage}%`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    
    try {
      const storedUserId = sessionStorage.getItem('userId');
      const targetUserId = storedUserId || userId;

      if (!targetUserId || targetUserId === 'guest') {
        toast.error("User session not found. Please log in again.");
        setIsSaving(false);
        return;
      }

      const competencyData = {
        skillRatings,
        whyHireMe,
        roleEntries,
        customSkills,
        roleDistribution: roleEntries.reduce((acc, entry) => {
          acc[entry.responsibility] = entry.percentage;
          return acc;
        }, {} as { [key: string]: string }),
        savedAt: new Date().toISOString()
      };
      
      const response = await competencyService.upsertCompetencies({
        id: recordId || undefined,
        userid: targetUserId,
        competenciesjson: competencyData,
        isactive: true
      });

      if (response && response.id) {
        setRecordId(response.id);
      }

      const savedTime = new Date();
      setLastSavedAt(savedTime);
      setIsSaved(true);
      toast.success("Competencies saved successfully to profile!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save competencies. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isInitialLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-xl shadow-xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading your competencies...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Competencies</CardTitle>
          <p className="text-muted-foreground">
            Maintain your skill ratings, professional strengths, and role distribution
          </p>
        </CardHeader>
      </Card>

      {/* Skillset Survey */}
      <Card>
        <CardHeader>
          <CardTitle>Skillset Survey</CardTitle>
          <p className="text-muted-foreground">
            Please rate your proficiency level in the following tax preparation areas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {skills.map((skill, index) => (
            <div key={skill} className="space-y-3">
              <Label className="text-base">{skill} *</Label>
              <RadioGroup
                value={skillRatings[skill] || ""}
                onValueChange={(value) => handleSkillRating(skill, value as SkillLevel)}
                className="flex flex-wrap gap-4"
              >
                {skillLevels.map((level) => (
                  <div 
                    key={level.value} 
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${skillRatings[skill] === level.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                    onClick={() => handleSkillRating(skill, level.value as SkillLevel)}
                  >
                    <RadioGroupItem 
                      value={level.value} 
                      id={`${skill}-${level.value}`}
                      className="w-5 h-5"
                    />
                    <Label 
                      htmlFor={`${skill}-${level.value}`} 
                      className="cursor-pointer select-none text-sm font-medium"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {index < skills.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          {/* Custom Skills */}
          {customSkills.map((skill, index) => (
            <div key={`custom-${skill}`} className="space-y-3">
              <Separator className="mt-4" />
              <div className="flex items-center justify-between">
                <Label className="text-base">{skill} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomSkill(skill)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <RadioGroup
                value={skillRatings[skill] || ""}
                onValueChange={(value) => handleSkillRating(skill, value as SkillLevel)}
                className="flex flex-wrap gap-4"
              >
                {skillLevels.map((level) => (
                  <div 
                    key={level.value} 
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${skillRatings[skill] === level.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                    onClick={() => handleSkillRating(skill, level.value as SkillLevel)}
                  >
                    <RadioGroupItem 
                      value={level.value} 
                      id={`${skill}-${level.value}`}
                      className="w-5 h-5"
                    />
                    <Label 
                      htmlFor={`${skill}-${level.value}`} 
                      className="cursor-pointer select-none text-sm font-medium"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          {/* Add Custom Skill */}
          <div className="space-y-3 pt-4">
            <Separator />
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <Label htmlFor="new-skill" className="text-base">Add Custom Skill</Label>
              <div className="flex gap-2">
                <input
                  id="new-skill"
                  type="text"
                  placeholder="Enter skill name (e.g., Estate Planning, FBAR Filing)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="button"
                  onClick={addCustomSkill}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add any additional tax-related skills you want to highlight
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tell us about yourself */}
      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
          <p className="text-muted-foreground">
            Share your professional background and experience
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="why-hire">Your Response *</Label>
            <Textarea
              id="why-hire"
              placeholder="Describe your relevant experience, unique skills, achievements, and what value you would bring..."
              value={whyHireMe}
              onChange={(e) => {
                setWhyHireMe(e.target.value);
                setIsSaved(false);
              }}
              className="min-h-32 resize-none"
              rows={6}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 50 characters required</span>
              <span>{whyHireMe.length} characters</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Role Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Your Role Distribution
          </CardTitle>
          <p className="text-muted-foreground">
            How is your time typically distributed among your core responsibilities?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {roleEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`responsibility-${entry.id}`}>
                      Responsibility *
                    </Label>
                    <Select
                      value={entry.responsibility}
                      onValueChange={(value) => updateRoleEntry(entry.id, 'responsibility', value)}
                    >
                      <SelectTrigger id={`responsibility-${entry.id}`}>
                        <SelectValue placeholder="Select responsibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableResponsibilities(entry.id).map((resp) => (
                          <SelectItem key={resp} value={resp}>
                            {resp}
                          </SelectItem>
                        ))}
                        {entry.responsibility && !getAvailableResponsibilities(entry.id).includes(entry.responsibility) && (
                          <SelectItem value={entry.responsibility}>
                            {entry.responsibility}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`percentage-${entry.id}`}>
                      Percentage *
                    </Label>
                    <div className="relative">
                      <input
                        id={`percentage-${entry.id}`}
                        type="text"
                        placeholder="0"
                        value={entry.percentage}
                        onChange={(e) => updateRoleEntry(entry.id, 'percentage', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8 text-right"
                        maxLength={3}
                      />
                      <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {roleEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoleEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive mt-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addRoleEntry}
              className="w-full"
              disabled={roleEntries.length >= responsibilities.length}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Responsibility
            </Button>

            {roleEntries.length >= responsibilities.length && (
              <p className="text-sm text-muted-foreground text-center">
                All available responsibilities have been added
              </p>
            )}
          </div>

          {roleEntries.length > 0 && (
            <>
              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-base">Total Percentage</span>
                <div className={`text-xl flex items-center gap-2 ${
                  calculateTotalPercentage() === 100 
                    ? 'text-green-600' 
                    : calculateTotalPercentage() > 100 
                      ? 'text-red-600' 
                      : 'text-muted-foreground'
                }`}>
                  <span>{calculateTotalPercentage()}</span>
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              {calculateTotalPercentage() !== 100 && calculateTotalPercentage() > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Your total must equal 100%. {calculateTotalPercentage() < 100 
                    ? `You need to add ${100 - calculateTotalPercentage()}% more.` 
                    : `You need to reduce by ${calculateTotalPercentage() - 100}%.`}
                </div>
              )}

              {calculateTotalPercentage() === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Perfect! Your role distribution totals 100%
                </div>
              )}
            </>
          )}

          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm text-blue-900">💡 Tips for Role Distribution:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Click "Add Responsibility" to add your core responsibilities</li>
              <li>• Be honest about how you currently spend your time</li>
              <li>• Consider a typical work week or month</li>
              <li>• Total must equal exactly 100%</li>
              <li>• Use "Other" for tasks that don't fit the listed categories</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="mb-2">Before you save:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Double-check your skill ratings for accuracy</li>
                <li>• Review your response to make sure it highlights your strengths</li>
                <li>• Confirm your role distribution totals exactly 100%</li>
                <li>• Make sure all required fields are completed</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Competencies
                  </>
                )}
              </Button>
              
              <div className="flex flex-col gap-1">
                {isSaved && (
                  <span className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
                {lastSavedAt && (
                  <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                    Last updated: {lastSavedAt.toLocaleDateString()} at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
