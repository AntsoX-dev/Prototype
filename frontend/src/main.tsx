import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ReactQueryProvider from "./fournisseur/react-query";
import { AuthProvider } from "./fournisseur/auth-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ReactQueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ReactQueryProvider>
    </BrowserRouter>
  </StrictMode>
);
