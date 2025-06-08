import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, BookOpen, ExternalLink, Lightbulb, TrendingUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ResearchResult {
  summary: string;
  keyPoints: string[];
  sources: string[];
  insights: string[];
  relatedTopics: string[];
}

interface ResearchProject {
  id: number;
  name: string;
  content: any;
  type: string;
  createdAt: string;
}

export default function Research() {
  const [query, setQuery] = useState("");
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: researchProjects = [] } = useQuery<ResearchProject[]>({
    queryKey: ["/api/projects"],
    select: (data) => data.filter(project => project.type === "research"),
  });

  const researchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/research", { query });
      return response.json();
    },
    onSuccess: (data) => {
      setResearchResult(data);
      toast({
        title: "Research Complete",
        description: "AI has gathered comprehensive insights on your topic.",
      });
    },
    onError: () => {
      toast({
        title: "Research Failed",
        description: "Failed to complete research. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveResearchMutation = useMutation({
    mutationFn: async () => {
      if (!researchResult) return;
      const response = await apiRequest("POST", "/api/projects", {
        name: `Research: ${query}`,
        description: researchResult.summary.substring(0, 100) + "...",
        type: "research",
        content: { query, ...researchResult },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Research Saved",
        description: "Your research has been saved to your projects.",
      });
    },
  });

  const handleResearch = () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a research topic.",
        variant: "destructive",
      });
      return;
    }
    researchMutation.mutate(query);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">AI Research</h2>
            <Badge variant="outline" className="border-orange-500/20 text-orange-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              Smart Analysis
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => saveResearchMutation.mutate()}
              disabled={!researchResult || saveResearchMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Research
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Research History */}
        <div className="w-80 bg-slate-800/30 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold mb-3">Research History</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {researchProjects.length > 0 ? (
              researchProjects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-slate-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {project.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {project.content?.summary || "No summary available"}
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No research history</p>
              </div>
            )}
          </div>
        </div>

        {/* Research Interface */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-12 bg-slate-800 border-slate-600 text-lg"
                  placeholder="Enter your research topic..."
                  onKeyDown={(e) => e.key === "Enter" && handleResearch()}
                />
              </div>
              <Button
                size="lg"
                onClick={handleResearch}
                disabled={researchMutation.isPending}
                className="ai-gradient hover:opacity-90"
              >
                {researchMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Research
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {researchMutation.isPending ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">AI is researching your topic...</p>
                </div>
              </div>
            ) : researchResult ? (
              <div className="space-y-6">
                {/* Summary */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {researchResult.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Key Points */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Key Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchResult.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {researchResult.insights.map((insight, index) => (
                        <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-slate-300">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sources & Related Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        Suggested Sources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {researchResult.sources.map((source, index) => (
                          <li key={index} className="text-slate-300 text-sm">
                            • {source}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle>Related Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {researchResult.relatedTopics.map((topic, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-slate-700"
                            onClick={() => setQuery(topic)}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Research</h3>
                  <p className="text-slate-400 max-w-md">
                    Enter a topic above and let AI gather comprehensive insights, 
                    analyze trends, and provide expert-level research.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
