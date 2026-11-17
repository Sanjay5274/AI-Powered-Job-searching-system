import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./InterviewPreparation.css";

function InterviewPreparation() {
  const [category, setCategory] = useState("Technical");
  const [showAnswers, setShowAnswers] = useState({});

  const questions = {
    Technical: [
      {
        question: "What is HTML?",
        answer:
          "HTML stands for HyperText Markup Language. It is used to create the structure of web pages."
      },
      {
        question: "What is CSS?",
        answer:
          "CSS stands for Cascading Style Sheets. It is used to style and design web pages."
      },
      {
        question: "What is JavaScript?",
        answer:
          "JavaScript is a programming language used to make websites interactive and dynamic."
      },
      {
        question: "What is React?",
        answer:
          "React is a JavaScript library used to build user interfaces using reusable components."
      },
      {
        question: "What is Node.js?",
        answer:
          "Node.js is a JavaScript runtime environment that allows JavaScript to run outside the browser."
      },
      {
        question: "What is MongoDB?",
        answer:
          "MongoDB is a NoSQL database that stores data in flexible document-based format."
      }
    ],

    HR: [
      {
        question: "Tell me about yourself.",
        answer:
          "I am a motivated person interested in software development. I enjoy learning new technologies and building projects. I am looking for an opportunity to improve my skills and contribute to an organization."
      },
      {
        question: "What are your strengths?",
        answer:
          "My strengths are problem-solving, quick learning, teamwork and time management."
      },
      {
        question: "What is your weakness?",
        answer:
          "Sometimes I spend extra time checking my work. I am improving by setting priorities and managing my time effectively."
      },
      {
        question: "Why should we hire you?",
        answer:
          "I am eager to learn, adaptable and committed to my work. I will use my skills and dedication to contribute to the organization."
      },
      {
        question: "Where do you see yourself in five years?",
        answer:
          "I see myself as an experienced professional with strong technical skills, taking more responsibilities and contributing to successful projects."
      },
      {
        question: "Why do you want this job?",
        answer:
          "This role matches my interests and skills. I believe it will help me grow professionally while allowing me to contribute to the company."
      }
    ]
  };

  const toggleAnswer = (index) => {
    setShowAnswers((previous) => ({
      ...previous,
      [category + index]: !previous[category + index]
    }));
  };

  const tips = [
    "Research the company before attending an interview.",
    "Prepare a clear and confident self-introduction.",
    "Revise your technical fundamentals.",
    "Practice answering questions aloud.",
    "Explain your projects and your contributions clearly.",
    "Be honest and maintain a positive attitude."
  ];

  return (
    <DashboardLayout title="Interview Preparation">
      <div className="interview-container">

        <h2>Interview Preparation</h2>

        <p className="interview-subtitle">
          Prepare for your interviews with important questions,
          sample answers and useful tips.
        </p>

        <div className="interview-summary">
          <div className="interview-stat">
            <h3>{questions.Technical.length}</h3>
            <p>Technical Questions</p>
          </div>

          <div className="interview-stat">
            <h3>{questions.HR.length}</h3>
            <p>HR Questions</p>
          </div>

          <div className="interview-stat">
            <h3>{tips.length}</h3>
            <p>Interview Tips</p>
          </div>
        </div>

        <div className="interview-card">

          <h3>Practice Interview Questions</h3>

          <div className="interview-tabs">
            <button
              className={category === "Technical" ? "active" : ""}
              onClick={() => setCategory("Technical")}
            >
              Technical Questions
            </button>

            <button
              className={category === "HR" ? "active" : ""}
              onClick={() => setCategory("HR")}
            >
              HR Questions
            </button>
          </div>

          <div className="interview-questions">

            {questions[category].map((item, index) => (
              <div className="interview-question" key={index}>

                <h4>
                  {index + 1}. {item.question}
                </h4>

                <button
                  className="answer-button"
                  onClick={() => toggleAnswer(index)}
                >
                  {showAnswers[category + index]
                    ? "Hide Answer"
                    : "Show Answer"}
                </button>

                {showAnswers[category + index] && (
                  <div className="sample-answer">
                    <strong>Sample Answer:</strong>
                    <p>{item.answer}</p>
                  </div>
                )}

              </div>
            ))}

          </div>
        </div>

        <div className="interview-tips">

          <h3>Important Interview Tips</h3>

          {tips.map((tip, index) => (
            <div className="interview-tip" key={index}>
              <span>✓</span>
              {tip}
            </div>
          ))}

        </div>

      </div>
    </DashboardLayout>
  );
}

export default InterviewPreparation;