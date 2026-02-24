import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, Users, TrendingUp, DollarSign, BookOpen, MessageSquare,
  Heart, Download, Shield, Calculator,
} from "lucide-react";
import { toast } from "sonner";

const departmentData = [
  { name: "Engineering", employees: 24, avgMood: 3.8, burnoutRisk: "low", color: "bg-green-500" },
  { name: "Marketing", employees: 12, avgMood: 3.2, burnoutRisk: "medium", color: "bg-yellow-500" },
  { name: "Sales", employees: 18, avgMood: 2.9, burnoutRisk: "high", color: "bg-red-500" },
  { name: "Operations", employees: 15, avgMood: 3.5, burnoutRisk: "low", color: "bg-green-500" },
  { name: "Finance", employees: 8, avgMood: 3.6, burnoutRisk: "low", color: "bg-green-500" },
  { name: "HR", employees: 6, avgMood: 4.1, burnoutRisk: "low", color: "bg-green-500" },
];

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [roiEmployees, setRoiEmployees] = useState(50);
  const [roiAvgCost, setRoiAvgCost] = useState(75000);

  const replacementCost = roiAvgCost * 1.5;
  const retainedEmployees = Math.round(roiEmployees * 0.94);
  const savings = Math.round((roiEmployees - retainedEmployees * 0.06) * replacementCost * 0.88);

  const handleExport = () => {
    toast.success("CSV exported successfully!");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employer Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Aggregate insights to support your returning employees
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" /> Privacy Protected
            </Badge>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <Shield className="h-4 w-4 inline mr-2" />
          <strong>Privacy Notice:</strong> All data shown is aggregate and anonymized.
          Individual employee data is never accessible. Departments with fewer than 5
          participants are not displayed.
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">83</p>
              <p className="text-xs text-muted-foreground">Active Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">3.5</p>
              <p className="text-xs text-muted-foreground">Avg Mood Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Coaching Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">432</p>
              <p className="text-xs text-muted-foreground">Modules Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">Engagement Rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="departments">
          <TabsList>
            <TabsTrigger value="departments">Department Risk</TabsTrigger>
            <TabsTrigger value="heatmap">Retention Heatmap</TabsTrigger>
            <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Risk Tracking</CardTitle>
                <CardDescription>Average burnout risk and mood scores by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((dept) => (
                    <div key={dept.name} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium">{dept.name}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Progress value={dept.avgMood * 20} className="flex-1 h-3" />
                          <span className="text-sm font-medium w-8">{dept.avgMood}</span>
                        </div>
                      </div>
                      <Badge className={riskColors[dept.burnoutRisk]}>
                        {dept.burnoutRisk} risk
                      </Badge>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {dept.employees} people
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Retention Heatmap</CardTitle>
                <CardDescription>Visual overview of retention risk across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {departmentData.map((dept) => (
                    <div
                      key={dept.name}
                      className={`p-6 rounded-lg text-center space-y-2 ${
                        dept.burnoutRisk === "low"
                          ? "bg-green-50 border border-green-200"
                          : dept.burnoutRisk === "medium"
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p className="font-semibold">{dept.name}</p>
                      <p className="text-2xl font-bold">
                        {dept.burnoutRisk === "low" ? "Low" : dept.burnoutRisk === "medium" ? "Medium" : "High"}
                      </p>
                      <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                      <p className="text-sm">Avg mood: {dept.avgMood}/5</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-200 rounded" /> Low Risk</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-200 rounded" /> Medium Risk</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-200 rounded" /> High Risk</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" /> ROI Calculator
                </CardTitle>
                <CardDescription>Estimate your return on investment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employees on Program</Label>
                    <Input type="number" value={roiEmployees} onChange={(e) => setRoiEmployees(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Replacement Cost ($)</Label>
                    <Input type="number" value={roiAvgCost} onChange={(e) => setRoiAvgCost(Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold text-primary">94%</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Employees Retained</p>
                    <p className="text-2xl font-bold text-primary">{retainedEmployees}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Estimated Savings</p>
                    <p className="text-2xl font-bold text-green-600">${savings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
