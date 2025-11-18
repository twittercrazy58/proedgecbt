import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults } from "../api";

function formatDateISO(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

const LatestResultPage = () => {
  const navigate = useNavigate();
  const [latestTest, setLatestTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(true);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser.id)
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    const fetchLatest = async () => {
      setLoading(true);
      try {
        const allChildren = await getResults(loggedUser.id);
        // allChildren is an array of child objects [{ childId, childName, tests: [...] }]
        const childObj = allChildren.find(c => c.childId === loggedUser.id);
        const tests = childObj?.tests || [];
        if (tests.length === 0) {
          setLatestTest(null);
        } else {
          // Sort by date descending
          tests.sort((a, b) => new Date(b.date) - new Date(a.date));
          setLatestTest(tests[0]);
        }
      } catch (err) {
        console.error("Error fetching latest test:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading latest result...</p>
      </div>
    );
  }

  if (!latestTest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold">No recent tests found.</h2>
        <p className="text-gray-600 mt-2">Take a test to see the latest results.</p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-purple-50 to-blue-50 py-12 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">ProEdge CBT — Latest Test Result</h1>
            <p className="text-gray-600 mt-1">{latestTest.exam} — {formatDateISO(latestTest.date)}</p>
            <p className="text-gray-500 mt-1">Student: <strong>{latestTest.childName}</strong></p>
          </div>
          <div className="text-right">
            <button
              onClick={() => navigate(`/results-history/${user}`)}
              className="mr-2 bg-gray-200 px-3 py-1 rounded"
            >
              View History
            </button>
            <button
              onClick={() => navigate("/test-room")}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1 bg-gray-50 p-6 rounded-lg text-center">
            <div className="text-sm text-gray-600">Overall Score</div>
            <div className="text-4xl font-extrabold text-blue-700">
              {typeof latestTest.overallScore === "number"
                ? `${Math.round(latestTest.overallScore)}%`
                : "N/A"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Date: {formatDateISO(latestTest.date)}</div>
          </div>

          <div className="md:col-span-2 bg-white border p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Per-subject performance</h3>

            {Array.isArray(latestTest.subjects) && latestTest.subjects.length > 0 ? (
              <div className="space-y-3">
                {latestTest.subjects.map((s) => (
                  <div key={s.subject} className="flex justify-between items-center border p-3 rounded">
                    <div>
                      <div className="font-medium">{s.subject}</div>
                      <div className="text-sm text-gray-500">Correct: {s.correct} / {s.total}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {s.percent ?? Math.round((s.correct / s.total) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No subject details available for this test.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestResultPage;
