import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { MeetingAssistant } from "@/components/meeting-assistant";

// Using the MeetingAssistant component from the pasted file
// createRoot(document.getElementById("root")!).render(<MeetingAssistant />);

// Using our custom App component with routing
createRoot(document.getElementById("root")!).render(<App />);
