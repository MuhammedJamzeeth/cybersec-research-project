import React, { useState } from 'react';

/**
 * Complete Integration Example for ML-Powered App Permissions Assessment
 * 
 * This example shows how to:
 * 1. Collect user profile (gender, education, proficiency)
 * 2. Submit assessment with answers
 * 3. Display ML-based results with personalized feedback
 */

interface UserProfile {
  email: string;
  name: string;
  organization?: string;
  gender: 'Male' | 'Female';
  education_level: 'O/L' | 'A/L' | 'HND' | 'Degree';
  proficiency: 'School' | 'High';
}

interface UserAnswer {
  question_id: string;
  question_text: string;
  selected_option: string;
  selected_option_index: number;
}

interface QuestionFeedback {
  question_id: string;
  question_text: string;
  selected_option: string;
  score: number;
  level: string;
  explanation: string;
  enhancement_advice: string;
}

interface AssessmentResult {
  timestamp: string;
  user_profile: UserProfile;
  total_score: number;
  max_score: number;
  percentage: number;
  overall_knowledge_level: string;
  ml_awareness_level?: string;
  ml_confidence?: number;
  ml_recommendations?: string[];
  detailed_feedback: QuestionFeedback[];
  saved_to_database: boolean;
  message: string;
}

const API_BASE_URL = 'http://localhost:8000';

