"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Target, Zap } from "lucide-react";
import Link from "next/link";

interface QuickStats {
  totalAssessments: number;
  averageScore: number;
  totalPoints: number;
  level: number;
}

export default function DashboardQuickView() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadQuickStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadQuickStats = async () => {
    try {
      const res = await fetch(`/api/assessments?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        const assessments = data.assessments || [];
        
        const totalAssessments = assessments.length;
        const totalScore = assessments.reduce((sum: number, a: any) => sum + a.score, 0);
        const averageScore = totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0;
        const totalPoints = totalScore * 10;
        const level = Math.floor(totalPoints / 500) + 1;
        
        setStats({
          totalAssessments,
          averageScore,
          totalPoints,
          level,
        });
      }
    } catch (error) {
      console.error("Error loading quick stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!stats || stats.totalAssessments === 0) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Trophy className="h-12 w-12" />
            <div>
              <p className="text-sm opacity-90">Your Progress</p>
              <p className="text-2xl font-bold">Level {stats.level} • {stats.totalPoints} Points</p>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <Target className="h-5 w-5 mx-auto mb-1 opacity-75" />
              <p className="text-2xl font-bold">{stats.totalAssessments}</p>
              <p className="text-xs opacity-75">Completed</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 opacity-75" />
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
              <p className="text-xs opacity-75">Avg Score</p>
            </div>
          </div>

          <Button asChild variant="secondary" size="lg">
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
