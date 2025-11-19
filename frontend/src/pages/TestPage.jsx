import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { getQuestions } from "../api";

// const res = await fetch("/questions/add", {
//   method: "POST",
//   headers: { "x-dev-key": import.meta.env.VITE_DEV_KEY },
//   body: formData
// });


const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://your-backend.onrender.com";
  // import.meta.env.VITE_API_URL ||


const TestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectsParam = searchParams.get("subjects");

  const subjects = useMemo(
    () => (subjectsParam ? subjectsParam.split(",") : []),
    [subjectsParam]
  );

  const [questions, setQuestions] = useState({});
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(subjects.length * 30 * 60);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [child] = useState(() => JSON.parse(localStorage.getItem("user")));

  // Redirect if not logged in
  useEffect(() => {
    if (!child) navigate("/login");
  }, [child, navigate]);

  // Fetch questions
  useEffect(() => {
    if (!child?.examType || subjects.length === 0) return;

    const fetchAll = async () => {
      const all = {};
      for (const subj of subjects) {
        const data = await getQuestions(child.examType, subj);
        const limit = subj.toLowerCase() === "english language" ? 60 : 40;

        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, limit);

        all[subj] = selected.map((q, idx) => ({
          ...q,
          displayNumber: idx + 1,
        }));
      }
      setQuestions(all);
    };

    fetchAll();
  }, [subjects, child]);

  // Timer
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerId);
          handleSubmit();
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const currentSubject = subjects[currentSubjectIndex];
  const subjectQuestions = questions[currentSubject] || [];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  const handleAnswer = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentSubject]: { ...prev[currentSubject], [qId]: option },
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else if (currentSubjectIndex < subjects.length - 1) {
      setCurrentSubjectIndex((i) => i + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else if (currentSubjectIndex > 0) {
      const prevSub = subjects[currentSubjectIndex - 1];
      setCurrentSubjectIndex((i) => i - 1);
      setCurrentQuestionIndex((questions[prevSub]?.length || 1) - 1);
    }
  };

  const handleSubmit = async () => {
    const subjectsArray = subjects.map((subj) => {
      const subjQs = questions[subj] || [];
      const subjAns = answers[subj] || {};
      const correct = subjQs.filter((q) => subjAns[q.id] === q.answer).length;

      const topicBreakdown = {};
      subjQs.forEach((q) => {
        if (!topicBreakdown[q.topic])
          topicBreakdown[q.topic] = { correct: 0, total: 0 };
        topicBreakdown[q.topic].total++;
        if (subjAns[q.id] === q.answer) topicBreakdown[q.topic].correct++;
      });

      return {
        subject: subj,
        questionsCount: subjQs.length,
        correct,
        total: subjQs.length,
        percent: subjQs.length
          ? Math.round((correct / subjQs.length) * 100)
          : 0,
        topicBreakdown,
      };
    });

    const overallScore = Math.round(
      subjectsArray.reduce((a, s) => a + s.percent, 0) /
        subjectsArray.length
    );

    const payload = {
      childId: child.id,
      childName: child.name,
      parentId: child.parentId ?? null,
      exam: child.examType,
      date: new Date().toISOString(),
      overallScore,
      subjects: subjectsArray,
    };

    await fetch(`${BASE_URL}/test/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    navigate("/latest-result", { state: { results: payload }, replace: true });
  };

  /** APPLY RULE:
   * If subject !== Mathematics:
   * convert **word** → *word* BEFORE KaTeX parsing
   */
  const preprocessItalics = (text) => {
    if (!text) return "";
    if (currentSubject?.toLowerCase() === "mathematics") return text;
    return text.replace(/\*\*(.*?)\*\*/g, "*$1*");
  };

  const renderMathText = (text) => {
    if (!text) return null;

    const processed = preprocessItalics(text);

    const parts = processed.split(/\$(.*?)\$/g);
    return parts.map((part, idx) =>
      idx % 2 === 1 ? <InlineMath key={idx} math={part} /> : part
    );
  };

  if (!currentQuestion && subjectQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading questions...
      </div>
    );
  }

  const isFirst = currentSubjectIndex === 0 && currentQuestionIndex === 0;
  const isLast =
    currentSubjectIndex === subjects.length - 1 &&
    currentQuestionIndex === subjectQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex flex-col md:flex-row md:justify-center md:items-start gap-6">

      {/* MOBILE SIDEBAR BUTTON */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* MAIN QUESTION CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl flex flex-col gap-4">
        <h1 className="text-xl font-bold text-center">
          {child?.name}'s Test
        </h1>

        <p className="mb-2 text-center">
          Time Remaining: {Math.floor(timer / 60)}:
          {("0" + (timer % 60)).slice(-2)}
        </p>

        {/* Subject Chips */}
      <div className="flex mt-4 gap-2 flex-wrap">
        {subjects.map((subj, idx) => (
          <button
            key={subj}
            onClick={() => {
              setCurrentSubjectIndex(idx);
              setCurrentQuestionIndex(0);
            }}
            className={`px-3 py-1 rounded-lg ${
              idx === currentSubjectIndex ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

        {/* Question */}
        <p className="font-medium break-words">
          {currentQuestion.displayNumber}.{" "}
          {renderMathText(currentQuestion.question)}
        </p>

        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt=""
            className="rounded-lg w-full max-h-64 object-contain my-3"
          />
        )}

        {/* Options */}
        <div className="flex flex-col gap-2">
          {currentQuestion.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(currentQuestion.id, opt)}
              className={`border p-3 rounded-lg text-left break-words ${
                answers[currentSubject]?.[currentQuestion.id] === opt
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {renderMathText(opt)}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={prevQuestion}
            disabled={isFirst}
            className={`flex-1 py-3 rounded-xl text-white ${
              isFirst
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            Previous
          </button>

          <button
            onClick={nextQuestion}
            disabled={isLast}
            className={`flex-1 py-3 rounded-xl text-white ${
              isLast
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Next
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl mt-6"
        >
          Submit Test
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-white shadow-xl p-4 z-40 overflow-y-auto
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:static md:h-auto md:w-64 md:shadow-lg md:rounded-xl
          md:sticky md:top-6
        `}
      >
        {/* Close Button Mobile */}
        <button
          className="md:hidden text-red-600 font-bold mb-4"
          onClick={() => setSidebarOpen(false)}
        >
          ✕ Close
        </button>

        <h3 className="text-center font-semibold mb-2">{currentSubject}</h3>

        <div className="grid grid-cols-4 gap-4">
          {subjectQuestions.map((q, idx) => {
            const answered = answers[currentSubject]?.[q.id];
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`px-3 py-2 rounded-lg text-sm text-center
                  ${isCurrent ? "bg-blue-600 text-white" : ""}
                  ${!isCurrent && answered ? "bg-green-500 text-white" : ""}
                  ${!isCurrent && !answered ? "bg-gray-200" : ""}
                `}
              >
                {q.displayNumber || idx + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TestPage;
