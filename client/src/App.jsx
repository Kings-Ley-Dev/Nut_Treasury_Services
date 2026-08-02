import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./Layout/RootLayout";
import RoleRoute from "./Components/common/RoleRoute";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Services from "./Pages/Services";
import Apply from "./Pages/Apply";
import Contact from "./Pages/Contact";
import Privacy from "./Pages/Privacy";
import Terms from "./Pages/Terms";
import Security from "./Pages/Security";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminPortal from "./Pages/AdminPortal";
import EmployeePortal from "./Pages/EmployeePortal";
import Dashboard from "./Pages/Dashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import EmployeeDashboard from "./Pages/EmployeeDashboard";
import NotFound from "./Pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "services", element: <Services /> },
      { path: "apply", element: <Apply /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "security", element: <Security /> },
      {
        path: "dashboard",
        element: (
          <RoleRoute role="customer">
            <Dashboard />
          </RoleRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  // Public customer auth
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  // Hidden staff portals (not linked publicly)
  { path: "/portal/admin", element: <AdminPortal /> },
  { path: "/portal/employee", element: <EmployeePortal /> },
  // Role dashboards (full-screen)
  {
    path: "/admin",
    element: (
      <RoleRoute role="admin">
        <AdminDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/employee",
    element: (
      <RoleRoute role="employee">
        <EmployeeDashboard />
      </RoleRoute>
    ),
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
