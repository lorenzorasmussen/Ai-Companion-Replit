import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Search, Tag, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Note {
  id: number;
  name: string;
  content: any;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function AiNotes() {
  const [newNote, setNewNote] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/projects"],
    select: (data) => data.filter(project => project.type === "note"),
  });

  const enhanceNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: `Please help me organize and enhance this note content: ${content}`,
      });
      const result = await response.json();
      return result.response;
    },
    onSuccess: (enhancedContent) => {
      setNewNote(enhancedContent);
      toast({
        title: "Note Enhanced",
        description: "AI has improved your note content.",
      });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/projects", {
        name: `Note - ${new Date().toLocaleDateString()}`,
        description: "AI-enhanced note",
        type: "note",
        content: {
          text: newNote,
          tags: [],
          summary: "",
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewNote("");
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
    },
  });

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content?.text && note.content.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">AI Notes</h2>
            <Badge variant="outline" className="border-purple-500/20 text-purple-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => enhanceNoteMutation.mutate(newNote)}
              disabled={!newNote.trim() || enhanceNoteMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Enhance with AI
            </Button>
            <Button
              onClick={() => saveNoteMutation.mutate()}
              disabled={!newNote.trim() || saveNoteMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List */}
        <div className="w-80 bg-slate-800/30 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
                placeholder="Search notes..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? "bg-blue-500/10 border-blue-500/20"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-slate-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {note.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {note.content?.text || "No content"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </span>
                          {note.content?.tags?.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {note.content.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No notes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            {selectedNote ? (
              <div className="h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{selectedNote.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Last updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                    {selectedNote.content?.tags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 h-full overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {selectedNote.content?.text || "No content available"}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <h3 className="text-xl font-semibold mb-4">Create New Note</h3>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="h-full bg-slate-800 border-slate-600 resize-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Start writing your note... Use AI enhancement to improve formatting, add structure, and extract key insights."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
