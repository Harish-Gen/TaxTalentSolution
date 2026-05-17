import { useState, useMemo } from "react";
import { useJobs, useEmployers } from "../../database";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Heart,
  TrendingUp,
  Loader2,
} from "lucide-react";

export function BestMatches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const { jobs: dbJobs, loading } = useJobs({ status: "active" });
  const { employers } = useEmployers();

  const jobMatches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let list = dbJobs.map((job) => {
      const employer = employers.find((e) => e.id === job.employer_id);
      const postedDate = job.posted_date ? new Date(job.posted_date) : new Date();
      const days = Math.floor((Date.now() - postedDate.getTime()) / 86400000);
      const postedDateText =
        days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
      return {
        id: job.id,
        title: job.title,
        company: employer?.company_name || "Employer",
        location: [job.location_city, job.location_state].filter(Boolean).join(", "),
        type: job.job_type || "Full-time",
        experience: job.experience_level || "—",
        salary: `₹${((job.salary_min || 0) / 100000).toFixed(0)}-${((job.salary_max || 0) / 100000).toFixed(0)} LPA`,
        postedDate: postedDateText,
        skills: job.required_skills || [],
        description: job.description || "",
      };
    });
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (sortBy === "salary") {
      list = [...list].sort((a, b) => b.salary.localeCompare(a.salary));
    } else if (sortBy === "company") {
      list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    }
    return list;
  }, [dbJobs, employers, searchTerm, sortBy]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading job matches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-6 h-6 mr-2" />
                Best Job Matches
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Active postings from the database — {jobMatches.length} found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Default</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                  <SelectItem value="company">Company A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {jobMatches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No active job postings match your search. Open the Jobs tab to browse all listings.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobMatches.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                        <p className="text-primary font-medium">{job.company}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className={
                          savedJobs.includes(job.id) ? "text-red-500" : "text-muted-foreground"
                        }
                      >
                        <Heart
                          className={`w-4 h-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        {job.location || "—"}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 shrink-0" />
                        {job.salary}
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1 shrink-0" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 shrink-0" />
                        {job.postedDate}
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    )}
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
