import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getResults, getChildren } from "../api";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userType = localStorage.getItem("userType");

  if (!storedUser || !userType) {
    navigate("/login");
    return;
  }

  setUser({ ...storedUser, userType });

  if (userType === "child") {
    const fetchResults = async () => {
      try {
        const allResults = await getResults(storedUser.id); 
        // allResults is now an array of child objects [{ childId, childName, tests: [...] }]
        const childObj = allResults.find(c => c.childId === storedUser.id);
        const tests = childObj?.tests || [];
        const sorted = tests.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentResults(sorted.slice(0, 3)); // latest 3
      } catch (err) {
        console.error("Error fetching recent results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  } else {
    // For parent, optionally fetch children results
    setLoading(false);
  }
}, [navigate]);


  useEffect(() => {
    const parentId = JSON.parse(localStorage.getItem("user")); 

  // Or fetch from context if you're using auth context
    const fetchChildren = async () => {
      try {
        const response = await getChildren(parentId.id);
        setChildren(response);
      } catch (err) {
        setError("Unable to load children. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (!user) return null;

  const handleViewResults = () => {
    navigate(`/child-results`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 p-6">
      {/* Header / Branding */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">ProEdge CBT App</h1>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </header>

      {/* Welcome */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-500">{user.userType === "child" ? "Student Dashboard" : "Parent Dashboard"}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-6 justify-center mb-10">
        {user.userType === "child" ? (
          <>
            <button
              onClick={() => navigate("/test-room")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-semibold shadow-md"
            >
              Start New Test
            </button>
            <button
              onClick={() => navigate("/latest-result")}
              className="bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-semibold shadow-md"
            >
              View Latest Result
            </button>
            <button
              onClick={() => navigate(`/results-history/${user.id}`)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-4 px-8 rounded-xl font-semibold shadow-md"
            >
              View Test History
            </button>
          </>
        ) : (
        <div className="p-6 space-y-6">
      {children.length === 0 ? (
        <p className="text-gray-600 text-center font-semibold">No children linked to your account yet.</p>
      ) : (
        <div className="flex justify-center gap-2">
            <button
              onClick={() => navigate("/add-child")}
              className="mx-auto bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
            >
              ➕ Add Child
           </button>

           <button
                onClick={() => handleViewResults()}
                className=" mx-auto bg-blue-600 text-center hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                View Children Results
              </button>
        </div>

      )}
    </div>
        )}
      </div>

      {/* Recent Results (Students only) */}
      {user.userType === "child" && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Recent Tests</h3>
          {loading ? (
            <p className="text-gray-600">Loading results...</p>
          ) : recentResults.length === 0 ? (
            <p className="text-gray-500">No recent tests found.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentResults.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-white shadow-md rounded-2xl p-4 text-center"
                >
                  <h4 className="font-semibold text-blue-600 mb-2">{r.exam || "Exam"}</h4>
                  <p className="text-gray-700 mb-1">Date: {new Date(r.date).toLocaleDateString()}</p>
                  <p className="text-gray-700 mb-2">Overall Score: {r.overallScore ?? r.score ?? 0}%</p>
                  <button
                    onClick={() => navigate("/latest-result", { state: { result: r } })}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
