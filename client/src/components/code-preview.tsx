import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface GeneratedApp {
  name: string;
  description: string;
  code: string;
  components: string[];
  features: string[];
  suggestions: string[];
}

interface CodePreviewProps {
  generatedApp: GeneratedApp | null;
  isLoading: boolean;
}

export default function CodePreview({ generatedApp, isLoading }: CodePreviewProps) {
  if (isLoading) {
    return (
      <div className="h-full bg-slate-900 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Generating your app with AI...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedApp) {
    return (
      <div className="h-full bg-slate-900 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Build?</h3>
              <p className="text-slate-400">
                Describe your app in the prompt area and click "Generate App" to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Generated App Preview */}
        <Card className="bg-white rounded-xl shadow-2xl overflow-hidden mb-6">
          {/* App Header */}
          <div className="bg-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{generatedApp.name}</h1>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-indigo-500 rounded-lg">
                  <span>🔔</span>
                </button>
                <div className="w-8 h-8 bg-indigo-400 rounded-full"></div>
              </div>
            </div>
            <p className="text-indigo-100 mt-2">{generatedApp.description}</p>
          </div>

          {/* App Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="w-64">
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                    <span>🏠</span>
                    Dashboard
                  </button>
                  {generatedApp.components.slice(0, 3).map((component, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <span>📋</span>
                      {component}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {generatedApp.name} Features
                  </h2>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <span>➕</span>
                    Add New
                  </button>
                </div>

                {/* Feature List */}
                <div className="space-y-3">
                  {generatedApp.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{feature}</h3>
                        <p className="text-sm text-gray-500">
                          Implemented in {generatedApp.name}
                        </p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Generation Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-400 w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">App Generated Successfully</div>
                <div className="text-xs text-slate-400">
                  React + TypeScript • Tailwind CSS • {generatedApp.code.split('\n').length} lines of code
                </div>
              </div>
            </div>
            {generatedApp.suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium mb-2">AI Suggestions:</h4>
                <ul className="text-xs text-slate-400 space-y-1">
                  {generatedApp.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
