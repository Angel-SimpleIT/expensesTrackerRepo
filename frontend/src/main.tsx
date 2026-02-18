import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AuthProvider } from "./app/contexts/AuthContext";

// Suppress "AbortError" unhandled rejections from Supabase/React StrictMode
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.name === 'AbortError' || event.reason?.message?.includes('aborted')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
