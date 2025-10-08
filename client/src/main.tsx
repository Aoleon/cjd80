import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSyncService } from "./lib/sync-service";

// Initialize offline sync service
initSyncService();

createRoot(document.getElementById("root")!).render(<App />);
