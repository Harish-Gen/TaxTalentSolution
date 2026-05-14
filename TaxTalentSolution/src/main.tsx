
  import { createRoot } from "react-dom/client";
  import { MsalProvider } from "@azure/msal-react";
  import { msalInstance, initialiseMsal } from "./utils/b2c/msalInstance";
  import App from "./App.tsx";
  import "./index.css";

  // Initialise MSAL (handles redirect responses) then mount the app
  initialiseMsal().then(() => {
    createRoot(document.getElementById("root")!).render(
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    );
  });
  