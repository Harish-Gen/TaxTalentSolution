import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building,
  Search,
  Filter,
  BookmarkPlus,
  ExternalLink,
  Calendar,
  Loader2
} from "lucide-react";
import { useJobs, useEmployers } from "../../database";

interface JobsProps {
  onJobApplication?: (jobTitle: string, companyName: string) => void;
  onViewDetails?: (jobId: number) => void;
}

export function Jobs({ onJobApplication, onViewDetails }: JobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  
  // Fetch jobs from local database
  const { jobs: dbJobs, loading: jobsLoading } = useJobs({ status: 'active' });
  const { employers, loading: employersLoading } = useEmployers();
  
  const loading = jobsLoading || employersLoading;

  // Transform database jobs to component format
  const jobs = useMemo(() => {
    return dbJobs.map(job => {
      const employer = employers.find(e => e.id === job.employer_id);
      const postedDate = job.posted_date ? new Date(job.posted_date) : new Date();
      const daysSincePosted = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      const postedDateText = daysSincePosted === 0 ? "Today" : 
                             daysSincePosted === 1 ? "Yesterday" : 
                             `${daysSincePosted} days ago`;
      
      return {
        id: job.id,
        title: job.title,
        company: employer?.company_name || 'Unknown Company',
        location: `${job.location_city || ''}, ${job.location_state || ''}`,
        type: job.job_type === 'full_time' ? 'Full-time' : 
              job.job_type === 'part_time' ? 'Part-time' : 
              job.job_type === 'contract' ? 'Contract' : 'Full-time',
        experience: `${job.experience_years_min || 0}-${job.experience_years_max || 0} years`,
        salary: `₹${((job.salary_min || 0) / 100000).toFixed(0)}-${((job.salary_max || 0) / 100000).toFixed(0)} LPA`,
        postedDate: postedDateText,
        description: job.description || '',
        skills: job.required_skills || [],
        urgent: job.is_urgent || false
      };
    });
  }, [dbJobs, employers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl">Available Positions</h2>
        <p className="text-muted-foreground">{jobs.length} jobs found</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl">{job.title}</h3>
                    {job.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-primary mb-2">
                    <Building className="w-4 h-4 mr-1" />
                    {job.company}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm"
                    onClick={() => onJobApplication?.(job.title, job.company)}
                  >
                    Apply Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <BookmarkPlus className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{job.description}</p>

              <div className="mb-4">
                <h4>Required Skills:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewDetails?.(job.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                <div className="text-xs text-muted-foreground">
                  Posted {job.postedDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}