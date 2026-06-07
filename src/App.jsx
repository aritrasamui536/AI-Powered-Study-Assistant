import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import FlashcardView from "./components/FlashcardView";
import QuizView from "./components/QuizView";
import SummaryView from "./components/SummaryView";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        {activeTab === "chat" && <ChatView />}
        {activeTab === "flashcards" && <FlashcardView />}
        {activeTab === "quiz" && <QuizView />}
        {activeTab === "summary" && <SummaryView />}
      </main>
    </div>
  );
}