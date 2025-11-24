"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  Brain,
  Zap
} from "lucide-react";

interface GamePageProps {
  params: Promise<{
    category: string;
    gameSlug: string;
  }>;
}

type GamePhase = "intro" | "pre-assessment" | "game" | "post-assessment" | "results";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface ScenarioOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface GameScenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  options: ScenarioOption[];
  learningPoint: string;
}

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState("");
  const [gameSlug, setGameSlug] = useState("");
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [preScore, setPreScore] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [postScore, setPostScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<number, boolean>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    params.then((p) => {
      setCategory(p.category);
      setGameSlug(p.gameSlug);
    });
  }, [params]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/games");
    }
  }, [isAuthenticated, router]);

  // Save results when reaching results phase
  useEffect(() => {
    if (phase === "results" && user) {
      saveGameResults();
    }
  }, [phase, user]);

  // Dynamic questions based on game type
  const getAssessmentQuestions = (): Question[] => {
    const questionSets: Record<string, Question[]> = {
      "permission-detective": [
        {
          id: "1",
          question: "What is the most dangerous permission an app can request?",
          options: [
            "Access to contacts",
            "Access to camera and microphone",
            "Access to device administrator rights",
            "Access to storage"
          ],
          correctAnswer: 2,
          explanation: "Device administrator rights give apps extensive control over your device and can be used maliciously.",
          points: 10
        },
        {
          id: "2",
          question: "When should you review app permissions?",
          options: [
            "Only when installing the app",
            "Never, they're automatically safe",
            "Regularly, and before installing",
            "Only if the app crashes"
          ],
          correctAnswer: 2,
          explanation: "Regular review helps you maintain control over your data and privacy.",
          points: 10
        },
        {
          id: "3",
          question: "A flashlight app requests access to your contacts. What should you do?",
          options: [
            "Accept it, all apps need contacts",
            "Deny it, a flashlight doesn't need contacts",
            "Only accept if it's a popular app",
            "Ask your friends first"
          ],
          correctAnswer: 1,
          explanation: "Apps should only request permissions necessary for their function. A flashlight doesn't need contacts.",
          points: 10
        }
      ],
      "secure-app-builder": [
        {
          id: "1",
          question: "Which permission model provides the best security?",
          options: [
            "Request all permissions at install",
            "Request permissions when needed (runtime)",
            "Assume all permissions by default",
            "Never ask for permissions"
          ],
          correctAnswer: 1,
          explanation: "Runtime permissions allow users to grant access only when needed, providing better control and transparency.",
          points: 10
        },
        {
          id: "2",
          question: "What should developers do before requesting a sensitive permission?",
          options: [
            "Just request it without explanation",
            "Provide clear context about why it's needed",
            "Hide the permission request in settings",
            "Request it only after the app is installed"
          ],
          correctAnswer: 1,
          explanation: "Transparency builds trust. Developers should explain why sensitive permissions are necessary.",
          points: 10
        },
        {
          id: "3",
          question: "What's the principle of 'least privilege' in app permissions?",
          options: [
            "Apps should request the minimum permissions needed",
            "Apps should have no permissions at all",
            "Users should grant all permissions",
            "Only system apps need permissions"
          ],
          correctAnswer: 0,
          explanation: "Least privilege means apps should only request permissions absolutely necessary for their core functionality.",
          points: 10
        }
      ],
      "privacy-defender": [
        {
          id: "1",
          question: "What is a permission abuse red flag?",
          options: [
            "An app requesting many unrelated permissions",
            "An app asking for camera access",
            "An app requiring internet connection",
            "An app needing storage access"
          ],
          correctAnswer: 0,
          explanation: "When apps request numerous permissions unrelated to their function, it's a major warning sign.",
          points: 10
        },
        {
          id: "2",
          question: "How can you protect against malicious apps?",
          options: [
            "Install from official app stores only",
            "Download from any website",
            "Disable all security warnings",
            "Grant all permissions quickly"
          ],
          correctAnswer: 0,
          explanation: "Official app stores have security measures and vetting processes to reduce malicious apps.",
          points: 10
        },
        {
          id: "3",
          question: "What should you do if an app's permissions change suspiciously?",
          options: [
            "Ignore it and continue using",
            "Review the changes and consider uninstalling",
            "Grant all new permissions",
            "Restart your device"
          ],
          correctAnswer: 1,
          explanation: "Suspicious permission changes may indicate the app has been compromised or updated maliciously.",
          points: 10
        }
      ],
      "password-strength-trainer": [
        {
          id: "1",
          question: "What makes a password strong?",
          options: [
            "Using your birthday",
            "Length, complexity, and uniqueness",
            "Using common words",
            "Keeping it short for easy memory"
          ],
          correctAnswer: 1,
          explanation: "Strong passwords combine length (12+ characters), mix of character types, and are unique to each account.",
          points: 10
        },
        {
          id: "2",
          question: "How often should you change critical passwords?",
          options: [
            "Never change them",
            "Every day",
            "When compromised or every 90 days",
            "Only when you forget them"
          ],
          correctAnswer: 2,
          explanation: "Regular changes reduce risk, but changing too often can lead to weaker passwords. Balance is key.",
          points: 10
        },
        {
          id: "3",
          question: "What's the safest way to store passwords?",
          options: [
            "Write them on sticky notes",
            "Use a reputable password manager",
            "Save them in a text file",
            "Email them to yourself"
          ],
          correctAnswer: 1,
          explanation: "Password managers use encryption and secure storage to protect your credentials.",
          points: 10
        }
      ],
      "breach-defense": [
        {
          id: "1",
          question: "What is two-factor authentication (2FA)?",
          options: [
            "Using two different passwords",
            "A second verification method beyond password",
            "Logging in twice",
            "Having two user accounts"
          ],
          correctAnswer: 1,
          explanation: "2FA adds an extra security layer by requiring something you know (password) and something you have (phone/token).",
          points: 10
        },
        {
          id: "2",
          question: "What should you do if you discover your password in a data breach?",
          options: [
            "Wait and see if anything happens",
            "Change it immediately and enable 2FA",
            "Delete your account",
            "Ignore it if you haven't noticed problems"
          ],
          correctAnswer: 1,
          explanation: "Immediate action prevents attackers from exploiting the compromised password. 2FA adds extra protection.",
          points: 10
        },
        {
          id: "3",
          question: "What makes password reuse dangerous?",
          options: [
            "It's hard to remember",
            "One breach compromises all accounts",
            "It's against the law",
            "Websites don't allow it"
          ],
          correctAnswer: 1,
          explanation: "If one site is breached, attackers try those credentials on other sites (credential stuffing).",
          points: 10
        }
      ],
      "email-detective": [
        {
          id: "1",
          question: "What's a common sign of a phishing email?",
          options: [
            "Proper grammar and spelling",
            "Urgent language and threats",
            "Personalized greeting",
            "Clear sender information"
          ],
          correctAnswer: 1,
          explanation: "Phishing emails often create urgency to make you act without thinking critically.",
          points: 10
        },
        {
          id: "2",
          question: "How can you verify a suspicious link?",
          options: [
            "Click it to see where it goes",
            "Hover over it to preview the URL",
            "Forward it to friends",
            "Reply asking if it's safe"
          ],
          correctAnswer: 1,
          explanation: "Hovering reveals the actual URL without clicking, helping you spot mismatched or suspicious domains.",
          points: 10
        },
        {
          id: "3",
          question: "What should you do with suspected phishing emails?",
          options: [
            "Delete them immediately",
            "Report them and then delete",
            "Reply telling them it's a scam",
            "Forward to all your contacts"
          ],
          correctAnswer: 1,
          explanation: "Reporting helps email providers improve filters and protects other users from the same scam.",
          points: 10
        }
      ],
      "scam-buster": [
        {
          id: "1",
          question: "What is 'spoofing' in phishing attacks?",
          options: [
            "Making fun of someone",
            "Disguising sender identity to appear legitimate",
            "Sending spam emails",
            "Creating fake websites"
          ],
          correctAnswer: 1,
          explanation: "Spoofing makes malicious emails appear to come from trusted sources like banks or colleagues.",
          points: 10
        },
        {
          id: "2",
          question: "A prince offers you millions via email. What is this?",
          options: [
            "A lucky opportunity",
            "An advance-fee scam",
            "A legitimate inheritance",
            "A prize you won"
          ],
          correctAnswer: 1,
          explanation: "These 'Nigerian prince' scams are advance-fee frauds requiring you to pay money upfront for fake rewards.",
          points: 10
        },
        {
          id: "3",
          question: "What's 'spear phishing'?",
          options: [
            "Phishing with a weapon",
            "Targeted phishing using personal information",
            "Random mass email scams",
            "Fishing for compliments"
          ],
          correctAnswer: 1,
          explanation: "Spear phishing uses researched personal details to make attacks more convincing and targeted.",
          points: 10
        }
      ],
      "privacy-settings-master": [
        {
          id: "1",
          question: "What's the safest default privacy setting for social media posts?",
          options: [
            "Public",
            "Friends only",
            "Friends of friends",
            "Everyone on the internet"
          ],
          correctAnswer: 1,
          explanation: "Limiting to friends reduces exposure to strangers, data scrapers, and malicious actors.",
          points: 10
        },
        {
          id: "2",
          question: "Should you allow apps to access your social media profile?",
          options: [
            "Always yes",
            "Only from trusted, necessary apps",
            "Never",
            "Only for games"
          ],
          correctAnswer: 1,
          explanation: "Third-party app access can leak your data. Only grant to apps you trust and need.",
          points: 10
        },
        {
          id: "3",
          question: "What information should you avoid sharing publicly on social media?",
          options: [
            "Your hobbies",
            "Your home address and phone number",
            "Your favorite movies",
            "Photos of your lunch"
          ],
          correctAnswer: 1,
          explanation: "Personal contact information can be used for identity theft, stalking, or targeted attacks.",
          points: 10
        }
      ],
      "web-safety-navigator": [
        {
          id: "1",
          question: "What does 'HTTPS' indicate about a website?",
          options: [
            "It's fast",
            "It encrypts data transmission",
            "It's free",
            "It has good design"
          ],
          correctAnswer: 1,
          explanation: "HTTPS encrypts data between your browser and the website, protecting against eavesdropping.",
          points: 10
        },
        {
          id: "2",
          question: "What's a browser 'cookie'?",
          options: [
            "A snack for programmers",
            "Data stored by websites to track you",
            "A computer virus",
            "A security certificate"
          ],
          correctAnswer: 1,
          explanation: "Cookies store information about your browsing to track activity and preferences across visits.",
          points: 10
        },
        {
          id: "3",
          question: "Why should you use private/incognito browsing mode?",
          options: [
            "It makes internet faster",
            "It prevents local history/cookie storage",
            "It makes you completely anonymous",
            "It blocks all ads"
          ],
          correctAnswer: 1,
          explanation: "Private mode prevents local storage of history and cookies, but doesn't make you anonymous online.",
          points: 10
        }
      ]
    };

    return questionSets[gameSlug] || questionSets["permission-detective"];
  };

  const assessmentQuestions = getAssessmentQuestions();

  // Dynamic game scenarios based on game type
  const getGameScenarios = (): GameScenario[] => {
    const scenarioSets: Record<string, GameScenario[]> = {
      "permission-detective": [
        {
          id: "1",
          title: "Suspicious Calculator App",
          description: "You're installing a calculator app",
          situation: "A calculator app is requesting permission to access your SMS messages, contacts, and camera. What should you do?",
          options: [
            {
              text: "Accept all permissions - it's just a calculator",
              isCorrect: false,
              feedback: "❌ Red flag! A calculator has no legitimate need for SMS, contacts, or camera access. This could be malware trying to steal your data.",
              points: 0
            },
            {
              text: "Deny all permissions and don't install the app",
              isCorrect: true,
              feedback: "✅ Excellent decision! These permissions are completely unnecessary for a calculator and indicate malicious intent.",
              points: 20
            },
            {
              text: "Only accept camera permission",
              isCorrect: false,
              feedback: "⚠️ Still risky! A calculator doesn't need camera access. Look for a more trustworthy alternative.",
              points: 5
            }
          ],
          learningPoint: "Always verify that requested permissions match the app's stated function. Unnecessary permissions are a major red flag."
        },
        {
          id: "2",
          title: "Weather App Investigation",
          description: "Reviewing a weather app's permissions",
          situation: "A weather app requests location, internet, and your call logs. Which permissions are suspicious?",
          options: [
            {
              text: "All are necessary for weather apps",
              isCorrect: false,
              feedback: "❌ Call logs have nothing to do with weather! This is data harvesting.",
              points: 0
            },
            {
              text: "Only call logs are suspicious",
              isCorrect: true,
              feedback: "✅ Exactly right! Location and internet make sense for weather, but call logs don't.",
              points: 20
            },
            {
              text: "Location and internet are suspicious",
              isCorrect: false,
              feedback: "⚠️ These are actually needed! Location shows local weather, internet downloads forecasts.",
              points: 5
            }
          ],
          learningPoint: "Learn to distinguish between functional permissions and data mining. Context is everything."
        },
        {
          id: "3",
          title: "Game Permission Analysis",
          description: "A new mobile game wants access",
          situation: "A puzzle game requests storage, internet, and contacts access. What's your assessment?",
          options: [
            {
              text: "Storage and internet OK, contacts suspicious",
              isCorrect: true,
              feedback: "✅ Perfect analysis! Games need storage for saves and internet for updates, but not contacts.",
              points: 20
            },
            {
              text: "All permissions are fine for games",
              isCorrect: false,
              feedback: "❌ Why would a puzzle game need your contacts? This is invasive.",
              points: 0
            },
            {
              text: "Only storage is acceptable",
              isCorrect: false,
              feedback: "⚠️ Internet access is normal for games (updates, ads). The issue is contacts access.",
              points: 10
            }
          ],
          learningPoint: "Games legitimately need some permissions, but personal data access like contacts is a red flag."
        },
        {
          id: "4",
          title: "Flashlight App Red Flags",
          description: "Installing a simple flashlight app",
          situation: "A flashlight app wants device ID, location, and camera. Your verdict?",
          options: [
            {
              text: "Camera is fine, others are excessive",
              isCorrect: false,
              feedback: "⚠️ Camera makes sense for the flash, but device ID and location are unnecessary tracking.",
              points: 10
            },
            {
              text: "Only camera should be granted",
              isCorrect: true,
              feedback: "✅ Correct! Camera accesses the flash. The others are for tracking and advertising.",
              points: 20
            },
            {
              text: "Accept all - it's a simple app",
              isCorrect: false,
              feedback: "❌ Simple apps shouldn't need extensive permissions. This is a privacy violation.",
              points: 0
            }
          ],
          learningPoint: "Even 'simple' apps can hide complex data collection schemes. Scrutinize every permission."
        },
        {
          id: "5",
          title: "Note-Taking App Audit",
          description: "Evaluating a productivity app",
          situation: "A note-taking app requests storage, microphone, camera, and phone calls. What's appropriate?",
          options: [
            {
              text: "Storage, microphone, and camera only",
              isCorrect: true,
              feedback: "✅ Well reasoned! Storage for notes, microphone for voice notes, camera for photos. Phone calls aren't needed.",
              points: 20
            },
            {
              text: "All permissions are needed",
              isCorrect: false,
              feedback: "❌ Phone call access is completely unrelated to note-taking. Major privacy concern!",
              points: 0
            },
            {
              text: "Only storage is necessary",
              isCorrect: false,
              feedback: "⚠️ Modern note apps often include voice and photo features, so those permissions make sense.",
              points: 10
            }
          ],
          learningPoint: "Consider what features an app offers. Voice memos and photo capture justify certain permissions."
        }
      ],
      "secure-app-builder": [
        {
          id: "1",
          title: "Messaging App Design",
          description: "Building a secure messaging app",
          situation: "You're designing a messaging app. Which permission strategy is best?",
          options: [
            {
              text: "Request all permissions upfront at install",
              isCorrect: false,
              feedback: "❌ Overwhelming users with all permissions at once creates distrust and confusion.",
              points: 0
            },
            {
              text: "Request permissions contextually when features are used",
              isCorrect: true,
              feedback: "✅ Perfect! Runtime permissions with context create transparency and user trust.",
              points: 20
            },
            {
              text: "Hide permissions in settings menu",
              isCorrect: false,
              feedback: "❌ Deceptive practices damage trust and may violate app store policies.",
              points: 0
            }
          ],
          learningPoint: "Best practice is contextual permission requests with clear explanations of why they're needed."
        },
        {
          id: "2",
          title: "Photo Gallery App",
          description: "Creating a photo browsing app",
          situation: "Your photo gallery app needs access to images. How do you implement this securely?",
          options: [
            {
              text: "Request full storage access at startup",
              isCorrect: false,
              feedback: "⚠️ Too broad! Use scoped storage to access only photos, not all files.",
              points: 10
            },
            {
              text: "Use scoped storage for photo access only",
              isCorrect: true,
              feedback: "✅ Excellent! Scoped storage limits access to only what's needed, following least privilege.",
              points: 20
            },
            {
              text: "Access all files without asking",
              isCorrect: false,
              feedback: "❌ Illegal and unethical! Always request permissions and respect user privacy.",
              points: 0
            }
          ],
          learningPoint: "Modern platforms offer scoped storage to access only necessary files, not entire filesystems."
        },
        {
          id: "3",
          title: "Fitness App Architecture",
          description: "Designing a fitness tracker",
          situation: "Your fitness app needs location data for tracking runs. How should you request it?",
          options: [
            {
              text: "Request 'always allow' location access",
              isCorrect: false,
              feedback: "⚠️ Privacy invasive! Only request 'always allow' if absolutely necessary with clear justification.",
              points: 5
            },
            {
              text: "Request 'while using app' with upgrade option",
              isCorrect: true,
              feedback: "✅ Perfect balance! Start with minimal access, explain benefits of 'always allow' for background tracking.",
              points: 20
            },
            {
              text: "Track location without telling users",
              isCorrect: false,
              feedback: "❌ Illegal and destroys trust! Transparency is essential for ethical app development.",
              points: 0
            }
          ],
          learningPoint: "Offer tiered permission access. Start minimal, explain benefits of expanded access clearly."
        },
        {
          id: "4",
          title: "Social Media Integration",
          description: "Adding social features",
          situation: "Users want to share content to social media. What data should you access?",
          options: [
            {
              text: "Only the specific content being shared",
              isCorrect: true,
              feedback: "✅ Respect privacy! Access only what's necessary for the specific action.",
              points: 20
            },
            {
              text: "All user's social media data for better integration",
              isCorrect: false,
              feedback: "❌ Excessive! This violates privacy and trust. Only access what's needed for sharing.",
              points: 0
            },
            {
              text: "Read all posts to suggest sharing times",
              isCorrect: false,
              feedback: "⚠️ Feature creep! Don't justify broad access with unnecessary features.",
              points: 5
            }
          ],
          learningPoint: "Feature complexity doesn't justify privacy invasion. Keep data access minimal and purposeful."
        },
        {
          id: "5",
          title: "Payment Processing",
          description: "Implementing in-app purchases",
          situation: "You need to process payments securely. What's the best approach?",
          options: [
            {
              text: "Use platform payment APIs (Google Play, App Store)",
              isCorrect: true,
              feedback: "✅ Smart! Platform APIs handle sensitive data securely without you storing payment info.",
              points: 20
            },
            {
              text: "Store credit card info in your database",
              isCorrect: false,
              feedback: "❌ Extremely dangerous! This violates PCI compliance and creates massive liability.",
              points: 0
            },
            {
              text: "Request permission to access banking apps",
              isCorrect: false,
              feedback: "❌ Unnecessary and suspicious! Use proper payment processing channels.",
              points: 0
            }
          ],
          learningPoint: "Never handle sensitive financial data directly. Use established, secure payment processing services."
        }
      ],
      "privacy-defender": [
        {
          id: "1",
          title: "Malware Detection",
          description: "Suspicious app behavior detected",
          situation: "An installed app starts requesting new permissions it didn't need before. What's your move?",
          options: [
            {
              text: "Uninstall immediately and scan device",
              isCorrect: true,
              feedback: "✅ Smart defense! Sudden permission changes suggest compromise or malicious update.",
              points: 20
            },
            {
              text: "Grant permissions to see what happens",
              isCorrect: false,
              feedback: "❌ Never experiment with suspicious apps! You're giving malware what it wants.",
              points: 0
            },
            {
              text: "Disable internet and investigate",
              isCorrect: false,
              feedback: "⚠️ Better than granting permissions, but uninstalling is safer. Malware may already have data.",
              points: 10
            }
          ],
          learningPoint: "Unexpected permission requests are major warning signs. Remove the app and scan for malware."
        },
        {
          id: "2",
          title: "Data Exfiltration Alert",
          description: "Unusual data usage detected",
          situation: "A simple game is using massive background data. What's likely happening?",
          options: [
            {
              text: "It's uploading your personal data",
              isCorrect: true,
              feedback: "✅ Correct diagnosis! Simple games shouldn't use much data. This is data theft.",
              points: 20
            },
            {
              text: "Games need lots of data for updates",
              isCorrect: false,
              feedback: "❌ Updates happen occasionally, not constantly. This is suspicious behavior.",
              points: 0
            },
            {
              text: "It's normal for all apps",
              isCorrect: false,
              feedback: "❌ Background data usage should be minimal. This indicates malicious activity.",
              points: 0
            }
          ],
          learningPoint: "Monitor app data usage. Excessive background activity suggests data exfiltration or malware."
        },
        {
          id: "3",
          title: "Phishing App",
          description: "Fake banking app discovered",
          situation: "You find two similar banking apps in the store. One has fewer downloads and typos. What do you do?",
          options: [
            {
              text: "Download the one with typos - it's newer",
              isCorrect: false,
              feedback: "❌ Typos indicate a phishing app impersonating your bank! Major danger.",
              points: 0
            },
            {
              text: "Report the suspicious one and use official app",
              isCorrect: true,
              feedback: "✅ Excellent! Fake apps steal credentials. Report them to protect others.",
              points: 20
            },
            {
              text: "Try both to see which works better",
              isCorrect: false,
              feedback: "❌ Never enter real credentials in suspicious apps! You'd give attackers your account.",
              points: 0
            }
          ],
          learningPoint: "Verify app authenticity before downloading. Check developer name, reviews, and download counts."
        },
        {
          id: "4",
          title: "Permission Abuse",
          description: "App accessing camera secretly",
          situation: "Your notification shows an app accessing your camera when you're not using it. Response?",
          options: [
            {
              text: "Revoke permissions and uninstall the app",
              isCorrect: true,
              feedback: "✅ Perfect! Secret access is malicious behavior. Remove and report the app.",
              points: 20
            },
            {
              text: "Assume it's a bug and ignore",
              isCorrect: false,
              feedback: "❌ 'Bugs' don't randomly activate cameras. This is spyware behavior!",
              points: 0
            },
            {
              text: "Cover your camera but keep the app",
              isCorrect: false,
              feedback: "⚠️ Physical security helps, but the app may access other sensitive data. Remove it!",
              points: 5
            }
          ],
          learningPoint: "Modern phones notify when apps access camera/mic. Unexpected access is a serious red flag."
        },
        {
          id: "5",
          title: "Supply Chain Attack",
          description: "Popular app compromised",
          situation: "News breaks that a popular app you use was hacked and malicious code added. What now?",
          options: [
            {
              text: "Uninstall, change passwords, enable 2FA",
              isCorrect: true,
              feedback: "✅ Comprehensive response! Assume compromise and secure all connected accounts.",
              points: 20
            },
            {
              text: "Wait for an official update",
              isCorrect: false,
              feedback: "❌ Every moment malware runs, it can steal more data. Act immediately!",
              points: 0
            },
            {
              text: "Just uninstall the app",
              isCorrect: false,
              feedback: "⚠️ Good start, but secure your accounts too! Malware may have stolen credentials.",
              points: 10
            }
          ],
          learningPoint: "Supply chain attacks compromise trusted apps. Respond quickly: remove, secure accounts, monitor for fraud."
        }
      ],
      "password-strength-trainer": [
        {
          id: "1",
          title: "Password Creation Challenge",
          description: "Creating a new email password",
          situation: "You need a new password for your email. Which is strongest?",
          options: [
            {
              text: "MyEmail2024!",
              isCorrect: false,
              feedback: "⚠️ Better than most, but predictable pattern. Too short for critical accounts.",
              points: 10
            },
            {
              text: "T7$mK9#pL2qR@vN5zX",
              isCorrect: true,
              feedback: "✅ Excellent! Long, random, mixed characters. This would take centuries to crack.",
              points: 20
            },
            {
              text: "ilovemydogmax",
              isCorrect: false,
              feedback: "❌ Dictionary words and personal info are easily cracked. Add length and complexity!",
              points: 0
            }
          ],
          learningPoint: "Strong passwords are 16+ characters with random combinations of letters, numbers, and symbols."
        },
        {
          id: "2",
          title: "Passphrase Method",
          description: "Alternative password strategy",
          situation: "Which passphrase approach is best for memorability AND security?",
          options: [
            {
              text: "correct horse battery staple",
              isCorrect: false,
              feedback: "⚠️ Famous example, but too well-known now. Attackers specifically test this!",
              points: 5
            },
            {
              text: "Purple$Elephant27!Dances@Midnight",
              isCorrect: true,
              feedback: "✅ Perfect! Random words with numbers and symbols. Long, memorable, and secure.",
              points: 20
            },
            {
              text: "ILikeToWalkMyDog",
              isCorrect: false,
              feedback: "❌ Sentence structure is predictable. Add special characters, numbers, and randomness.",
              points: 0
            }
          ],
          learningPoint: "Passphrases with random words, numbers, and symbols balance security with memorability."
        },
        {
          id: "3",
          title: "Password Manager Setup",
          description: "Choosing a master password",
          situation: "You're setting up a password manager. What master password approach is best?",
          options: [
            {
              text: "Use the same strong password you use elsewhere",
              isCorrect: false,
              feedback: "❌ Terrible idea! If that password leaks, your entire password vault is compromised.",
              points: 0
            },
            {
              text: "Create a unique, extra-long passphrase",
              isCorrect: true,
              feedback: "✅ Perfect! Master passwords protect everything, so they need maximum security and uniqueness.",
              points: 20
            },
            {
              text: "Use something simple you'll never forget",
              isCorrect: false,
              feedback: "❌ Simple = weak. The master password is too important. Write it down securely if needed.",
              points: 0
            }
          ],
          learningPoint: "Master passwords are critical single points of failure. Use maximum length and complexity."
        },
        {
          id: "4",
          title: "Password Patterns",
          description: "Avoiding common mistakes",
          situation: "You want related passwords for work accounts. Which strategy is safer?",
          options: [
            {
              text: "WorkEmail1, WorkEmail2, WorkEmail3...",
              isCorrect: false,
              feedback: "❌ Predictable patterns! If one is compromised, attackers easily guess the others.",
              points: 0
            },
            {
              text: "Completely unique random passwords",
              isCorrect: true,
              feedback: "✅ Correct! No patterns or relationships. Each breach is isolated.",
              points: 20
            },
            {
              text: "Same base password with different endings",
              isCorrect: false,
              feedback: "❌ Partial reuse is still dangerous. Cracking one reveals the pattern.",
              points: 0
            }
          ],
          learningPoint: "Never use patterns between passwords. Each should be completely unique and random."
        },
        {
          id: "5",
          title: "Security Questions",
          description: "Setting up account recovery",
          situation: "A website requires security questions. How should you answer?",
          options: [
            {
              text: "Answer truthfully so you remember",
              isCorrect: false,
              feedback: "❌ Personal info is often publicly available or guessable. Easy for attackers!",
              points: 0
            },
            {
              text: "Use random, false answers stored in password manager",
              isCorrect: true,
              feedback: "✅ Smart! Treat security answers like passwords. Random and stored securely.",
              points: 20
            },
            {
              text: "Use the same answers for all sites",
              isCorrect: false,
              feedback: "❌ This creates vulnerability across all accounts. One breach affects everything.",
              points: 0
            }
          ],
          learningPoint: "Security questions are weak authentication. Use random answers and store them like passwords."
        }
      ],
      "breach-defense": [
        {
          id: "1",
          title: "Breach Notification",
          description: "Your email appears in a data breach",
          situation: "You receive notification that your email was in a breach. What's your action plan?",
          options: [
            {
              text: "Change passwords on all accounts using that email",
              isCorrect: true,
              feedback: "✅ Comprehensive response! Assume the worst and secure everything connected to that email.",
              points: 20
            },
            {
              text: "Only change the password for the breached site",
              isCorrect: false,
              feedback: "⚠️ Not enough! If you reused passwords, all those accounts are at risk.",
              points: 10
            },
            {
              text: "Wait to see if you notice any problems",
              isCorrect: false,
              feedback: "❌ Reactive approach gives attackers time to exploit your accounts. Act immediately!",
              points: 0
            }
          ],
          learningPoint: "Treat breaches seriously. Change passwords on all accounts, enable 2FA, and monitor for fraud."
        },
        {
          id: "2",
          title: "2FA Implementation",
          description: "Choosing two-factor methods",
          situation: "You're enabling 2FA on your bank account. Which method is most secure?",
          options: [
            {
              text: "SMS text message codes",
              isCorrect: false,
              feedback: "⚠️ Better than nothing, but SMS can be intercepted through SIM swapping attacks.",
              points: 10
            },
            {
              text: "Authenticator app (TOTP) or hardware key",
              isCorrect: true,
              feedback: "✅ Most secure! Authenticator apps and hardware keys aren't vulnerable to interception.",
              points: 20
            },
            {
              text: "Email codes",
              isCorrect: false,
              feedback: "❌ If your email is compromised, this 2FA is useless. Use independent methods.",
              points: 0
            }
          ],
          learningPoint: "Use authenticator apps or hardware keys for 2FA. SMS is vulnerable to SIM swap attacks."
        },
        {
          id: "3",
          title: "Credential Stuffing",
          description: "Understanding attack vectors",
          situation: "Attackers have your old password from a breach. How do they attack other accounts?",
          options: [
            {
              text: "They guess random passwords",
              isCorrect: false,
              feedback: "❌ They don't guess! They use your known password on other sites (credential stuffing).",
              points: 0
            },
            {
              text: "They try your breached password on other sites",
              isCorrect: true,
              feedback: "✅ Exactly! This is credential stuffing. Why password reuse is dangerous.",
              points: 20
            },
            {
              text: "They can't access other accounts",
              isCorrect: false,
              feedback: "❌ If you reused passwords, they absolutely can! This is why unique passwords are critical.",
              points: 0
            }
          ],
          learningPoint: "Credential stuffing uses leaked passwords to access other accounts. Unique passwords prevent this."
        },
        {
          id: "4",
          title: "Password Monitoring",
          description: "Proactive breach detection",
          situation: "How can you proactively detect if your passwords have been compromised?",
          options: [
            {
              text: "Use services like Have I Been Pwned",
              isCorrect: true,
              feedback: "✅ Smart! Breach monitoring services alert you to compromised credentials before attackers strike.",
              points: 20
            },
            {
              text: "Wait for companies to notify you",
              isCorrect: false,
              feedback: "⚠️ Companies may not know about breaches for months, or may not notify everyone. Be proactive!",
              points: 5
            },
            {
              text: "You can't detect breaches yourself",
              isCorrect: false,
              feedback: "❌ False! Monitoring services check your email/passwords against known breach databases.",
              points: 0
            }
          ],
          learningPoint: "Use breach monitoring services to get early warning when your credentials appear in leaks."
        },
        {
          id: "5",
          title: "Recovery Codes",
          description: "2FA backup planning",
          situation: "You're setting up 2FA with recovery codes. What should you do with them?",
          options: [
            {
              text: "Save them in your password manager",
              isCorrect: true,
              feedback: "✅ Perfect! Password managers securely store recovery codes for when you lose your 2FA device.",
              points: 20
            },
            {
              text: "Email them to yourself",
              isCorrect: false,
              feedback: "❌ Email isn't secure! If compromised, attackers get your recovery codes.",
              points: 0
            },
            {
              text: "You don't need recovery codes",
              isCorrect: false,
              feedback: "❌ Dangerous! Without recovery codes, losing your 2FA device means permanent account lockout.",
              points: 0
            }
          ],
          learningPoint: "Store recovery codes securely offline or in encrypted storage. They're critical for account access."
        }
      ],
      "email-detective": [
        {
          id: "1",
          title: "Urgent Invoice Email",
          description: "Suspicious payment request",
          situation: "You receive an urgent email claiming you owe money with a 'Pay Now' button. What are the red flags?",
          options: [
            {
              text: "Urgency, unexpected payment, and suspicious link",
              isCorrect: true,
              feedback: "✅ Perfect! Phishing uses urgency to bypass critical thinking. You've identified all red flags.",
              points: 20
            },
            {
              text: "It's probably legitimate if it looks professional",
              isCorrect: false,
              feedback: "❌ Scammers create convincing fake emails! Professional appearance doesn't mean legitimate.",
              points: 0
            },
            {
              text: "Just the suspicious link is a problem",
              isCorrect: false,
              feedback: "⚠️ The link is concerning, but urgency and unexpected requests are equally suspicious.",
              points: 10
            }
          ],
          learningPoint: "Phishing emails use urgency, fear, and unexpected requests to trick you. Slow down and verify!"
        },
        {
          id: "2",
          title: "Prize Winner Notice",
          description: "Too good to be true",
          situation: "'Congratulations! You won $10,000! Click here to claim!' What's your assessment?",
          options: [
            {
              text: "It's a scam - you didn't enter any contest",
              isCorrect: true,
              feedback: "✅ Correct! You can't win contests you didn't enter. Classic phishing tactic.",
              points: 20
            },
            {
              text: "Click carefully to see if it's real",
              isCorrect: false,
              feedback: "❌ Never click suspicious links! Even visiting the site can download malware.",
              points: 0
            },
            {
              text: "Reply asking for more information",
              isCorrect: false,
              feedback: "❌ Replying confirms your email is active, leading to more scams. Delete and ignore!",
              points: 0
            }
          ],
          learningPoint: "If it's too good to be true, it's a scam. You can't win contests you never entered."
        },
        {
          id: "3",
          title: "CEO Fraud Email",
          description: "Spear phishing attack",
          situation: "Email from 'CEO' asks you to urgently buy gift cards and send codes. Verify how?",
          options: [
            {
              text: "Call the CEO directly using known contact info",
              isCorrect: true,
              feedback: "✅ Perfect! Verify through independent channels, never using contact info in suspicious emails.",
              points: 20
            },
            {
              text: "Reply to the email asking if it's really them",
              isCorrect: false,
              feedback: "❌ You'd be replying to the scammer! Use independent verification channels.",
              points: 0
            },
            {
              text: "Check if the email address looks right",
              isCorrect: false,
              feedback: "⚠️ Email addresses can be spoofed! Always verify urgent requests through separate channels.",
              points: 5
            }
          ],
          learningPoint: "Business Email Compromise (BEC) impersonates executives. Always verify urgent requests independently."
        },
        {
          id: "4",
          title: "Bank Alert Phishing",
          description: "Account security email",
          situation: "Email says: 'Suspicious activity detected! Verify your account immediately or it will be locked.' Response?",
          options: [
            {
              text: "Go to bank's website directly (type URL) and check",
              isCorrect: true,
              feedback: "✅ Smart! Never click links in suspicious emails. Navigate directly to legitimate sites.",
              points: 20
            },
            {
              text: "Click the link - my account might be at risk!",
              isCorrect: false,
              feedback: "❌ That's what they want! Urgency bypasses judgment. Always verify independently.",
              points: 0
            },
            {
              text: "Call the number in the email",
              isCorrect: false,
              feedback: "⚠️ That number leads to scammers! Use contact info from bank's official website or your card.",
              points: 5
            }
          ],
          learningPoint: "Banks never ask for verification via email. Navigate to legitimate sites directly, don't click links."
        },
        {
          id: "5",
          title: "Package Delivery Scam",
          description: "Fake shipping notification",
          situation: "Text/email about 'failed delivery' with tracking link. You didn't order anything. What now?",
          options: [
            {
              text: "Delete it - fake delivery scams are common",
              isCorrect: true,
              feedback: "✅ Right! These scams hope you're expecting a package and click without thinking.",
              points: 20
            },
            {
              text: "Click to check - maybe it's a gift",
              isCorrect: false,
              feedback: "❌ Scammers count on this curiosity! The link downloads malware or steals info.",
              points: 0
            },
            {
              text: "Forward it to the shipping company",
              isCorrect: false,
              feedback: "⚠️ Nice thought, but just delete it. Shipping companies know about these scams.",
              points: 5
            }
          ],
          learningPoint: "Fake delivery notifications exploit package tracking culture. Verify orders through official tracking."
        }
      ],
      "scam-buster": [
        {
          id: "1",
          title: "Tech Support Scam",
          description: "Pop-up warning about virus",
          situation: "Browser pop-up says your computer has viruses and shows a phone number to call for 'Microsoft Support'. Action?",
          options: [
            {
              text: "Close the browser and run your actual antivirus",
              isCorrect: true,
              feedback: "✅ Correct! Real virus warnings come from your antivirus software, not browser pop-ups.",
              points: 20
            },
            {
              text: "Call the number to fix the problem",
              isCorrect: false,
              feedback: "❌ Classic scam! They'll charge hundreds for fake 'fixes' and install actual malware.",
              points: 0
            },
            {
              text: "Click OK to scan",
              isCorrect: false,
              feedback: "❌ That button downloads malware! Close the browser (force quit if needed).",
              points: 0
            }
          ],
          learningPoint: "Tech support scams use fake warnings. Real companies never cold-call or pop-up asking for support."
        },
        {
          id: "2",
          title: "Romance Scam",
          description: "Online dating deception",
          situation: "Online match says they love you after 2 days and needs money for 'emergency'. Red flags?",
          options: [
            {
              text: "Extreme fast relationship + money request = scam",
              isCorrect: true,
              feedback: "✅ Textbook romance scam! Love bombing followed by financial requests. Report and block.",
              points: 20
            },
            {
              text: "They might really need help",
              isCorrect: false,
              feedback: "❌ Scammers exploit empathy. No one you just met online should ask for money. Ever.",
              points: 0
            },
            {
              text: "Ask for proof of the emergency",
              isCorrect: false,
              feedback: "⚠️ They'll provide fake 'proof'. Don't engage - report, block, and move on.",
              points: 5
            }
          ],
          learningPoint: "Romance scams use fake relationships to steal money. Never send money to people you've only met online."
        },
        {
          id: "3",
          title: "Investment Scam",
          description: "Cryptocurrency opportunity",
          situation: "Social media ad promises 'guaranteed 500% returns on crypto investment in 30 days'. Evaluation?",
          options: [
            {
              text: "Obvious scam - no investment guarantees returns",
              isCorrect: true,
              feedback: "✅ Right! Guaranteed high returns are impossible. This is a Ponzi scheme or outright theft.",
              points: 20
            },
            {
              text: "Research the company and consider investing",
              isCorrect: false,
              feedback: "❌ The 'company' is fake! Legitimate investments carry risk and never guarantee specific returns.",
              points: 0
            },
            {
              text: "Start with small investment to test it",
              isCorrect: false,
              feedback: "❌ They might pay small amounts initially to hook you, then steal larger investments. Don't engage!",
              points: 0
            }
          ],
          learningPoint: "Investment scams promise unrealistic returns. If it sounds too good to be true, it's a scam."
        },
        {
          id: "4",
          title: "Charity Scam",
          description: "Disaster relief fraud",
          situation: "After a natural disaster, you get calls asking for donations. How do you give safely?",
          options: [
            {
              text: "Research established charities and donate directly",
              isCorrect: true,
              feedback: "✅ Smart! Donate through verified charities' official websites, not unsolicited requests.",
              points: 20
            },
            {
              text: "Give to whoever calls - it's an emergency",
              isCorrect: false,
              feedback: "❌ Scammers exploit disasters! Cold callers asking for donations are often fraudulent.",
              points: 0
            },
            {
              text: "Send cash to the address they provide",
              isCorrect: false,
              feedback: "❌ Never send cash! It's untraceable and probably going to scammers, not victims.",
              points: 0
            }
          ],
          learningPoint: "Scammers exploit tragedies. Donate only to verified charities through their official channels."
        },
        {
          id: "5",
          title: "Job Offer Scam",
          description: "Work from home opportunity",
          situation: "'Get paid to work from home! Just pay $299 for training materials first.' Legitimate?",
          options: [
            {
              text: "Scam - real employers don't charge you to work",
              isCorrect: true,
              feedback: "✅ Correct! Legitimate employers pay you, they never charge fees to start working.",
              points: 20
            },
            {
              text: "Investment in career - worth paying",
              isCorrect: false,
              feedback: "❌ You'll pay the fee and never hear from them again. Real jobs don't require upfront payment.",
              points: 0
            },
            {
              text: "Negotiate a lower training fee",
              isCorrect: false,
              feedback: "❌ Any training fee is a red flag! Don't negotiate with scammers, just avoid them.",
              points: 0
            }
          ],
          learningPoint: "Employment scams charge fees for fake jobs or training. Real employers never charge employees."
        }
      ],
      "privacy-settings-master": [
        {
          id: "1",
          title: "Profile Privacy Audit",
          description: "Reviewing your social media",
          situation: "Your Facebook profile shows your phone number, address, and work history publicly. What should you do?",
          options: [
            {
              text: "Change all to 'Friends Only' or 'Only Me'",
              isCorrect: true,
              feedback: "✅ Essential! Personal contact and location info should never be public. Identity theft risk!",
              points: 20
            },
            {
              text: "It's fine - everyone does it",
              isCorrect: false,
              feedback: "❌ Dangerous normalization! This info enables stalking, identity theft, and targeted scams.",
              points: 0
            },
            {
              text: "Only hide your address",
              isCorrect: false,
              feedback: "⚠️ Better than nothing, but phone numbers and work details also enable targeting. Hide all!",
              points: 10
            }
          ],
          learningPoint: "Limit personal information visibility. Share contact details and location only with trusted friends."
        },
        {
          id: "2",
          title: "Tagging Permissions",
          description: "Control over photo tags",
          situation: "Friends keep tagging you in photos without permission. What's the best privacy approach?",
          options: [
            {
              text: "Enable tag review so you approve before tags appear",
              isCorrect: true,
              feedback: "✅ Perfect! Tag review prevents unwanted associations and maintains control over your online presence.",
              points: 20
            },
            {
              text: "Ask friends to stop tagging you",
              isCorrect: false,
              feedback: "⚠️ Relies on others remembering. Better to use platform tools to control your own privacy.",
              points: 10
            },
            {
              text: "Just untag yourself later",
              isCorrect: false,
              feedback: "❌ Reactive approach. The photo was already visible to others before you noticed and removed it.",
              points: 5
            }
          ],
          learningPoint: "Use tag review features to control your online image. Prevention is better than cleanup."
        },
        {
          id: "3",
          title: "Third-Party App Audit",
          description: "Connected applications review",
          situation: "You check connected apps and find 20+ apps you don't remember authorizing. Next step?",
          options: [
            {
              text: "Revoke access for all unrecognized or unused apps",
              isCorrect: true,
              feedback: "✅ Excellent! Old app connections are security risks. Regular audits are essential privacy hygiene.",
              points: 20
            },
            {
              text: "Leave them - they must be important",
              isCorrect: false,
              feedback: "❌ Unused apps still access your data! Many are abandoned but continue collecting information.",
              points: 0
            },
            {
              text: "Remove only apps you've never heard of",
              isCorrect: false,
              feedback: "⚠️ Even recognized apps you no longer use should be removed. Minimize your data exposure.",
              points: 10
            }
          ],
          learningPoint: "Regularly audit connected apps. Remove anything you don't actively use to minimize data sharing."
        },
        {
          id: "4",
          title: "Location Sharing",
          description: "Geotag and check-in settings",
          situation: "Your posts automatically include your exact location. What's the privacy impact?",
          options: [
            {
              text: "Disable automatic location - share manually if needed",
              isCorrect: true,
              feedback: "✅ Smart! Automatic geotagging reveals patterns (home, work) enabling stalking and burglary.",
              points: 20
            },
            {
              text: "It's convenient and everyone does it",
              isCorrect: false,
              feedback: "❌ Broadcasting your location is dangerous! Criminals can track when you're away from home.",
              points: 0
            },
            {
              text: "Only disable it at home",
              isCorrect: false,
              feedback: "⚠️ Partial solution. Your patterns (work, gym, school) also reveal routines exploitable by criminals.",
              points: 10
            }
          ],
          learningPoint: "Location data reveals your routines and whereabouts. Disable automatic sharing, add locations manually if needed."
        },
        {
          id: "5",
          title: "Data Download Request",
          description: "Understanding collected data",
          situation: "You download your Facebook data archive. It contains messages you deleted years ago. Why?",
          options: [
            {
              text: "Platforms retain 'deleted' data indefinitely",
              isCorrect: true,
              feedback: "✅ Correct! 'Delete' often means hidden from you, not actually removed. Important privacy lesson!",
              points: 20
            },
            {
              text: "It's a bug in the download tool",
              isCorrect: false,
              feedback: "❌ Not a bug - it's policy! Platforms keep vast amounts of data even after you 'delete' it.",
              points: 0
            },
            {
              text: "Deleted data is automatically restored",
              isCorrect: false,
              feedback: "❌ It was never actually deleted! Understand that 'delete' rarely means permanent removal.",
              points: 0
            }
          ],
          learningPoint: "Data you 'delete' often remains on platform servers. Assume everything you post is permanent."
        }
      ],
      "web-safety-navigator": [
        {
          id: "1",
          title: "HTTPS vs HTTP",
          description: "Secure connection identification",
          situation: "You're about to enter credit card info, but the site URL shows 'HTTP' not 'HTTPS'. What now?",
          options: [
            {
              text: "Stop immediately - never enter sensitive data on HTTP",
              isCorrect: true,
              feedback: "✅ Critical! HTTP is unencrypted. Your credit card data would be visible to anyone monitoring the network.",
              points: 20
            },
            {
              text: "It's probably fine if the site looks legitimate",
              isCorrect: false,
              feedback: "❌ Appearance doesn't matter! Without HTTPS, your data is transmitted in plain text. Extremely dangerous!",
              points: 0
            },
            {
              text: "Check if the site has good reviews first",
              isCorrect: false,
              feedback: "❌ Reviews are irrelevant if the connection isn't secure. Never send sensitive data over HTTP.",
              points: 0
            }
          ],
          learningPoint: "HTTPS encrypts data in transit. Never enter passwords, credit cards, or personal info on HTTP sites."
        },
        {
          id: "2",
          title: "Suspicious Download",
          description: "File safety assessment",
          situation: "A website automatically starts downloading 'FlashPlayer_Update.exe' when you visit. Response?",
          options: [
            {
              text: "Cancel download and scan computer for malware",
              isCorrect: true,
              feedback: "✅ Right! Auto-downloads are huge red flags. Flash is dead, this is 100% malware.",
              points: 20
            },
            {
              text: "Install it - Flash Player is important",
              isCorrect: false,
              feedback: "❌ Flash has been discontinued since 2020! This is malware disguised as a legitimate update.",
              points: 0
            },
            {
              text: "Scan the file with antivirus before installing",
              isCorrect: false,
              feedback: "⚠️ Better than installing blindly, but still risky. Auto-downloads are malware. Delete, don't scan.",
              points: 5
            }
          ],
          learningPoint: "Automatic downloads are malware delivery methods. Legitimate software doesn't auto-download without permission."
        },
        {
          id: "3",
          title: "Public WiFi Security",
          description: "Coffee shop internet usage",
          situation: "You need to check your bank account while on coffee shop WiFi. What's the safest approach?",
          options: [
            {
              text: "Use your phone's cellular data instead",
              isCorrect: true,
              feedback: "✅ Safest! Public WiFi can be monitored. Use cellular data or VPN for sensitive activities.",
              points: 20
            },
            {
              text: "Just make sure the site is HTTPS",
              isCorrect: false,
              feedback: "⚠️ HTTPS helps, but public WiFi has additional risks like fake networks and man-in-the-middle attacks.",
              points: 10
            },
            {
              text: "Public WiFi is safe for everything",
              isCorrect: false,
              feedback: "❌ Very dangerous! Public networks can be monitored, and fake 'evil twin' networks steal credentials.",
              points: 0
            }
          ],
          learningPoint: "Avoid sensitive activities on public WiFi. Use cellular data or VPN for banking and passwords."
        },
        {
          id: "4",
          title: "Browser Extension Safety",
          description: "Adding functionality to browser",
          situation: "A browser extension offers 'free VPN and ad blocking'. It has 5-star reviews but requests extensive permissions. Evaluate?",
          options: [
            {
              text: "Suspicious - excessive permissions and too-good offers",
              isCorrect: true,
              feedback: "✅ Excellent judgment! Malicious extensions can read all browsing data. Reviews can be fake.",
              points: 20
            },
            {
              text: "Great reviews mean it's trustworthy",
              isCorrect: false,
              feedback: "❌ Reviews are easily faked! Many malicious extensions have thousands of fake 5-star reviews.",
              points: 0
            },
            {
              text: "Free VPNs are always safe to use",
              isCorrect: false,
              feedback: "❌ 'Free' VPNs often sell your browsing data! If you're not paying, you're the product.",
              points: 0
            }
          ],
          learningPoint: "Browser extensions can access all your browsing data. Only install from trusted developers with minimal permissions."
        },
        {
          id: "5",
          title: "Cookie Consent",
          description: "Website tracking choices",
          situation: "Website cookie banner has 'Accept All' prominent and 'Manage Options' hidden small. Best privacy choice?",
          options: [
            {
              text: "Click 'Manage Options' and reject non-essential cookies",
              isCorrect: true,
              feedback: "✅ Privacy-conscious! Reject tracking, analytics, and advertising cookies. Only accept essential ones.",
              points: 20
            },
            {
              text: "Accept All - it's easier and expected",
              isCorrect: false,
              feedback: "❌ 'Dark pattern' design manipulates you! Taking control of cookies significantly reduces tracking.",
              points: 0
            },
            {
              text: "Close the banner without choosing",
              isCorrect: false,
              feedback: "⚠️ Many sites interpret this as 'Accept All'. Better to explicitly reject non-essential cookies.",
              points: 5
            }
          ],
          learningPoint: "Cookie banners use dark patterns to manipulate consent. Always customize settings to reject tracking cookies."
        }
      ]
    };

    return scenarioSets[gameSlug] || scenarioSets["permission-detective"];
  };

  const gameScenarios = getGameScenarios();

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      assessmentQuestions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          score += q.points;
        }
      });

      if (phase === "pre-assessment") {
        setPreScore(score);
        setPhase("game");
        setCurrentScenarioIndex(0);
        setAnswers({});
      } else if (phase === "post-assessment") {
        setPostScore(score);
        setPhase("results");
      }
    }
  };

  const handleScenarioChoice = (optionIndex: number) => {
    const scenario = gameScenarios[currentScenarioIndex];
    const option = scenario.options[optionIndex];
    
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    setScenarioAnswers((prev) => ({
      ...prev,
      [currentScenarioIndex]: option.isCorrect
    }));
    setGameScore((prev) => prev + option.points);
  };

  const handleNextScenario = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    
    if (currentScenarioIndex < gameScenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
    } else {
      setPhase("post-assessment");
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  const calculateImprovement = () => {
    const maxScore = assessmentQuestions.length * 10;
    const prePercentage = (preScore / maxScore) * 100;
    const postPercentage = (postScore / maxScore) * 100;
    return Math.round(postPercentage - prePercentage);
  };

  const saveGameResults = async () => {
    if (!user) return;
    
    try {
      await fetch("/api/games/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          category,
          gameSlug,
          preScore,
          gameScore,
          postScore,
          improvement: calculateImprovement(),
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Intro Phase
  if (phase === "intro") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-purple-500">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">
                {gameSlug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </CardTitle>
              <CardDescription className="text-base">
                Master cybersecurity through interactive scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  How This Works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-semibold">Pre-Assessment (3 questions)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Test your current knowledge level</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-semibold">Interactive Game ({gameScenarios.length} scenarios)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Make decisions in real-world situations</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-semibold">Post-Assessment (3 questions)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Measure your improvement</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Earn Points</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Based on your decisions</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Track Growth</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">See your improvement</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/games")} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Button>
                <Button 
                  onClick={() => setPhase("pre-assessment")} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Game
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pre/Post Assessment Phase
  if (phase === "pre-assessment" || phase === "post-assessment") {
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    const isPreAssessment = phase === "pre-assessment";

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                {isPreAssessment ? "Pre-Assessment" : "Post-Assessment"}
              </h2>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestionIndex] === idx
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestionIndex] === idx
                        ? "border-purple-600 bg-purple-600"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}>
                      {answers[currentQuestionIndex] === idx && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={answers[currentQuestionIndex] === undefined}
                  className="flex-1"
                >
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? "Finish Assessment" : "Next Question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Game Phase
  if (phase === "game") {
    const currentScenario = gameScenarios[currentScenarioIndex];
    const progress = ((currentScenarioIndex + 1) / gameScenarios.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Interactive Game
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Scenario {currentScenarioIndex + 1} of {gameScenarios.length}
                </span>
                <span className="font-bold text-purple-600">
                  {gameScore} points
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-2 border-purple-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">{currentScenario.title}</span>
              </div>
              <CardTitle className="text-2xl">{currentScenario.description}</CardTitle>
              <CardDescription className="text-base mt-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                {currentScenario.situation}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showFeedback ? (
                <>
                  <p className="font-semibold">What would you do?</p>
                  <div className="space-y-3">
                    {currentScenario.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleScenarioChoice(idx)}
                        className="w-full text-left p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {selectedOption !== null && (
                    <div className={`p-6 rounded-lg ${
                      currentScenario.options[selectedOption].isCorrect
                        ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500"
                        : "bg-red-50 dark:bg-red-950/20 border-2 border-red-500"
                    }`}>
                      <p className="text-lg font-semibold mb-2">
                        {currentScenario.options[selectedOption].feedback}
                      </p>
                      <p className="text-sm">
                        Points earned: <span className="font-bold">{currentScenario.options[selectedOption].points}</span>
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-500">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Learning Point
                    </p>
                    <p className="text-sm">{currentScenario.learningPoint}</p>
                  </div>

                  <Button onClick={handleNextScenario} className="w-full" size="lg">
                    {currentScenarioIndex === gameScenarios.length - 1 ? "Continue to Post-Assessment" : "Next Scenario"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === "results") {
    const maxScore = assessmentQuestions.length * 10;
    const improvement = calculateImprovement();
    const prePercentage = (preScore / maxScore) * 100;
    const postPercentage = (postScore / maxScore) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">Game Complete!</CardTitle>
              <CardDescription className="text-base">
                Great job! Here's how you improved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Pre-Assessment</p>
                  <p className="text-3xl font-bold">{Math.round(prePercentage)}%</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{preScore}/{maxScore} points</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Game Score</p>
                  <p className="text-3xl font-bold text-purple-600">{gameScore}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">points earned</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Post-Assessment</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(postPercentage)}%</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{postScore}/{maxScore} points</p>
                </div>
              </div>

              <div className={`p-6 rounded-lg text-center ${
                improvement > 0 
                  ? "bg-green-100 dark:bg-green-900/20 border-2 border-green-500"
                  : improvement < 0
                  ? "bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-500"
                  : "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500"
              }`}>
                <TrendingUp className={`h-12 w-12 mx-auto mb-3 ${
                  improvement > 0 ? "text-green-600" : improvement < 0 ? "text-orange-600" : "text-blue-600"
                }`} />
                <p className="text-2xl font-bold mb-2">
                  {improvement > 0 ? "+" : ""}{improvement}% Improvement
                </p>
                <p className="text-sm">
                  {improvement > 0 
                    ? "Excellent progress! You've significantly improved your knowledge."
                    : improvement < 0
                    ? "Keep practicing! Review the learning points and try again."
                    : "You maintained your knowledge level. Try more challenging scenarios!"}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-500">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold">Gamification Points Earned</p>
                </div>
                <p className="text-3xl font-bold text-amber-600 mb-1">
                  {Math.round((preScore + gameScore + postScore) * 1.5)} points
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Added to your total score for leaderboard ranking
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/games")} className="flex-1">
                  Back to Games
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="flex-1">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
