import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Download, Eye, Code, Smartphone, Lightbulb, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CodePreview from "@/components/code-preview";

interface GeneratedApp {
  name: string;
  description: string;
  code: string;
  components: string[];
  features: string[];
  suggestions: string[];
}

export default function AppBuilder() {
  const [prompt, setPrompt] = useState("");
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-app", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedApp(data);
      toast({
        title: "App Generated Successfully",
        description: "Your app has been generated with AI assistance.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate app. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedApp) return;
      const response = await apiRequest("POST", "/api/projects", {
        name: generatedApp.name,
        description: generatedApp.description,
        type: "app",
        content: generatedApp,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Saved",
        description: "Your app has been saved to your projects.",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe what kind of app you want to build.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(prompt);
  };

  const handleExport = () => {
    if (!generatedApp) return;
    
    const blob = new Blob([generatedApp.code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedApp.name.toLowerCase().replace(/\s+/g, "-")}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">App Builder</h2>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
              AI Online
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate()}
              disabled={!generatedApp || saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
            <Button
              onClick={handleExport}
              disabled={!generatedApp}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Prompt Interface */}
        <div className="w-96 bg-slate-800/30 border-r border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h3 className="font-semibold mb-3">Describe Your App</h3>
            <div className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32 bg-slate-800 border-slate-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell me what kind of app you want to build. For example: 'Create a task management app with drag-and-drop functionality, user authentication, and a dark theme'"
              />
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full ai-gradient hover:opacity-90"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Generate App
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="flex-1 overflow-y-auto p-6">
            <h4 className="font-medium mb-4 text-slate-300">AI Suggestions</h4>
            <div className="space-y-3">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Lightbulb className="text-blue-400 w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">Add User Authentication</h5>
                      <p className="text-xs text-slate-400">
                        Implement login/signup with social auth options
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Palette className="text-purple-400 w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">Customize Theme</h5>
                      <p className="text-xs text-slate-400">
                        Apply custom colors and branding
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <Database className="text-emerald-400 w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">Add Database</h5>
                      <p className="text-xs text-slate-400">
                        Connect to PostgreSQL or MongoDB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Templates */}
            <div className="mt-8">
              <h4 className="font-medium mb-4 text-slate-300">Quick Start Templates</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-3 flex-col items-start border-slate-700 hover:border-slate-600"
                  onClick={() => setPrompt("Create a simple todo app with add, edit, delete, and mark complete functionality")}
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium">Todo App</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex-col items-start border-slate-700 hover:border-slate-600"
                  onClick={() => setPrompt("Build an e-commerce website with product listings, cart, and checkout")}
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="text-sm font-medium">E-commerce</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex-col items-start border-slate-700 hover:border-slate-600"
                  onClick={() => setPrompt("Create a dashboard with charts, metrics, and data visualization")}
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium">Dashboard</div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex-col items-start border-slate-700 hover:border-slate-600"
                  onClick={() => setPrompt("Build a blog platform with post creation, editing, and comments")}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium">Blog</div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Preview Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="preview" className="flex-1 flex flex-col">
            <div className="bg-slate-800/30 border-b border-slate-700 px-6">
              <TabsList className="bg-transparent border-b-2 border-transparent h-auto p-0 space-x-1">
                <TabsTrigger
                  value="preview"
                  className="px-4 py-3 text-sm font-medium bg-slate-800 text-slate-200 border-b-2 border-blue-500 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-200 data-[state=active]:border-blue-500"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-300 border-b-2 border-transparent data-[state=active]:bg-slate-800 data-[state=active]:text-slate-200 data-[state=active]:border-blue-500"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-300 border-b-2 border-transparent data-[state=active]:bg-slate-800 data-[state=active]:text-slate-200 data-[state=active]:border-blue-500"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 m-0">
              <CodePreview generatedApp={generatedApp} isLoading={generateMutation.isPending} />
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0">
              <div className="h-full bg-slate-900 p-6 overflow-auto">
                {generatedApp ? (
                  <pre className="bg-slate-800 p-4 rounded-lg text-sm font-mono overflow-auto">
                    <code>{generatedApp.code}</code>
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Generate an app to see the code
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="flex-1 m-0">
              <div className="h-full bg-slate-900 p-6 flex items-center justify-center">
                <div className="w-80 h-[600px] bg-slate-800 rounded-3xl p-4 border border-slate-700">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    {generatedApp ? (
                      <div className="p-4 text-black text-sm">
                        <h3 className="font-semibold mb-2">Mobile Preview</h3>
                        <p className="text-gray-600">
                          {generatedApp.description}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Generate an app to see mobile preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
