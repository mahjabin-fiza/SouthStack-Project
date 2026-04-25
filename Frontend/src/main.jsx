// 🔥 FIX Windows cache issue (must be FIRST)
if (typeof window !== "undefined" && !window.caches) {
  window.caches = {
    open: async () => ({
      put: async () => {},
      match: async () => undefined,
      add: async () => {},
      delete: async () => {},
    }),
  };
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
