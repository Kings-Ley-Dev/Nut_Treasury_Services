import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/Toast";

// Note: React.StrictMode intentionally omitted. In development it double-invokes
// effects, which fired (and immediately cancelled) duplicate API requests and
// showed up as "Network Error" / rate-limit noise in the dashboards.
createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ToastProvider>
);
