import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Code, StickyNote, Search, Layers, Settings, Circle, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import GoogleAuth from "@/components/google-auth";

interface Project {
  id: number;
  name: string;
  type: string;
  updatedAt: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const recentProjects = projects.slice(0, 3);

  const getProjectIcon = (type: string) => {
    switch (type) {
      case "app":
        return "🌐";
      case "note":
        return "📝";
      case "research":
        return "🔬";
      case "calendar":
        return "📅";
      case "email":
        return "📧";
      default:
        return "📁";
    }
  };

  const getProjectColor = (type: string) => {
    switch (type) {
      case "app":
        return "from-emerald-400 to-emerald-600";
      case "note":
        return "from-purple-400 to-purple-600";
      case "research":
        return "from-orange-400 to-orange-600";
      case "calendar":
        return "from-indigo-400 to-indigo-600";
      case "email":
        return "from-cyan-400 to-cyan-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updatedAt = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-700">
        <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
          <Code className="text-white w-4 h-4" />
        </div>
        <h1 className="text-xl font-semibold">AI Studio</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="space-y-1">
          <Button
            variant={activeTab === "builder" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              activeTab === "builder"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("builder")}
          >
            <Code className="w-4 h-4" />
            <span>App Builder</span>
            {activeTab === "builder" && (
              <Circle className="ml-auto w-2 h-2 fill-blue-400 text-blue-400" />
            )}
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${
              activeTab === "notes"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            <StickyNote className="w-4 h-4" />
            <span>AI Notes</span>
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${
              activeTab === "research"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("research")}
          >
            <Search className="w-4 h-4" />
            <span>Research</span>
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${
              activeTab === "templates"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("templates")}
          >
            <Layers className="w-4 h-4" />
            <span>Templates</span>
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${
              activeTab === "calendar"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("calendar")}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 ${
              activeTab === "email"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveTab("email")}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </Button>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Recent Projects
          </h3>
          <div className="space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <button
                  key={project.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`w-6 h-6 bg-gradient-to-br ${getProjectColor(project.type)} rounded flex items-center justify-center text-xs`}>
                    {getProjectIcon(project.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-slate-300 truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTimeAgo(project.updatedAt)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                No recent projects
              </p>
            )}
          </div>
        </div>

        {/* Google Integration */}
        <div className="pt-4 mt-4 border-t border-slate-700">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Google Integration
          </h3>
          <GoogleAuth />
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=64&h=64&fit=crop&crop=face" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium">Alex Thompson</div>
            <div className="text-xs text-slate-400">Pro Plan</div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
