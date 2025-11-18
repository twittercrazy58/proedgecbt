import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TestPage from "./pages/TestPage";
import ParentResultsPage from "./pages/ParentResultsPage";
import ResultsHistory from "./pages/ResultsHistory";
import LatestResultPage from "./pages/LatestResultPage";
import ParentDashboard from "./pages/ParentDashboard";
import ChildHome from "./pages/ChildHome";
import LoginPage from "./pages/LoginPage";
import AddChildPage from "./pages/AddChildPage";
import PrivateRoute from "./components/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import QuestionsUploadPage from "./pages/QuestionsUploadPage";
import AdminLoginPage from "./pages/AdminLoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<PrivateRoute allowedRoles={['child']}><TestPage /></PrivateRoute>} />
          <Route path="/latest-result" element={<LatestResultPage />} />
          <Route path="/results-history/:childId" element={<ResultsHistory />} />
          <Route path="/child-results" element={<ParentResultsPage />} />
          {/*<Route path="/dashboard" element={<PrivateRoute allowedRoles={['parent']}><ParentDashboard /></PrivateRoute>} />*/}
          <Route path="/test-room" element={<PrivateRoute allowedRoles={['child']}><ChildHome /></PrivateRoute>} />
          <Route path="/add-child" element={<AddChildPage />} />
          <Route path="/upload-questions" element={<PrivateRoute allowedRoles={['admin']}> <QuestionsUploadPage /></PrivateRoute>} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


