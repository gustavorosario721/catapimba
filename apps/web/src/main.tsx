import { createRoot } from "react-dom/client";

import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";

import { AccessibilityProvider } from "./features/accessibility/AccessibilityProvider";
import { AccessibilityPanel } from "./features/accessibility/AccessibilityPanel";
import "./index.css";
import "./features/login/login.css";

createRoot(document.getElementById("root")!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    if (import.meta.env.DEV) console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <AccessibilityProvider>
      <AccessibilityPanel />
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <App />
    </AccessibilityProvider>
  </ErrorBoundary>,
);
