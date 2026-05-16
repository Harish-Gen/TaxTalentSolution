import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance, initialiseMsal } from "./utils/b2c/msalInstance";
import App from "./App.tsx";
import { ParseToken } from "./components/ParseToken";
import { isParseTokenRoute } from "./utils/appPaths";
import "./index.css";

async function bootstrap() {
  const root = document.getElementById("root")!;

  if (isParseTokenRoute()) {
    createRoot(root).render(<ParseToken />);
    return;
  }

  await initialiseMsal();
  createRoot(root).render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
}

bootstrap();
