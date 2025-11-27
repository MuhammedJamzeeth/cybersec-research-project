"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Zap,
} from "lucide-react";

interface GamePageProps {
  params: Promise<{
    category: string;
    gameSlug: string;
  }>;
}

type GamePhase =
  | "intro"
  | "pre-assessment"
  | "game"
  | "post-assessment"
  | "results";

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
  const [scenarioAnswers, setScenarioAnswers] = useState<
    Record<number, boolean>
  >({});
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
            "Access to storage",
          ],
          correctAnswer: 2,
          explanation:
            "Device administrator rights give apps extensive control over your device and can be used maliciously.",
          points: 10,
        },
        {
          id: "2",
          question: "When should you review app permissions?",
          options: [
            "Only when installing the app",
            "Never, they're automatically safe",
            "Regularly, and before installing",
            "Only if the app crashes",
          ],
          correctAnswer: 2,
          explanation:
            "Regular review helps you maintain control over your data and privacy.",
          points: 10,
        },
        {
          id: "3",
          question:
            "A flashlight app requests access to your contacts. What should you do?",
          options: [
            "Accept it, all apps need contacts",
            "Deny it, a flashlight doesn't need contacts",
            "Only accept if it's a popular app",
            "Ask your friends first",
          ],
          correctAnswer: 1,
          explanation:
            "Apps should only request permissions necessary for their function. A flashlight doesn't need contacts.",
          points: 10,
        },
      ],
      "secure-app-builder": [
        {
          id: "1",
          question: "Which permission model provides the best security?",
          options: [
            "Request all permissions at install",
            "Request permissions when needed (runtime)",
            "Assume all permissions by default",
            "Never ask for permissions",
          ],
          correctAnswer: 1,
          explanation:
            "Runtime permissions allow users to grant access only when needed, providing better control and transparency.",
          points: 10,
        },
        {
          id: "2",
          question:
            "What should developers do before requesting a sensitive permission?",
          options: [
            "Just request it without explanation",
            "Provide clear context about why it's needed",
            "Hide the permission request in settings",
            "Request it only after the app is installed",
          ],
          correctAnswer: 1,
          explanation:
            "Transparency builds trust. Developers should explain why sensitive permissions are necessary.",
          points: 10,
        },
        {
          id: "3",
          question:
            "What's the principle of 'least privilege' in app permissions?",
          options: [
            "Apps should request the minimum permissions needed",
            "Apps should have no permissions at all",
            "Users should grant all permissions",
            "Only system apps need permissions",
          ],
          correctAnswer: 0,
          explanation:
            "Least privilege means apps should only request permissions absolutely necessary for their core functionality.",
          points: 10,
        },
      ],
      "privacy-defender": [
        {
          id: "1",
          question: "What is a permission abuse red flag?",
          options: [
            "An app requesting many unrelated permissions",
            "An app asking for camera access",
            "An app requiring internet connection",
            "An app needing storage access",
          ],
          correctAnswer: 0,
          explanation:
            "When apps request numerous permissions unrelated to their function, it's a major warning sign.",
          points: 10,
        },
        {
          id: "2",
          question: "How can you protect against malicious apps?",
          options: [
            "Install from official app stores only",
            "Download from any website",
            "Disable all security warnings",
            "Grant all permissions quickly",
          ],
          correctAnswer: 0,
          explanation:
            "Official app stores have security measures and vetting processes to reduce malicious apps.",
          points: 10,
        },
        {
          id: "3",
          question:
            "What should you do if an app's permissions change suspiciously?",
          options: [
            "Ignore it and continue using",
            "Review the changes and consider uninstalling",
            "Grant all new permissions",
            "Restart your device",
          ],
          correctAnswer: 1,
          explanation:
            "Suspicious permission changes may indicate the app has been compromised or updated maliciously.",
          points: 10,
        },
      ],
      "password-strength-trainer": [
        {
          id: "1",
          question: "What makes a password strong?",
          options: [
            "Using your birthday",
            "Length, complexity, and uniqueness",
            "Using common words",
            "Keeping it short for easy memory",
          ],
          correctAnswer: 1,
          explanation:
            "Strong passwords combine length (12+ characters), mix of character types, and are unique to each account.",
          points: 10,
        },
        {
          id: "2",
          question: "How often should you change critical passwords?",
          options: [
            "Never change them",
            "Every day",
            "When compromised or every 90 days",
            "Only when you forget them",
          ],
          correctAnswer: 2,
          explanation:
            "Regular changes reduce risk, but changing too often can lead to weaker passwords. Balance is key.",
          points: 10,
        },
        {
          id: "3",
          question: "What's the safest way to store passwords?",
          options: [
            "Write them on sticky notes",
            "Use a reputable password manager",
            "Save them in a text file",
            "Email them to yourself",
          ],
          correctAnswer: 1,
          explanation:
            "Password managers use encryption and secure storage to protect your credentials.",
          points: 10,
        },
      ],
      "breach-defense": [
        {
          id: "1",
          question: "What is two-factor authentication (2FA)?",
          options: [
            "Using two different passwords",
            "A second verification method beyond password",
            "Logging in twice",
            "Having two user accounts",
          ],
          correctAnswer: 1,
          explanation:
            "2FA adds an extra security layer by requiring something you know (password) and something you have (phone/token).",
          points: 10,
        },
        {
          id: "2",
          question:
            "What should you do if you discover your password in a data breach?",
          options: [
            "Wait and see if anything happens",
            "Change it immediately and enable 2FA",
            "Delete your account",
            "Ignore it if you haven't noticed problems",
          ],
          correctAnswer: 1,
          explanation:
            "Immediate action prevents attackers from exploiting the compromised password. 2FA adds extra protection.",
          points: 10,
        },
        {
          id: "3",
          question: "What makes password reuse dangerous?",
          options: [
            "It's hard to remember",
            "One breach compromises all accounts",
            "It's against the law",
            "Websites don't allow it",
          ],
          correctAnswer: 1,
          explanation:
            "If one site is breached, attackers try those credentials on other sites (credential stuffing).",
          points: 10,
        },
      ],
      "email-detective": [
        {
          id: "1",
          question: "What's a common sign of a phishing email?",
          options: [
            "Proper grammar and spelling",
            "Urgent language and threats",
            "Personalized greeting",
            "Clear sender information",
          ],
          correctAnswer: 1,
          explanation:
            "Phishing emails often create urgency to make you act without thinking critically.",
          points: 10,
        },
        {
          id: "2",
          question: "How can you verify a suspicious link?",
          options: [
            "Click it to see where it goes",
            "Hover over it to preview the URL",
            "Forward it to friends",
            "Reply asking if it's safe",
          ],
          correctAnswer: 1,
          explanation:
            "Hovering reveals the actual URL without clicking, helping you spot mismatched or suspicious domains.",
          points: 10,
        },
        {
          id: "3",
          question: "What should you do with suspected phishing emails?",
          options: [
            "Delete them immediately",
            "Report them and then delete",
            "Reply telling them it's a scam",
            "Forward to all your contacts",
          ],
          correctAnswer: 1,
          explanation:
            "Reporting helps email providers improve filters and protects other users from the same scam.",
          points: 10,
        },
      ],
      "scam-buster": [
        {
          id: "1",
          question: "What is 'spoofing' in phishing attacks?",
          options: [
            "Making fun of someone",
            "Disguising sender identity to appear legitimate",
            "Sending spam emails",
            "Creating fake websites",
          ],
          correctAnswer: 1,
          explanation:
            "Spoofing makes malicious emails appear to come from trusted sources like banks or colleagues.",
          points: 10,
        },
        {
          id: "2",
          question: "A prince offers you millions via email. What is this?",
          options: [
            "A lucky opportunity",
            "An advance-fee scam",
            "A legitimate inheritance",
            "A prize you won",
          ],
          correctAnswer: 1,
          explanation:
            "These 'Nigerian prince' scams are advance-fee frauds requiring you to pay money upfront for fake rewards.",
          points: 10,
        },
        {
          id: "3",
          question: "What's 'spear phishing'?",
          options: [
            "Phishing with a weapon",
            "Targeted phishing using personal information",
            "Random mass email scams",
            "Fishing for compliments",
          ],
          correctAnswer: 1,
          explanation:
            "Spear phishing uses researched personal details to make attacks more convincing and targeted.",
          points: 10,
        },
      ],
      "privacy-settings-master": [
        {
          id: "1",
          question:
            "What's the safest default privacy setting for social media posts?",
          options: [
            "Public",
            "Friends only",
            "Friends of friends",
            "Everyone on the internet",
          ],
          correctAnswer: 1,
          explanation:
            "Limiting to friends reduces exposure to strangers, data scrapers, and malicious actors.",
          points: 10,
        },
        {
          id: "2",
          question:
            "Should you allow apps to access your social media profile?",
          options: [
            "Always yes",
            "Only from trusted, necessary apps",
            "Never",
            "Only for games",
          ],
          correctAnswer: 1,
          explanation:
            "Third-party app access can leak your data. Only grant to apps you trust and need.",
          points: 10,
        },
        {
          id: "3",
          question:
            "What information should you avoid sharing publicly on social media?",
          options: [
            "Your hobbies",
            "Your home address and phone number",
            "Your favorite movies",
            "Photos of your lunch",
          ],
          correctAnswer: 1,
          explanation:
            "Personal contact information can be used for identity theft, stalking, or targeted attacks.",
          points: 10,
        },
      ],
      "web-safety-navigator": [
        {
          id: "1",
          question: "What does 'HTTPS' indicate about a website?",
          options: [
            "It's fast",
            "It encrypts data transmission",
            "It's free",
            "It has good design",
          ],
          correctAnswer: 1,
          explanation:
            "HTTPS encrypts data between your browser and the website, protecting against eavesdropping.",
          points: 10,
        },
        {
          id: "2",
          question: "What's a browser 'cookie'?",
          options: [
            "A snack for programmers",
            "Data stored by websites to track you",
            "A computer virus",
            "A security certificate",
          ],
          correctAnswer: 1,
          explanation:
            "Cookies store information about your browsing to track activity and preferences across visits.",
          points: 10,
        },
        {
          id: "3",
          question: "Why should you use private/incognito browsing mode?",
          options: [
            "It makes internet faster",
            "It prevents local history/cookie storage",
            "It makes you completely anonymous",
            "It blocks all ads",
          ],
          correctAnswer: 1,
          explanation:
            "Private mode prevents local storage of history and cookies, but doesn't make you anonymous online.",
          points: 10,
        },
      ],
      // Phishing games
      "phishing-detective": [
        {
          id: "1",
          question: "What's the first thing to check in a suspicious email?",
          options: [
            "The subject line",
            "The sender's email address",
            "The signature",
            "The font style",
          ],
          correctAnswer: 1,
          explanation:
            "Verify the sender's email domain matches the claimed organization. Phishers often use similar-looking domains.",
          points: 10,
        },
        {
          id: "2",
          question:
            "An email claims your account will be closed unless you click a link. What is this?",
          options: [
            "Important notification",
            "Urgency tactic (phishing)",
            "Standard procedure",
            "Customer service",
          ],
          correctAnswer: 1,
          explanation:
            "Creating false urgency is a classic phishing tactic to bypass your critical thinking.",
          points: 10,
        },
        {
          id: "3",
          question:
            "How can you safely check if an email from your bank is real?",
          options: [
            "Click the link in the email",
            "Call the bank using a number from their official website",
            "Reply to the email asking",
            "Forward it to friends",
          ],
          correctAnswer: 1,
          explanation:
            "Always verify through official channels, never use contact info from the suspicious email.",
          points: 10,
        },
      ],
      "email-security-challenge": [
        {
          id: "1",
          question: "What is email header analysis used for?",
          options: [
            "Reading the subject line",
            "Verifying the true sender and routing path",
            "Checking grammar",
            "Counting recipients",
          ],
          correctAnswer: 1,
          explanation:
            "Email headers reveal the actual sender IP and routing information, helping identify spoofing.",
          points: 10,
        },
        {
          id: "2",
          question: "What does SPF, DKIM, and DMARC protect against?",
          options: [
            "Spam",
            "Email spoofing and phishing",
            "Large attachments",
            "Slow loading",
          ],
          correctAnswer: 1,
          explanation:
            "These email authentication protocols verify sender legitimacy and prevent domain spoofing.",
          points: 10,
        },
        {
          id: "3",
          question:
            "An attachment is named 'invoice.pdf.exe'. What's the danger?",
          options: [
            "It's a safe PDF",
            "The .exe makes it executable malware",
            "It's too large",
            "It's password protected",
          ],
          correctAnswer: 1,
          explanation:
            "Double extensions hide malicious executables. Windows hides known extensions by default.",
          points: 10,
        },
      ],
      // Password games
      "password-fortress": [
        {
          id: "1",
          question: "What's the minimum recommended password length?",
          options: [
            "6 characters",
            "8 characters",
            "12 characters",
            "16 characters",
          ],
          correctAnswer: 2,
          explanation:
            "12+ characters significantly increase cracking time. Longer is always better for security.",
          points: 10,
        },
        {
          id: "2",
          question: "What's a passphrase?",
          options: [
            "A secret question",
            "A long password made of multiple words",
            "A password hint",
            "A PIN code",
          ],
          correctAnswer: 1,
          explanation:
            "Passphrases like 'CorrectHorseBatteryStaple' are long, memorable, and secure.",
          points: 10,
        },
        {
          id: "3",
          question: "Why shouldn't you use dictionary words as passwords?",
          options: [
            "They're too common",
            "They're vulnerable to dictionary attacks",
            "They're hard to type",
            "Websites don't allow them",
          ],
          correctAnswer: 1,
          explanation:
            "Attackers use dictionaries of common words to systematically crack passwords quickly.",
          points: 10,
        },
      ],
      "credential-guardian": [
        {
          id: "1",
          question: "What's the main benefit of a password manager?",
          options: [
            "Free internet",
            "Unique strong passwords for every account",
            "Faster browsing",
            "Antivirus protection",
          ],
          correctAnswer: 1,
          explanation:
            "Password managers generate and store unique complex passwords, eliminating reuse risks.",
          points: 10,
        },
        {
          id: "2",
          question: "Which 2FA method is most secure?",
          options: [
            "SMS codes",
            "Hardware security keys",
            "Email codes",
            "Security questions",
          ],
          correctAnswer: 1,
          explanation:
            "Hardware keys (FIDO2/U2F) are phishing-resistant and not vulnerable to SIM swapping.",
          points: 10,
        },
        {
          id: "3",
          question: "How often should you audit your saved passwords?",
          options: [
            "Never",
            "Quarterly to check for reuse and breaches",
            "Only when you forget one",
            "Daily",
          ],
          correctAnswer: 1,
          explanation:
            "Regular audits help identify weak, reused, or breached passwords before attackers exploit them.",
          points: 10,
        },
      ],
      // Social engineering games
      "social-engineering-defense": [
        {
          id: "1",
          question: "What is 'pretexting' in social engineering?",
          options: [
            "Writing before calling",
            "Creating a fabricated scenario to extract information",
            "Sending a prewritten email",
            "Testing security systems",
          ],
          correctAnswer: 1,
          explanation:
            "Pretexting involves inventing a scenario (false identity/situation) to gain trust and extract sensitive data.",
          points: 10,
        },
        {
          id: "2",
          question:
            "A caller claims to be IT support needing your password. What do you do?",
          options: [
            "Give it to them",
            "Refuse and verify through official IT channels",
            "Give them a fake password",
            "Hang up and ignore",
          ],
          correctAnswer: 1,
          explanation:
            "Legitimate IT never asks for passwords. Always verify through known official contact methods.",
          points: 10,
        },
        {
          id: "3",
          question: "What is 'tailgating' in physical security?",
          options: [
            "Following too close while driving",
            "Following someone through a secure door without authorization",
            "Stalking on social media",
            "Reading over someone's shoulder",
          ],
          correctAnswer: 1,
          explanation:
            "Tailgating exploits courtesy to gain unauthorized physical access to secure areas.",
          points: 10,
        },
      ],
      "manipulation-awareness": [
        {
          id: "1",
          question: "What psychological principle do scammers exploit most?",
          options: ["Fear and urgency", "Intelligence", "Honesty", "Patience"],
          correctAnswer: 0,
          explanation:
            "Fear and urgency bypass rational thinking, making people act impulsively without verification.",
          points: 10,
        },
        {
          id: "2",
          question: "What is 'quid pro quo' social engineering?",
          options: [
            "Equal exchange",
            "Offering service/benefit in exchange for information",
            "Latin phrases",
            "Free gifts",
          ],
          correctAnswer: 1,
          explanation:
            "Attackers offer something (tech support, prizes) in exchange for credentials or access.",
          points: 10,
        },
        {
          id: "3",
          question: "How do social engineers research targets?",
          options: [
            "Guessing",
            "Mining social media and public records",
            "Magic",
            "Random selection",
          ],
          correctAnswer: 1,
          explanation:
            "Open-source intelligence (OSINT) from social media provides details for convincing attacks.",
          points: 10,
        },
      ],
      // Device security games
      "device-lockdown": [
        {
          id: "1",
          question: "What's the most important device security feature?",
          options: [
            "Screen protector",
            "Strong lock screen (PIN/biometric)",
            "Custom wallpaper",
            "Loud ringtone",
          ],
          correctAnswer: 1,
          explanation:
            "Lock screens prevent unauthorized physical access to your data if device is lost or stolen.",
          points: 10,
        },
        {
          id: "2",
          question: "Why should you encrypt your device storage?",
          options: [
            "Makes it faster",
            "Protects data if device is stolen",
            "Saves battery",
            "Increases storage space",
          ],
          correctAnswer: 1,
          explanation:
            "Encryption makes data unreadable without the decryption key, protecting against theft.",
          points: 10,
        },
        {
          id: "3",
          question: "What should you do before selling your old device?",
          options: [
            "Delete some files",
            "Factory reset and verify data is wiped",
            "Just remove the SIM card",
            "Clean the screen",
          ],
          correctAnswer: 1,
          explanation:
            "Factory reset removes personal data. Some devices need additional secure wipe procedures.",
          points: 10,
        },
      ],
      "security-settings-master": [
        {
          id: "1",
          question: "What does 'automatic updates' protect against?",
          options: [
            "Running out of storage",
            "Exploits of known vulnerabilities",
            "Battery drain",
            "Slow performance",
          ],
          correctAnswer: 1,
          explanation:
            "Updates patch security flaws. Automatic updates ensure you're protected quickly.",
          points: 10,
        },
        {
          id: "2",
          question: "Why disable Bluetooth when not in use?",
          options: [
            "Saves battery and reduces attack surface",
            "Makes phone lighter",
            "Improves call quality",
            "Increases internet speed",
          ],
          correctAnswer: 0,
          explanation:
            "Active Bluetooth can be exploited for tracking and attacks. Disable when unnecessary.",
          points: 10,
        },
        {
          id: "3",
          question: "What is 'Find My Device' feature for?",
          options: [
            "GPS navigation",
            "Locating, locking, or wiping lost devices remotely",
            "Finding friends",
            "Store locator",
          ],
          correctAnswer: 1,
          explanation:
            "These services help recover lost devices or protect data by remote lock/wipe.",
          points: 10,
        },
      ],
      "security-fundamentals": [
        {
          id: "1",
          question: "What is the security triad (CIA)?",
          options: [
            "Central Intelligence Agency",
            "Confidentiality, Integrity, Availability",
            "Computer Internet Access",
            "Cyber Investigation Agency",
          ],
          correctAnswer: 1,
          explanation:
            "CIA principles ensure data is protected, accurate, and accessible to authorized users.",
          points: 10,
        },
        {
          id: "2",
          question: "What's defense in depth?",
          options: [
            "One strong security measure",
            "Multiple layers of security controls",
            "Deep password complexity",
            "Underground data centers",
          ],
          correctAnswer: 1,
          explanation:
            "Layered security means if one control fails, others provide backup protection.",
          points: 10,
        },
        {
          id: "3",
          question: "What is zero-trust security model?",
          options: [
            "Trust no one, verify everything",
            "Don't trust any technology",
            "Never use passwords",
            "Block all internet access",
          ],
          correctAnswer: 0,
          explanation:
            "Zero-trust requires continuous verification regardless of location or previous authentication.",
          points: 10,
        },
      ],
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
          situation:
            "A calculator app is requesting permission to access your SMS messages, contacts, and camera. What should you do?",
          options: [
            {
              text: "Accept all permissions - it's just a calculator",
              isCorrect: false,
              feedback:
                "❌ Red flag! A calculator has no legitimate need for SMS, contacts, or camera access. This could be malware trying to steal your data.",
              points: 0,
            },
            {
              text: "Deny all permissions and don't install the app",
              isCorrect: true,
              feedback:
                "✅ Excellent decision! These permissions are completely unnecessary for a calculator and indicate malicious intent.",
              points: 20,
            },
            {
              text: "Only accept camera permission",
              isCorrect: false,
              feedback:
                "⚠️ Still risky! A calculator doesn't need camera access. Look for a more trustworthy alternative.",
              points: 5,
            },
          ],
          learningPoint:
            "Always verify that requested permissions match the app's stated function. Unnecessary permissions are a major red flag.",
        },
        {
          id: "2",
          title: "Weather App Investigation",
          description: "Reviewing a weather app's permissions",
          situation:
            "A weather app requests location, internet, and your call logs. Which permissions are suspicious?",
          options: [
            {
              text: "All are necessary for weather apps",
              isCorrect: false,
              feedback:
                "❌ Call logs have nothing to do with weather! This is data harvesting.",
              points: 0,
            },
            {
              text: "Only call logs are suspicious",
              isCorrect: true,
              feedback:
                "✅ Exactly right! Location and internet make sense for weather, but call logs don't.",
              points: 20,
            },
            {
              text: "Location and internet are suspicious",
              isCorrect: false,
              feedback:
                "⚠️ These are actually needed! Location shows local weather, internet downloads forecasts.",
              points: 5,
            },
          ],
          learningPoint:
            "Learn to distinguish between functional permissions and data mining. Context is everything.",
        },
        {
          id: "3",
          title: "Game Permission Analysis",
          description: "A new mobile game wants access",
          situation:
            "A puzzle game requests storage, internet, and contacts access. What's your assessment?",
          options: [
            {
              text: "Storage and internet OK, contacts suspicious",
              isCorrect: true,
              feedback:
                "✅ Perfect analysis! Games need storage for saves and internet for updates, but not contacts.",
              points: 20,
            },
            {
              text: "All permissions are fine for games",
              isCorrect: false,
              feedback:
                "❌ Why would a puzzle game need your contacts? This is invasive.",
              points: 0,
            },
            {
              text: "Only storage is acceptable",
              isCorrect: false,
              feedback:
                "⚠️ Internet access is normal for games (updates, ads). The issue is contacts access.",
              points: 10,
            },
          ],
          learningPoint:
            "Games legitimately need some permissions, but personal data access like contacts is a red flag.",
        },
        {
          id: "4",
          title: "Flashlight App Red Flags",
          description: "Installing a simple flashlight app",
          situation:
            "A flashlight app wants device ID, location, and camera. Your verdict?",
          options: [
            {
              text: "Camera is fine, others are excessive",
              isCorrect: false,
              feedback:
                "⚠️ Camera makes sense for the flash, but device ID and location are unnecessary tracking.",
              points: 10,
            },
            {
              text: "Only camera should be granted",
              isCorrect: true,
              feedback:
                "✅ Correct! Camera accesses the flash. The others are for tracking and advertising.",
              points: 20,
            },
            {
              text: "Accept all - it's a simple app",
              isCorrect: false,
              feedback:
                "❌ Simple apps shouldn't need extensive permissions. This is a privacy violation.",
              points: 0,
            },
          ],
          learningPoint:
            "Even 'simple' apps can hide complex data collection schemes. Scrutinize every permission.",
        },
        {
          id: "5",
          title: "Note-Taking App Audit",
          description: "Evaluating a productivity app",
          situation:
            "A note-taking app requests storage, microphone, camera, and phone calls. What's appropriate?",
          options: [
            {
              text: "Storage, microphone, and camera only",
              isCorrect: true,
              feedback:
                "✅ Well reasoned! Storage for notes, microphone for voice notes, camera for photos. Phone calls aren't needed.",
              points: 20,
            },
            {
              text: "All permissions are needed",
              isCorrect: false,
              feedback:
                "❌ Phone call access is completely unrelated to note-taking. Major privacy concern!",
              points: 0,
            },
            {
              text: "Only storage is necessary",
              isCorrect: false,
              feedback:
                "⚠️ Modern note apps often include voice and photo features, so those permissions make sense.",
              points: 10,
            },
          ],
          learningPoint:
            "Consider what features an app offers. Voice memos and photo capture justify certain permissions.",
        },
      ],
      "secure-app-builder": [
        {
          id: "1",
          title: "Messaging App Design",
          description: "Building a secure messaging app",
          situation:
            "You're designing a messaging app. Which permission strategy is best?",
          options: [
            {
              text: "Request all permissions upfront at install",
              isCorrect: false,
              feedback:
                "❌ Overwhelming users with all permissions at once creates distrust and confusion.",
              points: 0,
            },
            {
              text: "Request permissions contextually when features are used",
              isCorrect: true,
              feedback:
                "✅ Perfect! Runtime permissions with context create transparency and user trust.",
              points: 20,
            },
            {
              text: "Hide permissions in settings menu",
              isCorrect: false,
              feedback:
                "❌ Deceptive practices damage trust and may violate app store policies.",
              points: 0,
            },
          ],
          learningPoint:
            "Best practice is contextual permission requests with clear explanations of why they're needed.",
        },
        {
          id: "2",
          title: "Photo Gallery App",
          description: "Creating a photo browsing app",
          situation:
            "Your photo gallery app needs access to images. How do you implement this securely?",
          options: [
            {
              text: "Request full storage access at startup",
              isCorrect: false,
              feedback:
                "⚠️ Too broad! Use scoped storage to access only photos, not all files.",
              points: 10,
            },
            {
              text: "Use scoped storage for photo access only",
              isCorrect: true,
              feedback:
                "✅ Excellent! Scoped storage limits access to only what's needed, following least privilege.",
              points: 20,
            },
            {
              text: "Access all files without asking",
              isCorrect: false,
              feedback:
                "❌ Illegal and unethical! Always request permissions and respect user privacy.",
              points: 0,
            },
          ],
          learningPoint:
            "Modern platforms offer scoped storage to access only necessary files, not entire filesystems.",
        },
        {
          id: "3",
          title: "Fitness App Architecture",
          description: "Designing a fitness tracker",
          situation:
            "Your fitness app needs location data for tracking runs. How should you request it?",
          options: [
            {
              text: "Request 'always allow' location access",
              isCorrect: false,
              feedback:
                "⚠️ Privacy invasive! Only request 'always allow' if absolutely necessary with clear justification.",
              points: 5,
            },
            {
              text: "Request 'while using app' with upgrade option",
              isCorrect: true,
              feedback:
                "✅ Perfect balance! Start with minimal access, explain benefits of 'always allow' for background tracking.",
              points: 20,
            },
            {
              text: "Track location without telling users",
              isCorrect: false,
              feedback:
                "❌ Illegal and destroys trust! Transparency is essential for ethical app development.",
              points: 0,
            },
          ],
          learningPoint:
            "Offer tiered permission access. Start minimal, explain benefits of expanded access clearly.",
        },
        {
          id: "4",
          title: "Social Media Integration",
          description: "Adding social features",
          situation:
            "Users want to share content to social media. What data should you access?",
          options: [
            {
              text: "Only the specific content being shared",
              isCorrect: true,
              feedback:
                "✅ Respect privacy! Access only what's necessary for the specific action.",
              points: 20,
            },
            {
              text: "All user's social media data for better integration",
              isCorrect: false,
              feedback:
                "❌ Excessive! This violates privacy and trust. Only access what's needed for sharing.",
              points: 0,
            },
            {
              text: "Read all posts to suggest sharing times",
              isCorrect: false,
              feedback:
                "⚠️ Feature creep! Don't justify broad access with unnecessary features.",
              points: 5,
            },
          ],
          learningPoint:
            "Feature complexity doesn't justify privacy invasion. Keep data access minimal and purposeful.",
        },
        {
          id: "5",
          title: "Payment Processing",
          description: "Implementing in-app purchases",
          situation:
            "You need to process payments securely. What's the best approach?",
          options: [
            {
              text: "Use platform payment APIs (Google Play, App Store)",
              isCorrect: true,
              feedback:
                "✅ Smart! Platform APIs handle sensitive data securely without you storing payment info.",
              points: 20,
            },
            {
              text: "Store credit card info in your database",
              isCorrect: false,
              feedback:
                "❌ Extremely dangerous! This violates PCI compliance and creates massive liability.",
              points: 0,
            },
            {
              text: "Request permission to access banking apps",
              isCorrect: false,
              feedback:
                "❌ Unnecessary and suspicious! Use proper payment processing channels.",
              points: 0,
            },
          ],
          learningPoint:
            "Never handle sensitive financial data directly. Use established, secure payment processing services.",
        },
      ],
      "privacy-defender": [
        {
          id: "1",
          title: "Malware Detection",
          description: "Suspicious app behavior detected",
          situation:
            "An installed app starts requesting new permissions it didn't need before. What's your move?",
          options: [
            {
              text: "Uninstall immediately and scan device",
              isCorrect: true,
              feedback:
                "✅ Smart defense! Sudden permission changes suggest compromise or malicious update.",
              points: 20,
            },
            {
              text: "Grant permissions to see what happens",
              isCorrect: false,
              feedback:
                "❌ Never experiment with suspicious apps! You're giving malware what it wants.",
              points: 0,
            },
            {
              text: "Disable internet and investigate",
              isCorrect: false,
              feedback:
                "⚠️ Better than granting permissions, but uninstalling is safer. Malware may already have data.",
              points: 10,
            },
          ],
          learningPoint:
            "Unexpected permission requests are major warning signs. Remove the app and scan for malware.",
        },
        {
          id: "2",
          title: "Data Exfiltration Alert",
          description: "Unusual data usage detected",
          situation:
            "A simple game is using massive background data. What's likely happening?",
          options: [
            {
              text: "It's uploading your personal data",
              isCorrect: true,
              feedback:
                "✅ Correct diagnosis! Simple games shouldn't use much data. This is data theft.",
              points: 20,
            },
            {
              text: "Games need lots of data for updates",
              isCorrect: false,
              feedback:
                "❌ Updates happen occasionally, not constantly. This is suspicious behavior.",
              points: 0,
            },
            {
              text: "It's normal for all apps",
              isCorrect: false,
              feedback:
                "❌ Background data usage should be minimal. This indicates malicious activity.",
              points: 0,
            },
          ],
          learningPoint:
            "Monitor app data usage. Excessive background activity suggests data exfiltration or malware.",
        },
        {
          id: "3",
          title: "Phishing App",
          description: "Fake banking app discovered",
          situation:
            "You find two similar banking apps in the store. One has fewer downloads and typos. What do you do?",
          options: [
            {
              text: "Download the one with typos - it's newer",
              isCorrect: false,
              feedback:
                "❌ Typos indicate a phishing app impersonating your bank! Major danger.",
              points: 0,
            },
            {
              text: "Report the suspicious one and use official app",
              isCorrect: true,
              feedback:
                "✅ Excellent! Fake apps steal credentials. Report them to protect others.",
              points: 20,
            },
            {
              text: "Try both to see which works better",
              isCorrect: false,
              feedback:
                "❌ Never enter real credentials in suspicious apps! You'd give attackers your account.",
              points: 0,
            },
          ],
          learningPoint:
            "Verify app authenticity before downloading. Check developer name, reviews, and download counts.",
        },
        {
          id: "4",
          title: "Permission Abuse",
          description: "App accessing camera secretly",
          situation:
            "Your notification shows an app accessing your camera when you're not using it. Response?",
          options: [
            {
              text: "Revoke permissions and uninstall the app",
              isCorrect: true,
              feedback:
                "✅ Perfect! Secret access is malicious behavior. Remove and report the app.",
              points: 20,
            },
            {
              text: "Assume it's a bug and ignore",
              isCorrect: false,
              feedback:
                "❌ 'Bugs' don't randomly activate cameras. This is spyware behavior!",
              points: 0,
            },
            {
              text: "Cover your camera but keep the app",
              isCorrect: false,
              feedback:
                "⚠️ Physical security helps, but the app may access other sensitive data. Remove it!",
              points: 5,
            },
          ],
          learningPoint:
            "Modern phones notify when apps access camera/mic. Unexpected access is a serious red flag.",
        },
        {
          id: "5",
          title: "Supply Chain Attack",
          description: "Popular app compromised",
          situation:
            "News breaks that a popular app you use was hacked and malicious code added. What now?",
          options: [
            {
              text: "Uninstall, change passwords, enable 2FA",
              isCorrect: true,
              feedback:
                "✅ Comprehensive response! Assume compromise and secure all connected accounts.",
              points: 20,
            },
            {
              text: "Wait for an official update",
              isCorrect: false,
              feedback:
                "❌ Every moment malware runs, it can steal more data. Act immediately!",
              points: 0,
            },
            {
              text: "Just uninstall the app",
              isCorrect: false,
              feedback:
                "⚠️ Good start, but secure your accounts too! Malware may have stolen credentials.",
              points: 10,
            },
          ],
          learningPoint:
            "Supply chain attacks compromise trusted apps. Respond quickly: remove, secure accounts, monitor for fraud.",
        },
      ],
      "password-strength-trainer": [
        {
          id: "1",
          title: "Password Creation Challenge",
          description: "Creating a new email password",
          situation:
            "You need a new password for your email. Which is strongest?",
          options: [
            {
              text: "MyEmail2024!",
              isCorrect: false,
              feedback:
                "⚠️ Better than most, but predictable pattern. Too short for critical accounts.",
              points: 10,
            },
            {
              text: "T7$mK9#pL2qR@vN5zX",
              isCorrect: true,
              feedback:
                "✅ Excellent! Long, random, mixed characters. This would take centuries to crack.",
              points: 20,
            },
            {
              text: "ilovemydogmax",
              isCorrect: false,
              feedback:
                "❌ Dictionary words and personal info are easily cracked. Add length and complexity!",
              points: 0,
            },
          ],
          learningPoint:
            "Strong passwords are 16+ characters with random combinations of letters, numbers, and symbols.",
        },
        {
          id: "2",
          title: "Passphrase Method",
          description: "Alternative password strategy",
          situation:
            "Which passphrase approach is best for memorability AND security?",
          options: [
            {
              text: "correct horse battery staple",
              isCorrect: false,
              feedback:
                "⚠️ Famous example, but too well-known now. Attackers specifically test this!",
              points: 5,
            },
            {
              text: "Purple$Elephant27!Dances@Midnight",
              isCorrect: true,
              feedback:
                "✅ Perfect! Random words with numbers and symbols. Long, memorable, and secure.",
              points: 20,
            },
            {
              text: "ILikeToWalkMyDog",
              isCorrect: false,
              feedback:
                "❌ Sentence structure is predictable. Add special characters, numbers, and randomness.",
              points: 0,
            },
          ],
          learningPoint:
            "Passphrases with random words, numbers, and symbols balance security with memorability.",
        },
        {
          id: "3",
          title: "Password Manager Setup",
          description: "Choosing a master password",
          situation:
            "You're setting up a password manager. What master password approach is best?",
          options: [
            {
              text: "Use the same strong password you use elsewhere",
              isCorrect: false,
              feedback:
                "❌ Terrible idea! If that password leaks, your entire password vault is compromised.",
              points: 0,
            },
            {
              text: "Create a unique, extra-long passphrase",
              isCorrect: true,
              feedback:
                "✅ Perfect! Master passwords protect everything, so they need maximum security and uniqueness.",
              points: 20,
            },
            {
              text: "Use something simple you'll never forget",
              isCorrect: false,
              feedback:
                "❌ Simple = weak. The master password is too important. Write it down securely if needed.",
              points: 0,
            },
          ],
          learningPoint:
            "Master passwords are critical single points of failure. Use maximum length and complexity.",
        },
        {
          id: "4",
          title: "Password Patterns",
          description: "Avoiding common mistakes",
          situation:
            "You want related passwords for work accounts. Which strategy is safer?",
          options: [
            {
              text: "WorkEmail1, WorkEmail2, WorkEmail3...",
              isCorrect: false,
              feedback:
                "❌ Predictable patterns! If one is compromised, attackers easily guess the others.",
              points: 0,
            },
            {
              text: "Completely unique random passwords",
              isCorrect: true,
              feedback:
                "✅ Correct! No patterns or relationships. Each breach is isolated.",
              points: 20,
            },
            {
              text: "Same base password with different endings",
              isCorrect: false,
              feedback:
                "❌ Partial reuse is still dangerous. Cracking one reveals the pattern.",
              points: 0,
            },
          ],
          learningPoint:
            "Never use patterns between passwords. Each should be completely unique and random.",
        },
        {
          id: "5",
          title: "Security Questions",
          description: "Setting up account recovery",
          situation:
            "A website requires security questions. How should you answer?",
          options: [
            {
              text: "Answer truthfully so you remember",
              isCorrect: false,
              feedback:
                "❌ Personal info is often publicly available or guessable. Easy for attackers!",
              points: 0,
            },
            {
              text: "Use random, false answers stored in password manager",
              isCorrect: true,
              feedback:
                "✅ Smart! Treat security answers like passwords. Random and stored securely.",
              points: 20,
            },
            {
              text: "Use the same answers for all sites",
              isCorrect: false,
              feedback:
                "❌ This creates vulnerability across all accounts. One breach affects everything.",
              points: 0,
            },
          ],
          learningPoint:
            "Security questions are weak authentication. Use random answers and store them like passwords.",
        },
      ],
      "breach-defense": [
        {
          id: "1",
          title: "Breach Notification",
          description: "Your email appears in a data breach",
          situation:
            "You receive notification that your email was in a breach. What's your action plan?",
          options: [
            {
              text: "Change passwords on all accounts using that email",
              isCorrect: true,
              feedback:
                "✅ Comprehensive response! Assume the worst and secure everything connected to that email.",
              points: 20,
            },
            {
              text: "Only change the password for the breached site",
              isCorrect: false,
              feedback:
                "⚠️ Not enough! If you reused passwords, all those accounts are at risk.",
              points: 10,
            },
            {
              text: "Wait to see if you notice any problems",
              isCorrect: false,
              feedback:
                "❌ Reactive approach gives attackers time to exploit your accounts. Act immediately!",
              points: 0,
            },
          ],
          learningPoint:
            "Treat breaches seriously. Change passwords on all accounts, enable 2FA, and monitor for fraud.",
        },
        {
          id: "2",
          title: "2FA Implementation",
          description: "Choosing two-factor methods",
          situation:
            "You're enabling 2FA on your bank account. Which method is most secure?",
          options: [
            {
              text: "SMS text message codes",
              isCorrect: false,
              feedback:
                "⚠️ Better than nothing, but SMS can be intercepted through SIM swapping attacks.",
              points: 10,
            },
            {
              text: "Authenticator app (TOTP) or hardware key",
              isCorrect: true,
              feedback:
                "✅ Most secure! Authenticator apps and hardware keys aren't vulnerable to interception.",
              points: 20,
            },
            {
              text: "Email codes",
              isCorrect: false,
              feedback:
                "❌ If your email is compromised, this 2FA is useless. Use independent methods.",
              points: 0,
            },
          ],
          learningPoint:
            "Use authenticator apps or hardware keys for 2FA. SMS is vulnerable to SIM swap attacks.",
        },
        {
          id: "3",
          title: "Credential Stuffing",
          description: "Understanding attack vectors",
          situation:
            "Attackers have your old password from a breach. How do they attack other accounts?",
          options: [
            {
              text: "They guess random passwords",
              isCorrect: false,
              feedback:
                "❌ They don't guess! They use your known password on other sites (credential stuffing).",
              points: 0,
            },
            {
              text: "They try your breached password on other sites",
              isCorrect: true,
              feedback:
                "✅ Exactly! This is credential stuffing. Why password reuse is dangerous.",
              points: 20,
            },
            {
              text: "They can't access other accounts",
              isCorrect: false,
              feedback:
                "❌ If you reused passwords, they absolutely can! This is why unique passwords are critical.",
              points: 0,
            },
          ],
          learningPoint:
            "Credential stuffing uses leaked passwords to access other accounts. Unique passwords prevent this.",
        },
        {
          id: "4",
          title: "Password Monitoring",
          description: "Proactive breach detection",
          situation:
            "How can you proactively detect if your passwords have been compromised?",
          options: [
            {
              text: "Use services like Have I Been Pwned",
              isCorrect: true,
              feedback:
                "✅ Smart! Breach monitoring services alert you to compromised credentials before attackers strike.",
              points: 20,
            },
            {
              text: "Wait for companies to notify you",
              isCorrect: false,
              feedback:
                "⚠️ Companies may not know about breaches for months, or may not notify everyone. Be proactive!",
              points: 5,
            },
            {
              text: "You can't detect breaches yourself",
              isCorrect: false,
              feedback:
                "❌ False! Monitoring services check your email/passwords against known breach databases.",
              points: 0,
            },
          ],
          learningPoint:
            "Use breach monitoring services to get early warning when your credentials appear in leaks.",
        },
        {
          id: "5",
          title: "Recovery Codes",
          description: "2FA backup planning",
          situation:
            "You're setting up 2FA with recovery codes. What should you do with them?",
          options: [
            {
              text: "Save them in your password manager",
              isCorrect: true,
              feedback:
                "✅ Perfect! Password managers securely store recovery codes for when you lose your 2FA device.",
              points: 20,
            },
            {
              text: "Email them to yourself",
              isCorrect: false,
              feedback:
                "❌ Email isn't secure! If compromised, attackers get your recovery codes.",
              points: 0,
            },
            {
              text: "You don't need recovery codes",
              isCorrect: false,
              feedback:
                "❌ Dangerous! Without recovery codes, losing your 2FA device means permanent account lockout.",
              points: 0,
            },
          ],
          learningPoint:
            "Store recovery codes securely offline or in encrypted storage. They're critical for account access.",
        },
      ],
      "email-detective": [
        {
          id: "1",
          title: "Urgent Invoice Email",
          description: "Suspicious payment request",
          situation:
            "You receive an urgent email claiming you owe money with a 'Pay Now' button. What are the red flags?",
          options: [
            {
              text: "Urgency, unexpected payment, and suspicious link",
              isCorrect: true,
              feedback:
                "✅ Perfect! Phishing uses urgency to bypass critical thinking. You've identified all red flags.",
              points: 20,
            },
            {
              text: "It's probably legitimate if it looks professional",
              isCorrect: false,
              feedback:
                "❌ Scammers create convincing fake emails! Professional appearance doesn't mean legitimate.",
              points: 0,
            },
            {
              text: "Just the suspicious link is a problem",
              isCorrect: false,
              feedback:
                "⚠️ The link is concerning, but urgency and unexpected requests are equally suspicious.",
              points: 10,
            },
          ],
          learningPoint:
            "Phishing emails use urgency, fear, and unexpected requests to trick you. Slow down and verify!",
        },
        {
          id: "2",
          title: "Prize Winner Notice",
          description: "Too good to be true",
          situation:
            "'Congratulations! You won $10,000! Click here to claim!' What's your assessment?",
          options: [
            {
              text: "It's a scam - you didn't enter any contest",
              isCorrect: true,
              feedback:
                "✅ Correct! You can't win contests you didn't enter. Classic phishing tactic.",
              points: 20,
            },
            {
              text: "Click carefully to see if it's real",
              isCorrect: false,
              feedback:
                "❌ Never click suspicious links! Even visiting the site can download malware.",
              points: 0,
            },
            {
              text: "Reply asking for more information",
              isCorrect: false,
              feedback:
                "❌ Replying confirms your email is active, leading to more scams. Delete and ignore!",
              points: 0,
            },
          ],
          learningPoint:
            "If it's too good to be true, it's a scam. You can't win contests you never entered.",
        },
        {
          id: "3",
          title: "CEO Fraud Email",
          description: "Spear phishing attack",
          situation:
            "Email from 'CEO' asks you to urgently buy gift cards and send codes. Verify how?",
          options: [
            {
              text: "Call the CEO directly using known contact info",
              isCorrect: true,
              feedback:
                "✅ Perfect! Verify through independent channels, never using contact info in suspicious emails.",
              points: 20,
            },
            {
              text: "Reply to the email asking if it's really them",
              isCorrect: false,
              feedback:
                "❌ You'd be replying to the scammer! Use independent verification channels.",
              points: 0,
            },
            {
              text: "Check if the email address looks right",
              isCorrect: false,
              feedback:
                "⚠️ Email addresses can be spoofed! Always verify urgent requests through separate channels.",
              points: 5,
            },
          ],
          learningPoint:
            "Business Email Compromise (BEC) impersonates executives. Always verify urgent requests independently.",
        },
        {
          id: "4",
          title: "Bank Alert Phishing",
          description: "Account security email",
          situation:
            "Email says: 'Suspicious activity detected! Verify your account immediately or it will be locked.' Response?",
          options: [
            {
              text: "Go to bank's website directly (type URL) and check",
              isCorrect: true,
              feedback:
                "✅ Smart! Never click links in suspicious emails. Navigate directly to legitimate sites.",
              points: 20,
            },
            {
              text: "Click the link - my account might be at risk!",
              isCorrect: false,
              feedback:
                "❌ That's what they want! Urgency bypasses judgment. Always verify independently.",
              points: 0,
            },
            {
              text: "Call the number in the email",
              isCorrect: false,
              feedback:
                "⚠️ That number leads to scammers! Use contact info from bank's official website or your card.",
              points: 5,
            },
          ],
          learningPoint:
            "Banks never ask for verification via email. Navigate to legitimate sites directly, don't click links.",
        },
        {
          id: "5",
          title: "Package Delivery Scam",
          description: "Fake shipping notification",
          situation:
            "Text/email about 'failed delivery' with tracking link. You didn't order anything. What now?",
          options: [
            {
              text: "Delete it - fake delivery scams are common",
              isCorrect: true,
              feedback:
                "✅ Right! These scams hope you're expecting a package and click without thinking.",
              points: 20,
            },
            {
              text: "Click to check - maybe it's a gift",
              isCorrect: false,
              feedback:
                "❌ Scammers count on this curiosity! The link downloads malware or steals info.",
              points: 0,
            },
            {
              text: "Forward it to the shipping company",
              isCorrect: false,
              feedback:
                "⚠️ Nice thought, but just delete it. Shipping companies know about these scams.",
              points: 5,
            },
          ],
          learningPoint:
            "Fake delivery notifications exploit package tracking culture. Verify orders through official tracking.",
        },
      ],
      "scam-buster": [
        {
          id: "1",
          title: "Tech Support Scam",
          description: "Pop-up warning about virus",
          situation:
            "Browser pop-up says your computer has viruses and shows a phone number to call for 'Microsoft Support'. Action?",
          options: [
            {
              text: "Close the browser and run your actual antivirus",
              isCorrect: true,
              feedback:
                "✅ Correct! Real virus warnings come from your antivirus software, not browser pop-ups.",
              points: 20,
            },
            {
              text: "Call the number to fix the problem",
              isCorrect: false,
              feedback:
                "❌ Classic scam! They'll charge hundreds for fake 'fixes' and install actual malware.",
              points: 0,
            },
            {
              text: "Click OK to scan",
              isCorrect: false,
              feedback:
                "❌ That button downloads malware! Close the browser (force quit if needed).",
              points: 0,
            },
          ],
          learningPoint:
            "Tech support scams use fake warnings. Real companies never cold-call or pop-up asking for support.",
        },
        {
          id: "2",
          title: "Romance Scam",
          description: "Online dating deception",
          situation:
            "Online match says they love you after 2 days and needs money for 'emergency'. Red flags?",
          options: [
            {
              text: "Extreme fast relationship + money request = scam",
              isCorrect: true,
              feedback:
                "✅ Textbook romance scam! Love bombing followed by financial requests. Report and block.",
              points: 20,
            },
            {
              text: "They might really need help",
              isCorrect: false,
              feedback:
                "❌ Scammers exploit empathy. No one you just met online should ask for money. Ever.",
              points: 0,
            },
            {
              text: "Ask for proof of the emergency",
              isCorrect: false,
              feedback:
                "⚠️ They'll provide fake 'proof'. Don't engage - report, block, and move on.",
              points: 5,
            },
          ],
          learningPoint:
            "Romance scams use fake relationships to steal money. Never send money to people you've only met online.",
        },
        {
          id: "3",
          title: "Investment Scam",
          description: "Cryptocurrency opportunity",
          situation:
            "Social media ad promises 'guaranteed 500% returns on crypto investment in 30 days'. Evaluation?",
          options: [
            {
              text: "Obvious scam - no investment guarantees returns",
              isCorrect: true,
              feedback:
                "✅ Right! Guaranteed high returns are impossible. This is a Ponzi scheme or outright theft.",
              points: 20,
            },
            {
              text: "Research the company and consider investing",
              isCorrect: false,
              feedback:
                "❌ The 'company' is fake! Legitimate investments carry risk and never guarantee specific returns.",
              points: 0,
            },
            {
              text: "Start with small investment to test it",
              isCorrect: false,
              feedback:
                "❌ They might pay small amounts initially to hook you, then steal larger investments. Don't engage!",
              points: 0,
            },
          ],
          learningPoint:
            "Investment scams promise unrealistic returns. If it sounds too good to be true, it's a scam.",
        },
        {
          id: "4",
          title: "Charity Scam",
          description: "Disaster relief fraud",
          situation:
            "After a natural disaster, you get calls asking for donations. How do you give safely?",
          options: [
            {
              text: "Research established charities and donate directly",
              isCorrect: true,
              feedback:
                "✅ Smart! Donate through verified charities' official websites, not unsolicited requests.",
              points: 20,
            },
            {
              text: "Give to whoever calls - it's an emergency",
              isCorrect: false,
              feedback:
                "❌ Scammers exploit disasters! Cold callers asking for donations are often fraudulent.",
              points: 0,
            },
            {
              text: "Send cash to the address they provide",
              isCorrect: false,
              feedback:
                "❌ Never send cash! It's untraceable and probably going to scammers, not victims.",
              points: 0,
            },
          ],
          learningPoint:
            "Scammers exploit tragedies. Donate only to verified charities through their official channels.",
        },
        {
          id: "5",
          title: "Job Offer Scam",
          description: "Work from home opportunity",
          situation:
            "'Get paid to work from home! Just pay $299 for training materials first.' Legitimate?",
          options: [
            {
              text: "Scam - real employers don't charge you to work",
              isCorrect: true,
              feedback:
                "✅ Correct! Legitimate employers pay you, they never charge fees to start working.",
              points: 20,
            },
            {
              text: "Investment in career - worth paying",
              isCorrect: false,
              feedback:
                "❌ You'll pay the fee and never hear from them again. Real jobs don't require upfront payment.",
              points: 0,
            },
            {
              text: "Negotiate a lower training fee",
              isCorrect: false,
              feedback:
                "❌ Any training fee is a red flag! Don't negotiate with scammers, just avoid them.",
              points: 0,
            },
          ],
          learningPoint:
            "Employment scams charge fees for fake jobs or training. Real employers never charge employees.",
        },
      ],
      "privacy-settings-master": [
        {
          id: "1",
          title: "Profile Privacy Audit",
          description: "Reviewing your social media",
          situation:
            "Your Facebook profile shows your phone number, address, and work history publicly. What should you do?",
          options: [
            {
              text: "Change all to 'Friends Only' or 'Only Me'",
              isCorrect: true,
              feedback:
                "✅ Essential! Personal contact and location info should never be public. Identity theft risk!",
              points: 20,
            },
            {
              text: "It's fine - everyone does it",
              isCorrect: false,
              feedback:
                "❌ Dangerous normalization! This info enables stalking, identity theft, and targeted scams.",
              points: 0,
            },
            {
              text: "Only hide your address",
              isCorrect: false,
              feedback:
                "⚠️ Better than nothing, but phone numbers and work details also enable targeting. Hide all!",
              points: 10,
            },
          ],
          learningPoint:
            "Limit personal information visibility. Share contact details and location only with trusted friends.",
        },
        {
          id: "2",
          title: "Tagging Permissions",
          description: "Control over photo tags",
          situation:
            "Friends keep tagging you in photos without permission. What's the best privacy approach?",
          options: [
            {
              text: "Enable tag review so you approve before tags appear",
              isCorrect: true,
              feedback:
                "✅ Perfect! Tag review prevents unwanted associations and maintains control over your online presence.",
              points: 20,
            },
            {
              text: "Ask friends to stop tagging you",
              isCorrect: false,
              feedback:
                "⚠️ Relies on others remembering. Better to use platform tools to control your own privacy.",
              points: 10,
            },
            {
              text: "Just untag yourself later",
              isCorrect: false,
              feedback:
                "❌ Reactive approach. The photo was already visible to others before you noticed and removed it.",
              points: 5,
            },
          ],
          learningPoint:
            "Use tag review features to control your online image. Prevention is better than cleanup.",
        },
        {
          id: "3",
          title: "Third-Party App Audit",
          description: "Connected applications review",
          situation:
            "You check connected apps and find 20+ apps you don't remember authorizing. Next step?",
          options: [
            {
              text: "Revoke access for all unrecognized or unused apps",
              isCorrect: true,
              feedback:
                "✅ Excellent! Old app connections are security risks. Regular audits are essential privacy hygiene.",
              points: 20,
            },
            {
              text: "Leave them - they must be important",
              isCorrect: false,
              feedback:
                "❌ Unused apps still access your data! Many are abandoned but continue collecting information.",
              points: 0,
            },
            {
              text: "Remove only apps you've never heard of",
              isCorrect: false,
              feedback:
                "⚠️ Even recognized apps you no longer use should be removed. Minimize your data exposure.",
              points: 10,
            },
          ],
          learningPoint:
            "Regularly audit connected apps. Remove anything you don't actively use to minimize data sharing.",
        },
        {
          id: "4",
          title: "Location Sharing",
          description: "Geotag and check-in settings",
          situation:
            "Your posts automatically include your exact location. What's the privacy impact?",
          options: [
            {
              text: "Disable automatic location - share manually if needed",
              isCorrect: true,
              feedback:
                "✅ Smart! Automatic geotagging reveals patterns (home, work) enabling stalking and burglary.",
              points: 20,
            },
            {
              text: "It's convenient and everyone does it",
              isCorrect: false,
              feedback:
                "❌ Broadcasting your location is dangerous! Criminals can track when you're away from home.",
              points: 0,
            },
            {
              text: "Only disable it at home",
              isCorrect: false,
              feedback:
                "⚠️ Partial solution. Your patterns (work, gym, school) also reveal routines exploitable by criminals.",
              points: 10,
            },
          ],
          learningPoint:
            "Location data reveals your routines and whereabouts. Disable automatic sharing, add locations manually if needed.",
        },
        {
          id: "5",
          title: "Data Download Request",
          description: "Understanding collected data",
          situation:
            "You download your Facebook data archive. It contains messages you deleted years ago. Why?",
          options: [
            {
              text: "Platforms retain 'deleted' data indefinitely",
              isCorrect: true,
              feedback:
                "✅ Correct! 'Delete' often means hidden from you, not actually removed. Important privacy lesson!",
              points: 20,
            },
            {
              text: "It's a bug in the download tool",
              isCorrect: false,
              feedback:
                "❌ Not a bug - it's policy! Platforms keep vast amounts of data even after you 'delete' it.",
              points: 0,
            },
            {
              text: "Deleted data is automatically restored",
              isCorrect: false,
              feedback:
                "❌ It was never actually deleted! Understand that 'delete' rarely means permanent removal.",
              points: 0,
            },
          ],
          learningPoint:
            "Data you 'delete' often remains on platform servers. Assume everything you post is permanent.",
        },
      ],
      "web-safety-navigator": [
        {
          id: "1",
          title: "HTTPS vs HTTP",
          description: "Secure connection identification",
          situation:
            "You're about to enter credit card info, but the site URL shows 'HTTP' not 'HTTPS'. What now?",
          options: [
            {
              text: "Stop immediately - never enter sensitive data on HTTP",
              isCorrect: true,
              feedback:
                "✅ Critical! HTTP is unencrypted. Your credit card data would be visible to anyone monitoring the network.",
              points: 20,
            },
            {
              text: "It's probably fine if the site looks legitimate",
              isCorrect: false,
              feedback:
                "❌ Appearance doesn't matter! Without HTTPS, your data is transmitted in plain text. Extremely dangerous!",
              points: 0,
            },
            {
              text: "Check if the site has good reviews first",
              isCorrect: false,
              feedback:
                "❌ Reviews are irrelevant if the connection isn't secure. Never send sensitive data over HTTP.",
              points: 0,
            },
          ],
          learningPoint:
            "HTTPS encrypts data in transit. Never enter passwords, credit cards, or personal info on HTTP sites.",
        },
        {
          id: "2",
          title: "Suspicious Download",
          description: "File safety assessment",
          situation:
            "A website automatically starts downloading 'FlashPlayer_Update.exe' when you visit. Response?",
          options: [
            {
              text: "Cancel download and scan computer for malware",
              isCorrect: true,
              feedback:
                "✅ Right! Auto-downloads are huge red flags. Flash is dead, this is 100% malware.",
              points: 20,
            },
            {
              text: "Install it - Flash Player is important",
              isCorrect: false,
              feedback:
                "❌ Flash has been discontinued since 2020! This is malware disguised as a legitimate update.",
              points: 0,
            },
            {
              text: "Scan the file with antivirus before installing",
              isCorrect: false,
              feedback:
                "⚠️ Better than installing blindly, but still risky. Auto-downloads are malware. Delete, don't scan.",
              points: 5,
            },
          ],
          learningPoint:
            "Automatic downloads are malware delivery methods. Legitimate software doesn't auto-download without permission.",
        },
        {
          id: "3",
          title: "Public WiFi Security",
          description: "Coffee shop internet usage",
          situation:
            "You need to check your bank account while on coffee shop WiFi. What's the safest approach?",
          options: [
            {
              text: "Use your phone's cellular data instead",
              isCorrect: true,
              feedback:
                "✅ Safest! Public WiFi can be monitored. Use cellular data or VPN for sensitive activities.",
              points: 20,
            },
            {
              text: "Just make sure the site is HTTPS",
              isCorrect: false,
              feedback:
                "⚠️ HTTPS helps, but public WiFi has additional risks like fake networks and man-in-the-middle attacks.",
              points: 10,
            },
            {
              text: "Public WiFi is safe for everything",
              isCorrect: false,
              feedback:
                "❌ Very dangerous! Public networks can be monitored, and fake 'evil twin' networks steal credentials.",
              points: 0,
            },
          ],
          learningPoint:
            "Avoid sensitive activities on public WiFi. Use cellular data or VPN for banking and passwords.",
        },
        {
          id: "4",
          title: "Browser Extension Safety",
          description: "Adding functionality to browser",
          situation:
            "A browser extension offers 'free VPN and ad blocking'. It has 5-star reviews but requests extensive permissions. Evaluate?",
          options: [
            {
              text: "Suspicious - excessive permissions and too-good offers",
              isCorrect: true,
              feedback:
                "✅ Excellent judgment! Malicious extensions can read all browsing data. Reviews can be fake.",
              points: 20,
            },
            {
              text: "Great reviews mean it's trustworthy",
              isCorrect: false,
              feedback:
                "❌ Reviews are easily faked! Many malicious extensions have thousands of fake 5-star reviews.",
              points: 0,
            },
            {
              text: "Free VPNs are always safe to use",
              isCorrect: false,
              feedback:
                "❌ 'Free' VPNs often sell your browsing data! If you're not paying, you're the product.",
              points: 0,
            },
          ],
          learningPoint:
            "Browser extensions can access all your browsing data. Only install from trusted developers with minimal permissions.",
        },
        {
          id: "5",
          title: "Cookie Consent",
          description: "Website tracking choices",
          situation:
            "Website cookie banner has 'Accept All' prominent and 'Manage Options' hidden small. Best privacy choice?",
          options: [
            {
              text: "Click 'Manage Options' and reject non-essential cookies",
              isCorrect: true,
              feedback:
                "✅ Privacy-conscious! Reject tracking, analytics, and advertising cookies. Only accept essential ones.",
              points: 20,
            },
            {
              text: "Accept All - it's easier and expected",
              isCorrect: false,
              feedback:
                "❌ 'Dark pattern' design manipulates you! Taking control of cookies significantly reduces tracking.",
              points: 0,
            },
            {
              text: "Close the banner without choosing",
              isCorrect: false,
              feedback:
                "⚠️ Many sites interpret this as 'Accept All'. Better to explicitly reject non-essential cookies.",
              points: 5,
            },
          ],
          learningPoint:
            "Cookie banners use dark patterns to manipulate consent. Always customize settings to reject tracking cookies.",
        },
      ],
      // Phishing game scenarios
      "phishing-detective": [
        {
          id: "1",
          title: "Suspicious Bank Email",
          description: "Account verification request",
          situation:
            "Email from 'support@bankk-security.com' says your account is locked and you must verify immediately. What do you notice?",
          options: [
            {
              text: "Domain typo (bankk vs bank) and urgency = phishing",
              isCorrect: true,
              feedback:
                "✅ Excellent eye! Typosquatting domain + urgency are classic phishing indicators.",
              points: 20,
            },
            {
              text: "Click the link to verify quickly",
              isCorrect: false,
              feedback:
                "❌ Never click links in unexpected emails! The domain is fake - contact your bank directly.",
              points: 0,
            },
            {
              text: "Reply with account number to verify",
              isCorrect: false,
              feedback:
                "❌ Never send credentials via email! This gives attackers your information.",
              points: 0,
            },
          ],
          learningPoint:
            "Check sender domains carefully. Phishers use similar domains with typos. Always verify through official channels.",
        },
        {
          id: "2",
          title: "Prize Winner Notification",
          description: "Unexpected lottery win",
          situation:
            "Email says you won $1 million in a lottery you never entered. Click here to claim!",
          options: [
            {
              text: "Delete immediately - it's a scam",
              isCorrect: true,
              feedback:
                "✅ Smart! You can't win contests you didn't enter. This advance-fee scam requests payment to 'claim' fake prizes.",
              points: 20,
            },
            {
              text: "Click to see if it's real",
              isCorrect: false,
              feedback:
                "❌ Clicking confirms your email is active and opens malicious sites. Delete without clicking!",
              points: 0,
            },
            {
              text: "Forward to friends to share luck",
              isCorrect: false,
              feedback:
                "❌ Never spread scams! You'd be helping phishers reach more victims.",
              points: 0,
            },
          ],
          learningPoint:
            "If something seems too good to be true, it is. Legitimate prizes don't require payment or personal info.",
        },
        {
          id: "3",
          title: "CEO Email Request",
          description: "Urgent wire transfer",
          situation:
            "Email from your CEO's address asks you to urgently wire money to a vendor. It bypasses normal approval process.",
          options: [
            {
              text: "Verify through official channels before any action",
              isCorrect: true,
              feedback:
                "✅ Perfect! This is likely spoofed or compromised. Call CEO directly using known number to verify.",
              points: 20,
            },
            {
              text: "Do it immediately - it's from the CEO",
              isCorrect: false,
              feedback:
                "❌ Business Email Compromise (BEC) attack! Attackers spoof executives. Always verify unusual requests.",
              points: 0,
            },
            {
              text: "Reply asking if it's legitimate",
              isCorrect: false,
              feedback:
                "⚠️ If the account is compromised, replying confirms the scam worked. Use separate contact method!",
              points: 5,
            },
          ],
          learningPoint:
            "Business Email Compromise targets companies with spoofed executive emails. Always verify financial requests out-of-band.",
        },
      ],
      "email-security-challenge": [
        {
          id: "1",
          title: "Attachment Analysis",
          description: "Suspicious file received",
          situation:
            "Unexpected email with 'Receipt.pdf.exe' attachment from unknown sender. What's wrong?",
          options: [
            {
              text: "Double extension hides malware - delete without opening",
              isCorrect: true,
              feedback:
                "✅ Correct! .exe is executable. Attackers use double extensions because Windows hides known extensions.",
              points: 20,
            },
            {
              text: "Open it to see the receipt",
              isCorrect: false,
              feedback:
                "❌ Opening executes malware! The .exe reveals this is a virus, not a PDF.",
              points: 0,
            },
            {
              text: "Scan with antivirus first",
              isCorrect: false,
              feedback:
                "⚠️ Better than opening directly, but best practice is to delete unsolicited executables.",
              points: 10,
            },
          ],
          learningPoint:
            "Never open unexpected attachments, especially executables (.exe, .bat, .scr). Verify sender legitimacy first.",
        },
        {
          id: "2",
          title: "Link Inspection",
          description: "Verify before clicking",
          situation:
            "Email link text shows 'www.paypal.com' but hovering reveals 'www.paypa1.com'. What's happening?",
          options: [
            {
              text: "Display text is spoofed - actual link is phishing",
              isCorrect: true,
              feedback:
                "✅ Excellent! Link text can lie. The real URL (paypa1 with number 1) is a phishing site.",
              points: 20,
            },
            {
              text: "It's just a typo, safe to click",
              isCorrect: false,
              feedback:
                "❌ This is intentional typosquatting! The fake site will steal your PayPal credentials.",
              points: 0,
            },
            {
              text: "Email clients fix links automatically",
              isCorrect: false,
              feedback:
                "❌ Emails display what sender specifies. Always hover to verify actual URLs before clicking.",
              points: 0,
            },
          ],
          learningPoint:
            "Always hover over links to preview actual URLs. Display text can be deceptive. Look for typos and domain differences.",
        },
        {
          id: "3",
          title: "Spear Phishing Attack",
          description: "Highly targeted email",
          situation:
            "Email references your recent conference attendance and asks to review a document about your presentation. It seems legitimate.",
          options: [
            {
              text: "Verify sender independently - could be researched spear phishing",
              isCorrect: true,
              feedback:
                "✅ Smart! Spear phishing uses personal info from social media to appear legitimate. Always verify.",
              points: 20,
            },
            {
              text: "It mentions specific details, so it's safe",
              isCorrect: false,
              feedback:
                "❌ That's exactly why spear phishing works! Attackers research targets to build trust.",
              points: 0,
            },
            {
              text: "Open the document to see what it says",
              isCorrect: false,
              feedback:
                "❌ Documents can contain malicious macros or exploits. Verify sender first!",
              points: 0,
            },
          ],
          learningPoint:
            "Spear phishing is targeted using researched personal information. Even personalized emails need verification.",
        },
      ],
      // Password game scenarios
      "password-fortress": [
        {
          id: "1",
          title: "Password Creation",
          description: "New account setup",
          situation: "Creating account password. Which is strongest?",
          options: [
            {
              text: "Tr0ub4dor&3HorsesRun!In2024#Field",
              isCorrect: true,
              feedback:
                "✅ Excellent! 30+ characters with mixed types makes it virtually uncrackable by brute force.",
              points: 20,
            },
            {
              text: "Password123!",
              isCorrect: false,
              feedback:
                "❌ Common pattern! This would be cracked in seconds. Too short and predictable.",
              points: 0,
            },
            {
              text: "MyName2024",
              isCorrect: false,
              feedback:
                "❌ Personal info is easily guessed or found on social media. Never use names/dates.",
              points: 0,
            },
          ],
          learningPoint:
            "Strong passwords: 12+ chars, random, mix uppercase/lowercase/numbers/symbols, avoid personal info.",
        },
        {
          id: "2",
          title: "Password Sharing",
          description: "Team collaboration dilemma",
          situation:
            "Colleague asks for your shared account password via Slack message. What do you do?",
          options: [
            {
              text: "Never share via messaging - use secure password manager sharing",
              isCorrect: true,
              feedback:
                "✅ Perfect! Slack logs are stored and insecure. Use password manager secure sharing features.",
              points: 20,
            },
            {
              text: "Send it - they're on your team",
              isCorrect: false,
              feedback:
                "❌ Messaging apps store history! Anyone with access to the chat sees the password.",
              points: 0,
            },
            {
              text: "Whisper it in person",
              isCorrect: false,
              feedback:
                "⚠️ Better than messaging, but password managers with secure sharing are more professional.",
              points: 10,
            },
          ],
          learningPoint:
            "Never transmit passwords via email, chat, or text. Use encrypted password manager sharing or secure vaults.",
        },
        {
          id: "3",
          title: "Password Expiration",
          description: "Security policy forces change",
          situation:
            "System forces password change every 30 days. You're frustrated. What's the actual security impact?",
          options: [
            {
              text: "Frequent changes lead to weaker, predictable passwords",
              isCorrect: true,
              feedback:
                "✅ Correct! NIST now recommends against forced periodic changes. They cause 'Summer2024!' patterns.",
              points: 20,
            },
            {
              text: "More changes = more security always",
              isCorrect: false,
              feedback:
                "❌ Research shows frequent changes make users create weaker passwords with predictable patterns.",
              points: 0,
            },
            {
              text: "It doesn't matter either way",
              isCorrect: false,
              feedback:
                "❌ It matters! Bad policies cause weak passwords. Change only when breached or compromised.",
              points: 0,
            },
          ],
          learningPoint:
            "Modern security: strong unique passwords + MFA, no forced periodic changes unless compromised.",
        },
      ],
      "credential-guardian": [
        {
          id: "1",
          title: "Password Manager Setup",
          description: "Choosing security tools",
          situation:
            "Setting up password manager. What's the most important feature?",
          options: [
            {
              text: "Strong master password + 2FA + encrypted vault",
              isCorrect: true,
              feedback:
                "✅ Perfect! Master password security is critical - it protects all other passwords. Add 2FA for extra protection.",
              points: 20,
            },
            {
              text: "Easy to remember master password",
              isCorrect: false,
              feedback:
                "❌ Easy = weak! Master password should be long passphrase you won't forget but others can't guess.",
              points: 0,
            },
            {
              text: "Free version with no premium features",
              isCorrect: false,
              feedback:
                "⚠️ Free managers work, but security features (breach monitoring, 2FA) justify premium investment.",
              points: 5,
            },
          ],
          learningPoint:
            "Password manager master password is your single point of failure. Make it strong, unique, memorable.",
        },
        {
          id: "2",
          title: "Two-Factor Authentication Choice",
          description: "Adding account protection",
          situation:
            "Website offers SMS codes or authenticator app for 2FA. Which is better?",
          options: [
            {
              text: "Authenticator app - resistant to SIM swapping",
              isCorrect: true,
              feedback:
                "✅ Correct! SMS is vulnerable to SIM swapping attacks. Authenticator apps (TOTP) are much more secure.",
              points: 20,
            },
            {
              text: "SMS is fine - it's more convenient",
              isCorrect: false,
              feedback:
                "❌ Convenience shouldn't compromise security! SIM swapping lets attackers receive your codes.",
              points: 0,
            },
            {
              text: "2FA isn't necessary if password is strong",
              isCorrect: false,
              feedback:
                "❌ 2FA adds critical defense layer! Even strong passwords can be phished or breached.",
              points: 0,
            },
          ],
          learningPoint:
            "2FA hierarchy: Hardware keys > Authenticator apps > SMS codes. Always enable strongest available option.",
        },
        {
          id: "3",
          title: "Breach Notification",
          description: "Have I Been Pwned alert",
          situation:
            "Service alerts your email appeared in a breach from a site you use. Action?",
          options: [
            {
              text: "Change password immediately + enable 2FA + check for reuse",
              isCorrect: true,
              feedback:
                "✅ Perfect response! Change compromised password, secure account with 2FA, update any reused passwords.",
              points: 20,
            },
            {
              text: "Ignore it - probably false alarm",
              isCorrect: false,
              feedback:
                "❌ Breach databases are accurate! Attackers are testing those credentials right now.",
              points: 0,
            },
            {
              text: "Just change the one affected account",
              isCorrect: false,
              feedback:
                "⚠️ Good start, but if you reused that password elsewhere, all those accounts are at risk!",
              points: 10,
            },
          ],
          learningPoint:
            "Breach notifications require immediate action: change password, enable 2FA, audit for reuse across accounts.",
        },
      ],
      // Social engineering game scenarios
      "social-engineering-defense": [
        {
          id: "1",
          title: "Pretexting Phone Call",
          description: "Fake identity verification",
          situation:
            "Caller claims to be from HR verifying your employment. Asks for SSN and birth date. What do you do?",
          options: [
            {
              text: "Refuse and call HR back using known number",
              isCorrect: true,
              feedback:
                "✅ Perfect! Never provide sensitive info to callers. Verify through official channels you initiate.",
              points: 20,
            },
            {
              text: "Provide info - they sound professional",
              isCorrect: false,
              feedback:
                "❌ Pretexting! Attackers rehearse to sound legitimate. Always verify independently.",
              points: 0,
            },
            {
              text: "Give partial info to test if they're real",
              isCorrect: false,
              feedback:
                "❌ Any info helps attackers! They piece together partial data from multiple sources.",
              points: 0,
            },
          ],
          learningPoint:
            "Pretexting uses fabricated scenarios. Verify caller identity through independent official channels before sharing any data.",
        },
        {
          id: "2",
          title: "Tailgating Attempt",
          description: "Physical security breach",
          situation:
            "Someone in delivery uniform asks you to hold the secure door open as they carry boxes. No visible badge.",
          options: [
            {
              text: "Politely require they badge in or call security",
              isCorrect: true,
              feedback:
                "✅ Correct! Even if awkward, physical security can't be compromised. Real employees understand.",
              points: 20,
            },
            {
              text: "Hold it - they're carrying boxes",
              isCorrect: false,
              feedback:
                "❌ Classic tailgating! Uniforms and props create pretexts. All entrants must badge independently.",
              points: 0,
            },
            {
              text: "Ask them who they're delivering to",
              isCorrect: false,
              feedback:
                "❌ They'll name someone! Security requires badge verification, not trusting answers.",
              points: 0,
            },
          ],
          learningPoint:
            "Tailgating exploits courtesy. All individuals must authenticate independently, even in awkward situations.",
        },
        {
          id: "3",
          title: "Quid Pro Quo Attack",
          description: "Fake tech support offer",
          situation:
            "Someone calls offering free security software upgrade. Needs remote access to install. Red flags?",
          options: [
            {
              text: "Unsolicited offer + remote access request = scam",
              isCorrect: true,
              feedback:
                "✅ Excellent! Quid pro quo: fake service in exchange for access. Hang up immediately.",
              points: 20,
            },
            {
              text: "Free security software sounds good",
              isCorrect: false,
              feedback:
                "❌ It's malware! Remote access lets them steal data and install actual viruses.",
              points: 0,
            },
            {
              text: "Ask them to prove they work for your company",
              isCorrect: false,
              feedback:
                "⚠️ Engaging gives them opportunities to manipulate. Don't interact - just hang up.",
              points: 5,
            },
          ],
          learningPoint:
            "Quid pro quo offers fake benefits (tech support, prizes) to extract information or access. Unsolicited = suspicious.",
        },
      ],
      "manipulation-awareness": [
        {
          id: "1",
          title: "Authority Exploitation",
          description: "Impersonating leadership",
          situation:
            "Email from 'CEO' (unknown address) demands you send employee records immediately. 'Confidential project.'",
          options: [
            {
              text: "Verify through known CEO contact before any action",
              isCorrect: true,
              feedback:
                "✅ Perfect! Authority is a powerful manipulation tool. Always verify through separate official channels.",
              points: 20,
            },
            {
              text: "Send immediately - CEO is requesting",
              isCorrect: false,
              feedback:
                "❌ Attackers impersonate authority to bypass critical thinking. Unknown address is major red flag.",
              points: 0,
            },
            {
              text: "Reply asking for more details",
              isCorrect: false,
              feedback:
                "❌ Replying confirms the email reached someone. Use separate channel to verify with real CEO.",
              points: 0,
            },
          ],
          learningPoint:
            "Authority manipulation bypasses normal skepticism. Verify high-stakes requests through independent official channels.",
        },
        {
          id: "2",
          title: "Scarcity Pressure",
          description: "Limited time offer",
          situation:
            "Pop-up: 'Security software 95% off - only 2 copies left! Expires in 5 minutes!' What's the tactic?",
          options: [
            {
              text: "Artificial scarcity creates urgency to skip verification",
              isCorrect: true,
              feedback:
                "✅ Correct! Scarcity + urgency = decision pressure. Take time to research before purchasing anything.",
              points: 20,
            },
            {
              text: "Buy now before it's gone!",
              isCorrect: false,
              feedback:
                "❌ Classic manipulation! Legitimate deals don't use extreme pressure tactics. Research first.",
              points: 0,
            },
            {
              text: "It's probably a good deal if it's limited",
              isCorrect: false,
              feedback:
                "❌ Scarcity is often fabricated! Pop-up software offers are usually malware or scams.",
              points: 0,
            },
          ],
          learningPoint:
            "Artificial scarcity and urgency pressure fast decisions. Legitimate businesses don't use extreme tactics. Research first.",
        },
        {
          id: "3",
          title: "Social Proof Manipulation",
          description: "Fake popularity signals",
          situation:
            "App shows '10,000 users joined today!' with glowing reviews. All reviews posted same day. Suspicious?",
          options: [
            {
              text: "Yes - fake social proof to appear popular",
              isCorrect: true,
              feedback:
                "✅ Sharp eye! Fake reviews and inflated numbers create false credibility. Check independent review sites.",
              points: 20,
            },
            {
              text: "10,000 users means it's trustworthy",
              isCorrect: false,
              feedback:
                "❌ Numbers can be fabricated! Same-day reviews indicate fake social proof campaign.",
              points: 0,
            },
            {
              text: "Positive reviews prove it's legitimate",
              isCorrect: false,
              feedback:
                "❌ Reviews can be bought or fabricated. Cross-reference with independent sources.",
              points: 0,
            },
          ],
          learningPoint:
            "Social proof (reviews, user counts) can be faked. Verify through independent trusted sources before trusting popularity signals.",
        },
      ],
      // Device security game scenarios
      "device-lockdown": [
        {
          id: "1",
          title: "Lost Device Scenario",
          description: "Phone left at restaurant",
          situation:
            "Realized you left phone at restaurant 30 minutes ago. What's your first action?",
          options: [
            {
              text: "Use Find My Device to lock remotely and display contact info",
              isCorrect: true,
              feedback:
                "✅ Perfect! Remote lock protects data immediately. Display message helps honest finder return it.",
              points: 20,
            },
            {
              text: "Rush back to get it",
              isCorrect: false,
              feedback:
                "⚠️ Do this too, but lock remotely FIRST! Data breach can happen in minutes.",
              points: 10,
            },
            {
              text: "Wait to see if someone calls you",
              isCorrect: false,
              feedback:
                "❌ Unprotected device with no lock screen? Your data is at risk every second. Lock remotely!",
              points: 0,
            },
          ],
          learningPoint:
            "Lost device protocol: 1) Remote lock immediately, 2) Display contact message, 3) Track location, 4) Remote wipe if necessary.",
        },
        {
          id: "2",
          title: "Public Charging Station",
          description: "USB security risk",
          situation:
            "Need to charge phone at airport. Options: public USB port or wall outlet with your charger. Which is safer?",
          options: [
            {
              text: "Wall outlet with your charger - avoid juice jacking",
              isCorrect: true,
              feedback:
                "✅ Smart! Public USB ports can be compromised for data theft (juice jacking). Use wall outlets + your charger.",
              points: 20,
            },
            {
              text: "USB port is fine - everyone uses them",
              isCorrect: false,
              feedback:
                "❌ 'Juice jacking' attacks use malicious USB ports to steal data or install malware while charging.",
              points: 0,
            },
            {
              text: "Use USB but don't unlock phone",
              isCorrect: false,
              feedback:
                "⚠️ Better, but ports can still exploit vulnerabilities. Carry your own charger and use wall outlets.",
              points: 10,
            },
          ],
          learningPoint:
            "Public USB ports pose juice jacking risk. Use wall outlets with your own charger, or carry portable battery pack.",
        },
        {
          id: "3",
          title: "Device Disposal",
          description: "Selling old phone",
          situation:
            "Selling old phone online. What must you do before handing it over?",
          options: [
            {
              text: "Factory reset + verify data wiped + remove accounts",
              isCorrect: true,
              feedback:
                "✅ Perfect! Factory reset, remove Google/Apple accounts, verify with test file. Some devices need extra secure erase.",
              points: 20,
            },
            {
              text: "Just delete photos and apps",
              isCorrect: false,
              feedback:
                "❌ Deleted files can be recovered! Factory reset is minimum. Remove accounts to prevent tracking.",
              points: 0,
            },
            {
              text: "Factory reset is enough",
              isCorrect: false,
              feedback:
                "⚠️ Also remove Google/Apple accounts! Otherwise buyer could be tracked or you could be liable for their actions.",
              points: 10,
            },
          ],
          learningPoint:
            "Device disposal: Factory reset, remove all accounts, verify with test file, consider encryption wipe for sensitive devices.",
        },
      ],
      "security-settings-master": [
        {
          id: "1",
          title: "Auto-Update Configuration",
          description: "Balancing security and control",
          situation:
            "Choosing update settings. Options: Auto-install, Download but let me install, or Check but don't download. Which for security?",
          options: [
            {
              text: "Auto-install - fastest protection against new vulnerabilities",
              isCorrect: true,
              feedback:
                "✅ Correct! Zero-day exploits are patched in updates. Auto-install eliminates delay window. Set for overnight.",
              points: 20,
            },
            {
              text: "Download but manual install - more control",
              isCorrect: false,
              feedback:
                "⚠️ Adds risky delay! Human nature = procrastination. Auto-install provides better security.",
              points: 10,
            },
            {
              text: "Check only - I decide everything",
              isCorrect: false,
              feedback:
                "❌ Maximum vulnerability window! Attackers exploit known vulnerabilities in unpatched systems.",
              points: 0,
            },
          ],
          learningPoint:
            "Automatic updates provide fastest protection. Configure for automatic installation during off-hours for best security.",
        },
        {
          id: "2",
          title: "Bluetooth Security",
          description: "Wireless vulnerability management",
          situation:
            "You're in public with Bluetooth enabled but not actively using it. Security concern?",
          options: [
            {
              text: "Yes - disable when not in use to prevent attacks",
              isCorrect: true,
              feedback:
                "✅ Smart! Enabled Bluetooth can be exploited for tracking (surveillance), attacks (BlueBorne), or connecting unauthorized devices.",
              points: 20,
            },
            {
              text: "No problem - Bluetooth is always safe",
              isCorrect: false,
              feedback:
                "❌ Bluetooth has vulnerabilities! BlueBorne and similar exploits can compromise enabled devices without user interaction.",
              points: 0,
            },
            {
              text: "Just set it to non-discoverable",
              isCorrect: false,
              feedback:
                "⚠️ Helps but doesn't eliminate risk. Some attacks work on non-discoverable devices. Disable when unused.",
              points: 10,
            },
          ],
          learningPoint:
            "Disable unused wireless features (Bluetooth, NFC, Wi-Fi). Each enabled feature expands attack surface. Enable only when needed.",
        },
        {
          id: "3",
          title: "App Permission Management",
          description: "Ongoing permission review",
          situation:
            "Reviewing app permissions. Social media app has location 'Always' enabled. What should you do?",
          options: [
            {
              text: "Change to 'While Using' or 'Ask Every Time'",
              isCorrect: true,
              feedback:
                "✅ Excellent! 'Always' allows background tracking. 'While Using' provides functionality with better privacy.",
              points: 20,
            },
            {
              text: "Leave it - location features are useful",
              isCorrect: false,
              feedback:
                "❌ 'Always' creates detailed movement profile! Change to 'While Using' for same features + privacy.",
              points: 0,
            },
            {
              text: "Revoke location completely",
              isCorrect: false,
              feedback:
                "⚠️ Breaks location features you might want. 'While Using' is good balance of utility and privacy.",
              points: 10,
            },
          ],
          learningPoint:
            "Audit app permissions quarterly. Use 'While Using' instead of 'Always', revoke unnecessary permissions, uninstall unused apps.",
        },
      ],
      "security-fundamentals": [
        {
          id: "1",
          title: "CIA Triad Application",
          description: "Understanding security principles",
          situation:
            "Database stores customer data. Which measure addresses 'Integrity' in CIA triad?",
          options: [
            {
              text: "Checksums and validation to detect unauthorized changes",
              isCorrect: true,
              feedback:
                "✅ Perfect! Integrity ensures data accuracy and prevents unauthorized modification. Checksums detect tampering.",
              points: 20,
            },
            {
              text: "Encryption to hide data from unauthorized viewers",
              isCorrect: false,
              feedback:
                "❌ That's Confidentiality! Integrity is about preventing unauthorized changes and ensuring data accuracy.",
              points: 0,
            },
            {
              text: "Backups to ensure data availability",
              isCorrect: false,
              feedback:
                "❌ That's Availability! Integrity verifies data hasn't been altered improperly.",
              points: 0,
            },
          ],
          learningPoint:
            "CIA Triad: Confidentiality (encryption), Integrity (validation), Availability (backups). All three required for complete security.",
        },
        {
          id: "2",
          title: "Defense in Depth",
          description: "Layered security strategy",
          situation:
            "Securing a server. Which approach demonstrates defense in depth?",
          options: [
            {
              text: "Firewall + IDS + Encryption + Access Control + Auditing",
              isCorrect: true,
              feedback:
                "✅ Excellent! Multiple independent layers mean if one fails, others provide backup protection.",
              points: 20,
            },
            {
              text: "Very strong firewall only",
              isCorrect: false,
              feedback:
                "❌ Single point of failure! If firewall is bypassed, no other protections exist.",
              points: 0,
            },
            {
              text: "Encryption + backups",
              isCorrect: false,
              feedback:
                "⚠️ Good start but insufficient! Need network security, access controls, and monitoring too.",
              points: 10,
            },
          ],
          learningPoint:
            "Defense in depth uses multiple independent security layers. If one layer fails, others maintain protection.",
        },
        {
          id: "3",
          title: "Zero Trust Implementation",
          description: "Modern security model",
          situation:
            "Employee VPNs into corporate network. In zero-trust model, what happens next?",
          options: [
            {
              text: "Continuous verification of every access request",
              isCorrect: true,
              feedback:
                "✅ Correct! Zero-trust: never trust, always verify. Even authenticated users are verified for each resource access.",
              points: 20,
            },
            {
              text: "Full network access after VPN authentication",
              isCorrect: false,
              feedback:
                "❌ That's perimeter model (castle-and-moat)! Zero-trust requires continuous verification regardless of location.",
              points: 0,
            },
            {
              text: "Access only during business hours",
              isCorrect: false,
              feedback:
                "❌ Time-based access is one control, but zero-trust requires continuous verification of identity + context.",
              points: 0,
            },
          ],
          learningPoint:
            "Zero-trust: Verify explicitly, use least-privilege access, assume breach. No implicit trust based on network location.",
        },
      ],
    };

    return scenarioSets[gameSlug] || scenarioSets["permission-detective"];
  };

  const gameScenarios = getGameScenarios();

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
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
      [currentScenarioIndex]: option.isCorrect,
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
          completedAt: new Date().toISOString(),
        }),
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
                {gameSlug
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">
                        Pre-Assessment (3 questions)
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Test your current knowledge level
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">
                        Interactive Game ({gameScenarios.length} scenarios)
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Make decisions in real-world situations
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">
                        Post-Assessment (3 questions)
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Measure your improvement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Earn Points</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Based on your decisions
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Track Growth</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    See your improvement
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/games")}
                  className="flex-1"
                >
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
    const progress =
      ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
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
                Question {currentQuestionIndex + 1} of{" "}
                {assessmentQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.question}
              </CardTitle>
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
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestionIndex] === idx
                          ? "border-purple-600 bg-purple-600"
                          : "border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
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
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
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
                  {currentQuestionIndex === assessmentQuestions.length - 1
                    ? "Finish Assessment"
                    : "Next Question"}
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
                <span className="text-sm font-semibold">
                  {currentScenario.title}
                </span>
              </div>
              <CardTitle className="text-2xl">
                {currentScenario.description}
              </CardTitle>
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
                    <div
                      className={`p-6 rounded-lg ${
                        currentScenario.options[selectedOption].isCorrect
                          ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500"
                          : "bg-red-50 dark:bg-red-950/20 border-2 border-red-500"
                      }`}
                    >
                      <p className="text-lg font-semibold mb-2">
                        {currentScenario.options[selectedOption].feedback}
                      </p>
                      <p className="text-sm">
                        Points earned:{" "}
                        <span className="font-bold">
                          {currentScenario.options[selectedOption].points}
                        </span>
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

                  <Button
                    onClick={handleNextScenario}
                    className="w-full"
                    size="lg"
                  >
                    {currentScenarioIndex === gameScenarios.length - 1
                      ? "Continue to Post-Assessment"
                      : "Next Scenario"}
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
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Pre-Assessment
                  </p>
                  <p className="text-3xl font-bold">
                    {Math.round(prePercentage)}%
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {preScore}/{maxScore} points
                  </p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Game Score
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {gameScore}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    points earned
                  </p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Post-Assessment
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(postPercentage)}%
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {postScore}/{maxScore} points
                  </p>
                </div>
              </div>

              <div
                className={`p-6 rounded-lg text-center ${
                  improvement > 0
                    ? "bg-green-100 dark:bg-green-900/20 border-2 border-green-500"
                    : improvement < 0
                    ? "bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-500"
                    : "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500"
                }`}
              >
                <TrendingUp
                  className={`h-12 w-12 mx-auto mb-3 ${
                    improvement > 0
                      ? "text-green-600"
                      : improvement < 0
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}
                />
                <p className="text-2xl font-bold mb-2">
                  {improvement > 0 ? "+" : ""}
                  {improvement}% Improvement
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
                <Button
                  variant="outline"
                  onClick={() => router.push("/games")}
                  className="flex-1"
                >
                  Back to Games
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
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
