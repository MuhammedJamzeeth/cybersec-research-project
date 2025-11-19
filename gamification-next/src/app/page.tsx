import CategoryCard from "@/components/CategoryCard";
import DashboardQuickView from "@/components/DashboardQuickView";
import { Category } from "@/types";

const categories: Category[] = [
  {
    id: "1",
    slug: "password-management",
    title: "Password Management",
    description: "Learn best practices for creating and managing secure passwords",
    icon: "Lock",
  },
  {
    id: "2",
    slug: "social-media-privacy",
    title: "Social Media Privacy",
    description: "Protect your personal information on social platforms",
    icon: "Share2",
  },
  {
    id: "3",
    slug: "safe-browsing",
    title: "Safe Browsing",
    description: "Navigate the web safely and avoid malicious websites",
    icon: "Globe",
  },
  {
    id: "4",
    slug: "phishing-awareness",
    title: "Phishing Awareness",
    description: "Identify and avoid phishing attempts and scams",
    icon: "Mail",
  },
  {
    id: "5",
    slug: "mobile-app-permissions",
    title: "Mobile App Permissions",
    description: "Understand and manage app permissions on your devices",
    icon: "Smartphone",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <DashboardQuickView />
      
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to CyberSafe
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Test your cybersecurity knowledge across five key topics. Complete assessments
          to learn how to stay safe online.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
