import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResults } from "../api";
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

const ResultHistoryPage = () => {
  const navigate = useNavigate();
  const { childId } = useParams(); // now using URL param
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected test object

  useEffect(() => {
    if (!childId) {
      navigate("/login");
      return;
    }

    const fetchChildTests = async () => {
      setLoading(true);
      try {
        const allChildren = await getResults(Number(childId));
        // find the child object
        const childObj = allChildren.find(c => c.childId === Number(childId));
        const tests = childObj?.tests || [];
        // sort newest first
        tests.sort((a, b) => new Date(b.date) - new Date(a.date));
        setResults(tests);
        if (tests[0]) setSelected(tests[0]);
      } catch (err) {
        console.error("Error fetching child tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildTests();
  }, [childId, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // prepare data for line chart: one point per test
    const chartData = results
    .map((r) => ({
      rawDate: r.date,                        // <-- important
      date: friendlyDate(r.date),
      score: typeof r.overallScore === "number"
        ? Math.round(r.overallScore)
        : null,
    }))
    .filter((p) => p.score !== null);
    const orderedChartData = [...chartData].sort(
      (a, b) => new Date(a.rawDate) - new Date(b.rawDate)
    );


  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Test History</h1>
          <div>
            <button onClick={() => navigate("/")} className="bg-gray-200 px-3 py-1 rounded mr-2">Home</button>
            <button onClick={() => navigate(`/latest-result`)} className="bg-blue-600 text-white px-3 py-1 rounded">Latest Result</button>
          </div>
        </div>

        <div className="w-full bg-white p-4 rounded-xl shadow mb-6">
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
                  tension: 0.3
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-3">Tests</h3>
            {results.length === 0 && <p>No tests yet.</p>}
            {results.map((r) => (
              <div key={r.id} className="border rounded p-3 mb-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.exam ?? "Exam"}</div>
                  <div className="text-sm text-gray-500">Date: {friendlyDate(r.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{typeof r.overallScore === "number" ? `${Math.round(r.overallScore)}%` : "N/A"}</div>
                  <div className="mt-2">
                    <button onClick={() => setSelected(r)} className="bg-blue-600 text-white px-3 py-1 rounded">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Selected Test Detail</h3>
            {!selected ? (
              <p className="text-gray-600">Pick a test to view details.</p>
            ) : (
              <div className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{selected.exam ?? "Exam"}</div>
                    <div className="text-sm text-gray-500">Date: {friendlyDate(selected.date)}</div>
                  </div>
                  <div className="text-3xl font-extrabold text-blue-700">
                    {typeof selected.overallScore === "number" ? `${Math.round(selected.overallScore)}%` : "N/A"}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {Array.isArray(selected.subjects) && selected.subjects.length > 0 ? (
                    selected.subjects.map((s) => (
                      <div key={s.subject} className="border p-2 rounded">
                        <div className="flex justify-between">
                          <div className="font-medium">{s.subject}</div>
                          <div className="font-semibold">{s.correct} / {s.total} — {s.percent}%</div>
                        </div>
                        {s.topicBreakdown && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Topics:</strong>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              {Object.entries(s.topicBreakdown).map(([t, val]) => (
                                <div key={t} className="text-xs bg-gray-100 p-1 rounded">
                                  {t}: {val.correct}/{val.total}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No subject breakdown for this test.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultHistoryPage;
