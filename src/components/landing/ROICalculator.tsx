import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";

export function ROICalculator() {
  const [employees, setEmployees] = useState(100);
  const [avgSalary, setAvgSalary] = useState(85000);
  const [turnoverRate, setTurnoverRate] = useState(15);

  const replacementCost = avgSalary * 1.5;
  const expectedTurnover = Math.round(employees * (turnoverRate / 100));
  const withoutPlatform = expectedTurnover * replacementCost;
  const withPlatform = Math.round(expectedTurnover * 0.06 * replacementCost);
  const savings = withoutPlatform - withPlatform;

  return (
    <section className="py-20 px-6 bg-lavender-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Calculate Your ROI
          </h2>
          <p className="text-lg text-muted-foreground">
            See how much your company can save by retaining returning mothers
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> ROI Calculator
            </CardTitle>
            <CardDescription>
              Enter your company details to estimate savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <Label>Returning Mothers</Label>
                <Input type="number" value={employees} onChange={(e) => setEmployees(Number(e.target.value))} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Average Salary ($)</Label>
                <Input type="number" value={avgSalary} onChange={(e) => setAvgSalary(Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-2">
                <Label>Turnover Rate (%)</Label>
                <Input type="number" value={turnoverRate} onChange={(e) => setTurnoverRate(Number(e.target.value))} min={0} max={100} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cost Without elevateHer</p>
                <p className="text-2xl font-bold text-destructive">${withoutPlatform.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-lavender-100">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cost With elevateHer</p>
                <p className="text-2xl font-bold text-primary">${withPlatform.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Your Savings</p>
                <p className="text-2xl font-bold text-green-600">${savings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
