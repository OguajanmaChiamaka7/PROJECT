import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveUserProfile } from "../services/saveUserProfile";
import "../styles/ProfileSetup.css";
import { initializeUserTasks } from "../services/firestore";

const questions = [
  {
    id: "age",
    question: "Q1: Age Range (Badge: Rookie, Explorer, or Veteran)",
    options: ["Under 18", "18–24", "25–34", "35–44", "45+"],
    reward: "🎁 Earn 50 XP",
  },
  {
    id: "occupation",
    question: "Q2: What best describes you? (Badge: Pathfinder)",
    options: [
      "Student",
      "Working full-time",
      "Entrepreneur / Self-employed",
      "Freelancer / Part-time",
      "Not working currently",
    ],
    reward: "🎁 Earn 50 XP",
  },
  {
    id: "income",
    question: "Q3: Monthly Treasure Chest (Income Range)",
    options: [
      "Less than ₦50,000",
      "₦50,000 – ₦150,000",
      "₦150,000 – ₦500,000",
      "₦500,000+",
    ],
    reward: "🎁 Earn 100 XP",
  },
  {
    id: "financialGoal",
    question: "Q4: What's your main quest? (Financial Goal Badge)",
    options: [
      "Save more money",
      "Budget better",
      "Invest and grow wealth",
      "Pay off debt",
      "Build financial discipline",
    ],
    reward: "🎁 Earn 100 XP + Unlock Goal Badge",
  },
  {
    id: "moneyPersona",
    question: "Q5: Which money persona fits you best? (Persona Badge)",
    options: [
      "🐿️ The Saver — I stash money whenever I can",
      "🛍️ The Spender — I enjoy my money now",
      "📈 The Investor — I want my money to grow",
      "🎯 The Goal-Getter — I save and spend with purpose",
    ],
    reward: "🎁 Earn 200 XP + Unlock Money Persona Badge",
  },
];

// ✅ XP rewards mapping
const xpRewards = {
  age: 50,
  occupation: 50,
  income: 100,
  financialGoal: 100,
  moneyPersona: 200,
};

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [xp, setXp] = useState(0); // ✅ XP tracking state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = questions.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // ✅ Updated handleOptionSelect with XP logic
  const handleOptionSelect = (option) => {
    const qId = questions[currentStep].id;
    const alreadyAnswered = answers[qId];
    
    // Only add XP if it's the first time answering this question
    if (!alreadyAnswered) {
      setXp((prev) => prev + xpRewards[qId]);
    }
    
    setAnswers({ ...answers, [qId]: option });
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submit
      setLoading(true);
      setError("");
      try {
        if (!currentUser || !currentUser.uid) {
          throw new Error("No authenticated user found.");
        }
        
        // ✅ Save profile with XP
        await saveUserProfile(currentUser.uid, {
          ...answers,
          profileCompleted: true,
           xp,         
           level: 1,      // ✅ start at level 1
           badges: [],    // ✅ empty badge list
          updatedAt: new Date(),
        });
        await initializeUserTasks(currentUser.uid);
        

        // 👇 force a reload so ProtectedRoute sees the update
      window.location.href = "/app";
        
        // navigate("/app");
      } catch (err) {
        console.error("Profile setup failed:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="profile-setup-container">
      {/* ✅ Welcome heading shown only on first step, outside profile-card
      {currentStep === 0 && (
        <h2 className="welcome-heading">
          Welcome, Adventurer! Before we start your financial journey, let's set up your profile.
          Every answer earns you XP points!
        </h2>
      )}
      */}

      <div className="profile-card">
        {error && <div className="error-message">{error}</div>}

        {/* 👇 Actual question */}
        <h2 className="question-title">
          {questions[currentStep].question}
        </h2>

        <div className="options-container">
          {questions[currentStep].options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                answers[questions[currentStep].id] === option ? "selected" : ""
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="reward-text">{questions[currentStep].reward}</p>

        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!answers[questions[currentStep].id] || loading}
        >
          {loading
            ? "Saving..."
            : currentStep === totalSteps - 1
            ? "Finish"
            : "Next →"}
        </button>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="progress-text">
          {currentStep + 1} / {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;