import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Award,
  Star,
  Filter,
  X,
  Eye,
  UserPlus,
  DollarSign,
  Clock,
  Loader2,
  Mail,
  Phone
} from "lucide-react";
import { useCandidates, useCandidateCertificates, candidateSkills } from "../../database";
import { candidateService } from "../../api/candidateService";

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: number;
  skills: string[];
  assessmentScore: number;
  availability: string;
  hourlyRate: number;
  rating: number;
  profileViews: number;
  certifications: string[];
  summary: string;
}

interface TalentSearchProps {
  onViewProfile: (candidateId: number) => void;
}

export function TalentSearch({ onViewProfile }: TalentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceRange, setExperienceRange] = useState([0, 15]);
  const [minScore, setMinScore] = useState([0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  
  // Profile Popup State
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (selectedProfileId) {
      setLoadingProfile(true);
      candidateService.getCandidateById(selectedProfileId)
        .then(data => setProfileData(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingProfile(false));
    } else {
      setProfileData(null);
    }
  }, [selectedProfileId]);
  
  // Fetch from local database
  const { candidates: dbCandidates, loading: candidatesLoading } = useCandidates();
  
  const loading = candidatesLoading;
  
  // Transform database candidates to component format
  const mappedCandidates: Candidate[] = useMemo(() => {
    return dbCandidates
      .map(candidate => {
        const candidateData = candidate as any;
        const skills = candidateSkills
          .filter(s => s.candidate_id === candidate.id)
          .map(s => s.skill_name);
        
        return {
          id: candidate.id,
          name: candidateData.name || 'Unknown',
          title: candidate.headline || 'Tax Professional',
          location: `${candidate.location_city || ''}${candidate.location_state ? `, ${candidate.location_state}` : ''}`.trim() || 'Remote',
          experience: candidate.experience_years || 0,
          skills: skills.length > 0 ? skills : candidateData.taxexpertise || [],
          assessmentScore: Math.round((candidate.rating || 0) * 20), // Convert 5-star to 100 scale
          availability: candidate.availability === 'immediate' ? 'Immediate' : 
                       candidate.availability === '2_weeks' ? '2 weeks' : 
                       candidate.availability === '1_month' ? '1 month' : 'Immediate',
          hourlyRate: candidate.hourly_rate || 2000,
          rating: candidate.rating || 0,
          profileViews: candidate.profile_views || 0,
          certifications: [], // Will be populated from certificates
          summary: candidate.summary || ''
        };
      });
  }, [dbCandidates]);

  const allSkills = [
    "Form 1040",
    "Form 1065",
    "Form 1120",
    "S Corp",
    "Private Equity",
    "Operating Partnership",
    "Schedule C",
    "K-1 Reporting",
    "Tax Planning"
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredCandidates = mappedCandidates.filter(candidate => {
    const matchesSearch = searchQuery === "" || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExperience = candidate.experience >= experienceRange[0] && 
      candidate.experience <= experienceRange[1];
    
    const matchesScore = candidate.assessmentScore >= minScore[0];
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => candidate.skills.includes(skill));

    return matchesSearch && matchesExperience && matchesScore && matchesSkills;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setExperienceRange([0, 15]);
    setMinScore([0]);
    setSelectedSkills([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading candidates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl">Search Tax Talent</h3>
          <p className="text-sm text-muted-foreground">
            Find the perfect candidate for your team
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{filteredCandidates.length} candidates found</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label>Keyword Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Skills, name, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Experience Range */}
              <div className="space-y-3">
                <Label>Experience (Years)</Label>
                <div className="pt-2">
                  <Slider
                    value={experienceRange}
                    onValueChange={setExperienceRange}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{experienceRange[0]} yrs</span>
                    <span>{experienceRange[1]} yrs</span>
                  </div>
                </div>
              </div>

              {/* Assessment Score */}
              <div className="space-y-3">
                <Label>Minimum Assessment Score</Label>
                <div className="pt-2">
                  <Slider
                    value={minScore}
                    onValueChange={setMinScore}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{minScore[0]}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Skills Filter */}
              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="space-y-2">
                  {allSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <label
                        htmlFor={skill}
                        className="text-sm cursor-pointer"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidate Results */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No candidates match your criteria</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="mb-1">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.title}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{candidate.rating}</span>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {candidate.summary}
                        </p>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{candidate.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{candidate.experience} years</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Score: {candidate.assessmentScore}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">₹{candidate.hourlyRate.toLocaleString()}/hr</span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {candidate.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 5 && (
                            <Badge variant="outline">+{candidate.skills.length - 5} more</Badge>
                          )}
                        </div>

                        {/* Certifications & Availability */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-green-600" />
                            <span>{candidate.certifications.length} Certifications</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>Available: {candidate.availability}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.profileViews} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col space-y-2">
                        <Button onClick={() => setSelectedProfileId(candidate.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Shortlist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      <Dialog open={!!selectedProfileId} onOpenChange={(open) => !open && setSelectedProfileId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Profile Details</DialogTitle>
          </DialogHeader>
          
          {loadingProfile ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : profileData ? (
            <div className="space-y-6 mt-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl">
                  {profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{profileData.name || 'Unknown'}</h2>
                  <p className="text-muted-foreground">{profileData.headline || 'Tax Professional'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{`${profileData.location_city || ''} ${profileData.location_state || ''}`.trim() || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.experience_years || 0} years experience</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>₹{profileData.hourly_rate || 0}/hr</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{profileData.availability?.replace('_', ' ') || 'Immediate'}</span>
                </div>
              </div>

              {profileData.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{profileData.summary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Failed to load profile details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
