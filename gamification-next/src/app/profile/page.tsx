"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompletedCategory {
  score: number;
  completedAt: string;
}

const categoryTitles: Record<string, string> = {
  "password-management": "Password Management",
  "social-media-privacy": "Social Media Privacy",
  "safe-browsing": "Safe Browsing",
  "phishing-awareness": "Phishing Awareness",
  "mobile-app-permissions": "Mobile App Permissions",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [completedCategories, setCompletedCategories] = useState<Record<string, CompletedCategory>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchAssessments();
    }
  }, [isAuthenticated, router, user]);

  const fetchAssessments = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/assessments?userId=${user.id}`);
      if (response.ok) {
        const { assessments } = await response.json();
        
        // Transform assessments into the format expected by the UI
        const categoriesMap: Record<string, CompletedCategory> = {};
        assessments.forEach((assessment: any) => {
          categoriesMap[assessment.slug] = {
            score: assessment.score,
            completedAt: assessment.completedAt,
          };
        });
        
        setCompletedCategories(categoriesMap);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const completedCount = Object.keys(completedCategories).length;
  const averageScore =
    completedCount > 0
      ? Math.round(
          Object.values(completedCategories).reduce((sum, cat) => sum + cat.score, 0) /
            completedCount
        )
      : 0;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Profile Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            View your progress and manage your account
          </p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Username</p>
              <p className="text-lg font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>
              Track your cybersecurity knowledge across all categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Assessments Completed
                </p>
                <p className="text-3xl font-bold">{completedCount}/5</p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Average Score</p>
                <p className="text-3xl font-bold">{averageScore}%</p>
              </div>
            </div>

            {completedCount > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Completed Assessments</h3>
                {Object.entries(completedCategories).map(([slug, data]) => (
                  <div
                    key={slug}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div>
                      <p className="font-medium">{categoryTitles[slug]}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Completed on{" "}
                        {new Date(data.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{data.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  You haven't completed any assessments yet.
                </p>
                <Button onClick={() => router.push("/")}>Start Learning</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
