import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Users, 
  Building,
  Star,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Target,
  Award,
  Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export function SalaryInsights() {
  const [selectedRole, setSelectedRole] = useState("senior-tax-associate");
  const [selectedLocation, setSelectedLocation] = useState("mumbai");
  const [selectedExperience, setSelectedExperience] = useState("3-5");

  const salaryData: Array<{ role: string; min: number; max: number; median: number; experience: string }> = [];
  const locationData: Array<{ city: string; avgSalary: number; growth: number; jobs: number }> = [];
  const trendData: Array<{ month: string; salary: number }> = [];
  const skillPremiumData: Array<{ skill: string; premium: number; demand: string }> = [];
  const companyData: Array<{ name: string; range: string; avg: number; color: string }> = [];
  const hasData =
    salaryData.length > 0 ||
    locationData.length > 0 ||
    trendData.length > 0 ||
    skillPremiumData.length > 0 ||
    companyData.length > 0;

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "Very High": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="w-6 h-6 mr-2" />
              Salary Insights
            </CardTitle>
            <p className="text-muted-foreground">
              Market salary data is not available yet. Check back after more jobs and applications are on the platform.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <DollarSign className="w-6 h-6 mr-2" />
            Salary Insights & Market Analysis
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive salary data and market trends for US Tax professionals in India
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tax-associate">Tax Associate</SelectItem>
                <SelectItem value="senior-tax-associate">Senior Tax Associate</SelectItem>
                <SelectItem value="tax-manager">Tax Manager</SelectItem>
                <SelectItem value="senior-tax-manager">Senior Tax Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="delhi">Delhi NCR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Select Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-8">5-8 years</SelectItem>
                <SelectItem value="8+">8+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Your Profile Summary */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Your Salary Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹11.5L</div>
              <div className="text-sm text-muted-foreground">Current Market Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹14.2L</div>
              <div className="text-sm text-muted-foreground">Potential with Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">85th</div>
              <div className="text-sm text-muted-foreground">Percentile</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span className="text-2xl font-bold">12%</span>
              </div>
              <div className="text-sm text-muted-foreground">YoY Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="skills">Skills Premium</TabsTrigger>
          <TabsTrigger value="companies">By Company</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Role-wise Salary Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Salary by Role & Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}L`, ""]} />
                    <Bar dataKey="min" fill="#8884d8" name="Min" />
                    <Bar dataKey="median" fill="#82ca9d" name="Median" />
                    <Bar dataKey="max" fill="#ffc658" name="Max" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Top Cities for Tax Professionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{location.city}</p>
                          <p className="text-sm text-muted-foreground">{location.jobs} active jobs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{location.avgSalary}L</p>
                        <div className="flex items-center text-sm">
                          <ArrowUp className="w-3 h-3 mr-1 text-green-600" />
                          <span className="text-green-600">{location.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Salary Trends (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}L`, "Average Salary"]} />
                  <Line 
                    type="monotone" 
                    dataKey="salary" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">+12.8%</div>
                <div className="text-sm text-muted-foreground">YoY Salary Growth</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">24%</div>
                <div className="text-sm text-muted-foreground">Job Market Growth</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">₹18L</div>
                <div className="text-sm text-muted-foreground">Peak Salary This Year</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Premium Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Skills That Command Premium
              </CardTitle>
              <p className="text-muted-foreground">
                Salary premium over base pay for specialized skills
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillPremiumData.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{skill.skill}</p>
                        <Badge className={getDemandColor(skill.demand)} variant="outline">
                          {skill.demand} Demand
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">+{skill.premium}%</div>
                      <div className="text-sm text-muted-foreground">Premium</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Top Paying Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyData.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.range}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{company.avg}L</p>
                        <p className="text-sm text-muted-foreground">Average</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={companyData}
                      dataKey="avg"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ₹${value}L`}
                    >
                      {companyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}L`, "Average Salary"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}