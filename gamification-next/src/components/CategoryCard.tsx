"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Category } from "@/types";
import { Lock, Share2, Globe, Mail, Smartphone, Shield } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

const iconMap = {
  Lock,
  Share2,
  Globe,
  Mail,
  Smartphone,
  Shield,
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const Icon = iconMap[category.icon as keyof typeof iconMap];

  const handleClick = () => {
    if (isAuthenticated) {
      router.push(`/categories/${category.slug}`);
    } else {
      router.push(`/login?redirect=/categories/${category.slug}`);
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{category.title}</CardTitle>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Click to start assessment
        </p>
      </CardContent>
    </Card>
  );
}
