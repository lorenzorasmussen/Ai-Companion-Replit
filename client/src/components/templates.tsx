import { useQuery } from "@tanstack/react-query";
import { Code, Download, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: number;
  name: string;
  description: string;
  type: string;
  icon: string;
  content: any;
}

export default function Templates() {
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "todo":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "ecommerce":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "dashboard":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "blog":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const handleUseTemplate = (template: Template) => {
    // This would typically navigate to the app builder with the template pre-loaded
    console.log("Using template:", template);
  };

  const handlePreview = (template: Template) => {
    // This would show a preview of the template
    console.log("Previewing template:", template);
  };

  const handleDownload = (template: Template) => {
    // This would download the template code
    const blob = new Blob([template.content?.code || "// Template code"], 
      { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}-template.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Templates</h2>
            <Badge variant="outline" className="border-slate-500/20 text-slate-400">
              {templates.length} Templates Available
            </Badge>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">Quick Start Templates</h3>
            <p className="text-slate-400">
              Choose from our collection of professionally designed templates to jumpstart your project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {template.description}
                  </p>

                  {template.content?.features && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.content.features.slice(0, 3).map((feature: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.content.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.content.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {template.content?.components && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Components:</h4>
                      <div className="text-xs text-slate-400">
                        {template.content.components.join(", ")}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 ai-gradient hover:opacity-90"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(template)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Templates Available</h3>
              <p className="text-slate-400">
                Templates will appear here once they are loaded.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
