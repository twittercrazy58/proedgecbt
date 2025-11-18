import React, { useEffect, useState } from "react";
import { getChildren, createChild } from "../api";
import NavBar from "../components/NavBar";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

   const [newChild, setNewChild] = useState({
    name: "",
    username: "",
    password: "",
    examType: "WAEC",
  });

  useEffect(() => {
    const fetchChildren = async () => {
      const data = await getChildren(user.id);
      setChildren(data);
    };
    fetchChildren();
  }, [user.id]);

  const handleCreateChild = async () => {
    setError("");
    if (!newChild.name || !newChild.username || !newChild.password) {
      setError(res.message);
      return;
    }

    const childData = {
      ...newChild,
      parentId: user.id,
      userType: "child",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await createChild(childData);
      setError("");

      if (res.error) {
        setError(res.message);
      } else {
        // Reset form
        setNewChild({ name: "", username: "", password: "", examType: "WAEC" });

        // Refresh children list
        const updatedChildren = await getChildren(user.id);
        setChildren(updatedChildren);
      }
    } catch (error) {
      console.error("Error creating child:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-10 flex flex-col items-center">
      <NavBar user={user} />
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">
            Parent Dashboard
          </h1>
        </div>

        {/* Child creation form */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-blue-700">
            Create New Child Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Child Name"
              value={newChild.name}
              onChange={(e) =>
                setNewChild({ ...newChild, name: e.target.value })
              }
              className="border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="Username"
              value={newChild.username}
              onChange={(e) =>
                setNewChild({ ...newChild, username: e.target.value })
              }
              className="border p-3 rounded-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={newChild.password}
              onChange={(e) =>
                setNewChild({ ...newChild, password: e.target.value })
              }
              className="border p-3 rounded-lg"
            />
            <select
              value={newChild.examType}
              onChange={(e) =>
                setNewChild({ ...newChild, examType: e.target.value })
              }
              className="border p-3 rounded-lg"
            >
              <option value="WAEC">WAEC</option>
              <option value="BECE">BECE</option>
            </select>
          </div>
          <button
            onClick={handleCreateChild}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mt-2"
          >
            Create Child
          </button>
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        </div>

        {/* Children list */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-inner flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-blue-700">
            Your Children
          </h2>
          {children.length === 0 && <p className="text-gray-600">No children yet.</p>}
          {children.length > 0 && (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Username</th>
                  <th className="border px-4 py-2">Exam Type</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{c.name}</td>
                    <td className="border px-4 py-2">{c.username}</td>
                    <td className="border px-4 py-2">{c.examType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
