import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">About CyberSafe</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 dark:text-zinc-400">
                CyberSafe is a gamified cybersecurity awareness platform designed to help
                individuals improve their online safety knowledge. Through interactive
                assessments, we make learning about cybersecurity engaging and accessible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>
                  <strong>Password Management:</strong> Learn best practices for creating
                  and maintaining secure passwords
                </li>
                <li>
                  <strong>Social Media Privacy:</strong> Understand how to protect your
                  personal information on social platforms
                </li>
                <li>
                  <strong>Safe Browsing:</strong> Navigate the web safely and identify
                  malicious websites
                </li>
                <li>
                  <strong>Phishing Awareness:</strong> Recognize and avoid phishing
                  attempts and online scams
                </li>
                <li>
                  <strong>Mobile App Permissions:</strong> Manage app permissions to
                  protect your privacy on mobile devices
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Create an account or log in to get started</li>
                <li>Choose a cybersecurity topic you want to learn about</li>
                <li>Complete the assessment to test your current knowledge</li>
                <li>Receive instant feedback and learn from your results</li>
                <li>Track your progress across all five categories</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Cybersecurity Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 dark:text-zinc-400">
                In today's digital age, cybersecurity awareness is crucial for everyone.
                Cyber threats are constantly evolving, and staying informed about best
                practices can help protect your personal information, financial data, and
                online identity. Our platform makes it easy to build these essential skills
                through bite-sized, interactive assessments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
