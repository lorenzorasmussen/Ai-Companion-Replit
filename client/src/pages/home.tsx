import { useState } from "react";
import Sidebar from "@/components/sidebar";
import AppBuilder from "@/components/app-builder";
import AiNotes from "@/components/ai-notes";
import Research from "@/components/research";
import Templates from "@/components/templates";
import CalendarView from "@/components/calendar";
import EmailView from "@/components/email";
import AiChat from "@/components/ai-chat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("builder");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "builder":
        return <AppBuilder />;
      case "notes":
        return <AiNotes />;
      case "research":
        return <Research />;
      case "templates":
        return <Templates />;
      case "calendar":
        return <CalendarView />;
      case "email":
        return <EmailView />;
      default:
        return <AppBuilder />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderActiveTab()}
      </div>
      <AiChat />
    </div>
  );
}
