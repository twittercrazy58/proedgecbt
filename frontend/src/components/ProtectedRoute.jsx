import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedUserType }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || (allowedUserType && user.userType !== allowedUserType)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
