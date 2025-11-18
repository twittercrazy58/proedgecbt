import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = async () => {
    try {
      const res = await login(username, password);
      if (res.user) {
        // Save admin user info
        localStorage.setItem("admin", JSON.stringify(res.admin));
        localStorage.setItem("userType", "admin");

        navigate("/upload-questions"); 
      } else {
        setError(res.message || "Invalid admin credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col gap-4 w-96">

        {/* Logo */}
        <img
          src="/src/assets/logo.png"
          alt="ProEdge Logo"
          className="w-6 h-auto mx-auto mb-2"
        />
        <p className="text-blue-700 text-md text-center font-bold mb-4">
          Admin Login
        </p>

        <input
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-xl"
        />

        <button
          onClick={() =>handleAdminLogin()}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          Login as Admin
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Back to normal Login */}
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 text-sm underline mt-2"
        >
          Back to User Login
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
