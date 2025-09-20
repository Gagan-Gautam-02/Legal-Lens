'use client';

import type { AnalyzeRiskGapsOutput } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import React from 'react';

interface RiskMeterProps {
  riskGaps: AnalyzeRiskGapsOutput;
}

// Simple scoring: risks are 3 points, ambiguous are 2, missing are 1
const calculateRiskScore = (riskGaps: AnalyzeRiskGapsOutput): number => {
  const riskWeight = 3;
  const ambiguousWeight = 2;
  const missingWeight = 1;

  const score =
    (riskGaps.risks.length * riskWeight) +
    (riskGaps.ambiguousClauses.length * ambiguousWeight) +
    (riskGaps.missingClauses.length * missingWeight);

  // Normalize score to a 0-100 scale (this is arbitrary, adjust maxScore as needed)
  const maxScore = 30; // e.g., assumes a max of 5 risks, 5 ambiguous, 5 missing
  const normalizedScore = Math.min((score / maxScore) * 100, 100);

  return normalizedScore;
};

const getRiskLevel = (score: number): { level: 'Low' | 'Medium' | 'High'; icon: React.ReactNode; color: string } => {
  if (score < 33) {
    return { level: 'Low', icon: <ShieldCheck className="h-5 w-5 text-green-500" />, color: 'text-green-500' };
  }
  if (score < 66) {
    return { level: 'Medium', icon: <Shield className="h-5 w-5 text-yellow-500" />, color: 'text-yellow-500' };
  }
  return { level: 'High', icon: <ShieldAlert className="h-5 w-5 text-red-500" />, color: 'text-red-500' };
};

export function RiskMeter({ riskGaps }: RiskMeterProps) {
  const score = calculateRiskScore(riskGaps);
  const { level, icon, color } = getRiskLevel(score);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-headline">
          <div className="flex items-center gap-2">
             <ShieldAlert className="h-6 w-6 text-primary" />
            Document Risk Level
          </div>
          <div className={cn("flex items-center gap-2 text-lg font-bold", color)}>
            {icon}
            <span>{level}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500">
           <div
            className="absolute top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-foreground shadow-md transition-all duration-500 ease-in-out"
            style={{ left: `${score}%` }}
          >
             <div className="absolute -top-3 left-1/2 h-2 w-2 -translate-x-1/2 transform rounded-full bg-foreground"></div>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
}
