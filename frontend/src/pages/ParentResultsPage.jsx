// src/pages/ParentResultsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getChildren, getResults } from "../api";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function friendlyDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

const ParentResultsPage = () => {
  const navigate = useNavigate();

  // Prevent parent reference changes
  const parent = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all children ONCE
  useEffect(() => {
    if (!parent) {
      navigate("/login");
      return;
    }

    const fetchChildren = async () => {
      try {
        const data = await getChildren(parent.id);
        setChildren(Array.isArray(data) ? data : []);

        // Select first child by default
        if (Array.isArray(data) && data.length > 0) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchChildren();
  }, [navigate]);

  // Fetch results for the selected child
  useEffect(() => {
    if (!selectedChild) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const allChildrenResults = await getResults(selectedChild.id);
        // Find child object in grouped schema
        const childData = allChildrenResults.find(
          (c) => c.childId === selectedChild.id
        );
        const tests = childData?.tests ?? [];
        // Sort tests by date ascending
        tests.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setResults(tests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedChild]);

  // Memoized chart data for overall score trend
  // Memoized chart data for overall score trend
const chartData = useMemo(
  () =>
    results
      .map((r) => ({
        rawDate: r.date,                               // ← needed for correct sorting
        date: friendlyDate(r.date),
        score:
          typeof r.overallScore === "number"
            ? Math.round(r.overallScore)
            : null,
      }))
      .filter((p) => p.score !== null),
  [results]
);

const orderedChartData = useMemo(() => {
  return [...chartData].sort(
    (a, b) => new Date(a.rawDate) - new Date(b.rawDate)
  );
}, [chartData]);


  // Memoized subject averages across tests
  const subjectAverages = useMemo(() => {
    const acc = {};
    results.forEach((t) => {
      if (!Array.isArray(t.subjects)) return;
      t.subjects.forEach((s) => {
        if (!acc[s.subject]) acc[s.subject] = { totalPercent: 0, count: 0 };
        acc[s.subject].totalPercent += s.percent ?? Math.round((s.correct / s.total) * 100);
        acc[s.subject].count += 1;
      });
    });
    return Object.entries(acc).map(([subject, v]) => ({
      subject,
      avg: Math.round(v.totalPercent / v.count)
    }));
  }, [results]);

  if (!parent) return null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            Parent — Child Results
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            Dashboard
          </button>
        </div>

        {/* Child Selector */}
        <div className="mb-6">
          <label className="block mb-2">Select child:</label>
          <select
            className="border p-2 rounded"
            value={selectedChild?.id ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const c = children.find((ch) => ch.id === id);
              setSelectedChild(c);
            }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.username})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Loading results...</div>
        ) : (
          <>
            {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Overall Score Line Chart */}
          <div className="w-full bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Overall Score Trend</h3>

            {chartData.length === 0 ? (
              <p className="text-gray-600">No trend data.</p>
            ) : (
              <Line
                data={{
                  labels: orderedChartData.map((d) => d.date),
                  datasets: [
                    {
                      label: "Score →",
                      data: orderedChartData.map((d) => d.score),
                      borderWidth: 2,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.3)",
                      tension: 0.3,
                    }
                  ]
                }}
                options={{
                  responsive: false,
                  maintainAspectRatio: true,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Time →",
                        color: "#444",
                        font: { size: 14, weight: "600" }
                      }
                    },
                    y: { min: 0, max: 100 }
                  }
                }}
                height={220}
              />
            )}
          </div>

          {/* Average by Subject Bar Chart */}
          <div className="w-full bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Average by Subject</h3>
            
            {subjectAverages.length === 0 ? (
              <p className="text-gray-600">No subject data available.</p>
            ) : (
              <Bar
                height={220}
                data={{
                  labels: subjectAverages.map((s) => s.subject),
                  datasets: [
                    {
                      label: "Average %",
                      data: subjectAverages.map((s) => s.avg),
                      backgroundColor: "rgba(54, 162, 235, 0.6)"
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: { y: { min: 0, max: 100 } }
                }}
              />
            )}
          </div>

        </div>


            {/* Test List */}
            <div>
              <h3 className="font-semibold mb-3">All Tests (newest first)</h3>
              {results.length === 0 ? (
                <p className="text-gray-600">No tests found for this child.</p>
              ) : (
                results.slice().reverse().map((r) => (
                  <div key={r.id} className="border rounded p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{r.exam ?? "Exam"}</div>
                        <div className="text-sm text-gray-500">{friendlyDate(r.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {typeof r.overallScore === "number" ? `${Math.round(r.overallScore)}%` : "N/A"}
                        </div>
                      </div>
                    </div>

                    {Array.isArray(r.subjects) && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {r.subjects.map((s) => (
                          <div key={s.subject} className="p-2 border rounded">
                            <div className="font-medium">{s.subject}</div>
                            <div className="text-sm text-gray-600">
                              {s.correct} / {s.total} — {s.percent}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentResultsPage;
