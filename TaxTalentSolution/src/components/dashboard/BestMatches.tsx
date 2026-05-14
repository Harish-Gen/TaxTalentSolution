import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Star,
  Heart,
  ExternalLink,
  Bookmark,
  TrendingUp
} from "lucide-react";

export function BestMatches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const jobMatches = [
    {
      id: 1,
      title: "Senior Tax Associate - US Tax",
      company: "Deloitte India",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8L - ₹12L",
      match: 95,
      postedDate: "2 days ago",
      skills: ["1040", "1065", "1120", "S Corp", "CCH Axcess"],
      description: "Looking for experienced tax professionals to handle complex US tax returns for our international clients. Must have strong knowledge of individual and corporate tax preparation.",
      companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "US Tax Manager",
      company: "EY GDS",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "5-8 years",
      salary: "₹15L - ₹25L",
      match: 92,
      postedDate: "1 day ago",
      skills: ["1120", "Partnership", "Tax Planning", "Research"],
      description: "Lead tax projects and mentor junior professionals. Extensive experience with corporate tax returns and multi-state filings required.",
      companyLogo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Tax Consultant - Individual Returns",
      company: "KPMG India",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹6L - ₹10L",
      match: 88,
      postedDate: "3 days ago",
      skills: ["1040", "QuickBooks", "Drake", "Tax Research"],
      description: "Specialized role focusing on high-net-worth individual tax returns. Remote work options available.",
      companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "Senior Tax Analyst",
      company: "Genpact",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹10L - ₹16L",
      match: 85,
      postedDate: "5 days ago",
      skills: ["1065", "Operating Partnership", "Private Equity"],
      description: "Handle complex partnership returns and private equity tax matters. Strong analytical skills required.",
      companyLogo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop&crop=center"
    },
    {
      id: 5,
      title: "Tax Associate - Corporate",
      company: "WNS Global",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "1-3 years",
      salary: "₹4L - ₹7L",
      match: 82,
      postedDate: "1 week ago",
      skills: ["1120", "S Corp", "Excel", "UltraTax"],
      description: "Entry to mid-level position for corporate tax preparation. Great learning opportunities and career growth.",
      companyLogo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=center"
    },
    {
      id: 6,
      title: "US Tax Specialist",
      company: "Accenture India",
      location: "Delhi NCR",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹9L - ₹14L",
      match: 80,
      postedDate: "4 days ago",
      skills: ["Multi-state", "Tax Planning", "Research", "Client Relations"],
      description: "Work with Fortune 500 clients on complex tax matters. Strong communication skills essential.",
      companyLogo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&crop=center"
    }
  ];

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 bg-green-50";
    if (match >= 80) return "text-blue-600 bg-blue-50";
    if (match >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-6 h-6 mr-2" />
                Best Job Matches for You
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Based on your skills and experience - {jobMatches.length} opportunities found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="date">Most Recent</SelectItem>
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
              placeholder="Search for specific roles, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Matches */}
      <div className="space-y-4">
        {jobMatches.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  <ImageWithFallback
                    src={job.companyLogo}
                    alt={`${job.company} logo`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>

                {/* Job Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                      <p className="text-primary font-medium">{job.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`px-2 py-1 ${getMatchColor(job.match)}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {job.match}% match
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className={savedJobs.includes(job.id) ? "text-red-500" : "text-muted-foreground"}
                      >
                        <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.postedDate}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Experience: {job.experience}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Opportunities
        </Button>
      </div>
    </div>
  );
}