export function AppPermissionsAssessment() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: '',
    name: '',
    organization: '',
    gender: 'Male',
    education_level: 'Degree',
    proficiency: 'High'
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Collect User Profile
  const ProfileForm = () => (
    <div className="profile-form">
      <h2>User Profile - Required for Personalized Feedback</h2>
      
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={userProfile.email}
          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={userProfile.name}
          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
          placeholder="Your Full Name"
        />
      </div>

      <div className="form-group">
        <label>Organization (Optional):</label>
        <input
          type="text"
          value={userProfile.organization}
          onChange={(e) => setUserProfile({...userProfile, organization: e.target.value})}
          placeholder="University of Ruhuna"
        />
      </div>

      <div className="form-group">
        <label>Gender:</label>
        <select
          value={userProfile.gender}
          onChange={(e) => setUserProfile({...userProfile, gender: e.target.value as 'Male' | 'Female'})}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <small>Used to provide culturally appropriate explanations</small>
      </div>

      <div className="form-group">
        <label>Education Level:</label>
        <select
          value={userProfile.education_level}
          onChange={(e) => setUserProfile({...userProfile, education_level: e.target.value as any})}
        >
          <option value="O/L">O/L (Ordinary Level)</option>
          <option value="A/L">A/L (Advanced Level)</option>
          <option value="HND">HND (Higher National Diploma)</option>
          <option value="Degree">Degree</option>
        </select>
        <small>Adjusts explanation complexity</small>
      </div>

      <div className="form-group">
        <label>IT Proficiency:</label>
        <select
          value={userProfile.proficiency}
          onChange={(e) => setUserProfile({...userProfile, proficiency: e.target.value as 'School' | 'High'})}
        >
          <option value="School">School Level</option>
          <option value="High">High/Professional</option>
        </select>
        <small>Determines technical depth of explanations</small>
      </div>
    </div>
  );

  // Step 2: Fetch Questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit Assessment with User Profile
  const submitAssessment = async () => {
    try {
      setLoading(true);

      const submission = {
        user_profile: userProfile,
        answers: userAnswers
      };

      const response = await fetch(`${API_BASE_URL}/api/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error('Assessment submission failed');
      }

      const data: AssessmentResult = await response.json();
      setResult(data);

      // Log ML insights
      console.log('=== ML INSIGHTS ===');
      console.log('Awareness Level:', data.ml_awareness_level);
      console.log('Confidence:', data.ml_confidence);
      console.log('Recommendations:', data.ml_recommendations);

    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Display ML-Enhanced Results
  const ResultsDisplay = ({ result }: { result: AssessmentResult }) => (
    <div className="results-container">
      <h2>Assessment Results</h2>

      {/* Overall Score */}
      <div className="score-summary">
        <h3>Your Score</h3>
        <div className="score-display">
          <span className="score">{result.total_score}</span>
          <span className="separator">/</span>
          <span className="max-score">{result.max_score}</span>
        </div>
        <div className="percentage">{result.percentage.toFixed(1)}%</div>
        <div className="knowledge-level">
          Level: <strong>{result.overall_knowledge_level}</strong>
        </div>
      </div>

      {/* ML Awareness Prediction */}
      {result.ml_awareness_level && (
        <div className="ml-prediction">
          <h3>🤖 ML-Based Analysis</h3>
          <div className="awareness-level">
            <strong>Awareness Level:</strong> {result.ml_awareness_level}
          </div>
          <div className="confidence">
            <strong>Prediction Confidence:</strong> {(result.ml_confidence! * 100).toFixed(1)}%
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${result.ml_confidence! * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ML-Based Recommendations */}
      {result.ml_recommendations && result.ml_recommendations.length > 0 && (
        <div className="ml-recommendations">
          <h3>📚 Personalized Recommendations</h3>
          <ul>
            {result.ml_recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Feedback with Personalized Explanations */}
      <div className="detailed-feedback">
        <h3>Question-by-Question Feedback</h3>
        {result.detailed_feedback.map((feedback, index) => (
          <div key={index} className={`feedback-item level-${feedback.level}`}>
            <h4>Question {index + 1}</h4>
            <p className="question">{feedback.question_text}</p>
            <p className="answer">
              <strong>Your Answer:</strong> {feedback.selected_option}
            </p>
            <div className="score-badge">
              Score: {feedback.score} | Level: {feedback.level}
            </div>
            
            {/* Personalized Explanation */}
            <div className="personalized-explanation">
              <strong>💡 Personalized Explanation:</strong>
              <p>{feedback.explanation}</p>
              <small className="profile-note">
                ℹ️ This explanation is tailored to your profile: 
                {result.user_profile.gender}, {result.user_profile.education_level}, 
                {result.user_profile.proficiency}
              </small>
            </div>

            {/* Enhancement Advice */}
            <div className="enhancement-advice">
              <strong>🎯 Enhancement Advice:</strong>
              <p>{feedback.enhancement_advice}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Summary */}
      <div className="profile-summary">
        <h3>Your Profile</h3>
        <p><strong>Name:</strong> {result.user_profile.name}</p>
        <p><strong>Gender:</strong> {result.user_profile.gender}</p>
        <p><strong>Education:</strong> {result.user_profile.education_level}</p>
        <p><strong>Proficiency:</strong> {result.user_profile.proficiency}</p>
        {result.user_profile.organization && (
          <p><strong>Organization:</strong> {result.user_profile.organization}</p>
        )}
      </div>

      {/* Database Status */}
      {result.saved_to_database && (
        <div className="db-status success">
          ✅ Your results have been saved to the database
        </div>
      )}
    </div>
  );

  return (
    <div className="app-permissions-assessment">
      <h1>Mobile App Permissions Assessment</h1>
      <p className="subtitle">With ML-Powered Personalized Feedback</p>

      {!result ? (
        <>
          <ProfileForm />
          <button 
            onClick={fetchQuestions} 
            disabled={!userProfile.email || !userProfile.name}
          >
            Start Assessment
          </button>

          {questions.length > 0 && (
            <div className="questions-section">
              {/* Render questions here */}
              <button onClick={submitAssessment} disabled={userAnswers.length !== questions.length}>
                Submit Assessment
              </button>
            </div>
          )}
        </>
      ) : (
        <ResultsDisplay result={result} />
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
}

// Example CSS for styling
const styles = `
.ml-prediction {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.awareness-level {
  font-size: 24px;
  margin: 10px 0;
}

.confidence-bar {
  height: 20px;
  background: rgba(255,255,255,0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.confidence-fill {
  height: 100%;
  background: white;
  transition: width 0.5s ease;
}

.ml-recommendations {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.ml-recommendations ul {
  list-style: none;
  padding: 0;
}

.ml-recommendations li {
  padding: 10px;
  margin: 5px 0;
  background: white;
  border-left: 4px solid #667eea;
  border-radius: 5px;
}

.personalized-explanation {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
}

.profile-note {
  display: block;
  margin-top: 10px;
  color: #666;
  font-style: italic;
}

.enhancement-advice {
  background: #fff3e0;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
}
`;

export default AppPermissionsAssessment;
