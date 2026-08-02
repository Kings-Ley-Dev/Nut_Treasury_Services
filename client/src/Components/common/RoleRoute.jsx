import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const portalFor = { customer: "/login", employee: "/portal/employee", admin: "/portal/admin" };
const homeFor = { customer: "/dashboard", employee: "/employee", admin: "/admin" };

const RoleRoute = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="loader-nut">🌰</span>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to={portalFor[role]} replace />;
  if (user.role !== role) return <Navigate to={homeFor[user.role] || "/"} replace />;

  return children;
};

export default RoleRoute;
