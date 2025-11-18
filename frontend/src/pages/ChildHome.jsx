import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SubjectSelector from "../components/SubjectSelector";
import { getQuestions } from "../api";

const subjectsBank = {
  WAEC: ["Mathematics", "English", "Physics", "Chemistry", "Biology"],
  BECE: ["Mathematics", "English Language", "Basic Science", "Social Studies", "ICT"],
};

const ChildHome = () => {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [allowedSubjects, setAllowedSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Load child info & allowed subjects
  useEffect(() => {
    const loggedChild = JSON.parse(localStorage.getItem("user"));
    if (!loggedChild) {
      navigate("/login");
      return;
    }
    setChild(loggedChild);

    // Fetch subjects dynamically if API available
    getQuestions(loggedChild.examType, "")
      .then((questions) => {
        if (Array.isArray(questions) && questions.length > 0) {
          const subjectsSet = new Set(questions.map((q) => q.subject));
          setAllowedSubjects([...subjectsSet]);
        } else {
          setAllowedSubjects(subjectsBank[loggedChild.examType] || []);
        }
      })
      .catch(() => {
        setAllowedSubjects(subjectsBank[loggedChild.examType] || []);
      });
  }, []);

  const handleStartTest = () => {
    if (selectedSubjects.length === 0) return alert("Please select at least one subject");
    navigate(`/test?subjects=${selectedSubjects.join(",")}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  if (!child) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-10">
      <NavBar user={child} />
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-2xl w-full flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-blue-700">Welcome, {child.name} 👋</h1>
        <p className="text-gray-600">
          Exam Type: <span className="font-semibold">{child.examType}</span>
        </p>

        {/* Subject selector */}
        <SubjectSelector
          allowedSubjects={allowedSubjects}
          selectedSubjects={selectedSubjects}
          onChange={setSelectedSubjects}
        />

        <button
          onClick={handleStartTest}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-4"
        >
          Start Test
        </button>
         <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-semibold shadow-md"
            >
              Dashboard
            </button>

        <button
          onClick={handleLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl mt-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ChildHome;
