import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageCircle, Send, Settings, Eye, EyeOff, Save, BookOpen, 
  Trash2, Copy, Download, Menu, X, Bot, User, Brain, Sparkles,
  Mic, MicOff, Image, Paperclip, MoreVertical, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface Conversation {
  id: number;
  title: string;
  isIncognito: boolean;
  aiModel: string;
  systemPrompt?: string;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
}

interface AiModel {
  id: number;
  name: string;
  provider: string;
  modelId: string;
  isFree: boolean;
  capabilities: string[];
  description?: string;
}

const AI_INSTRUCTIONS = {
  general: "You are a helpful AI assistant. Provide clear, accurate, and comprehensive responses.",
  coding: "You are an expert software developer. Focus on clean, efficient code with proper error handling and documentation. Explain your reasoning and provide multiple approaches when appropriate.",
  research: "You are a research specialist. Provide thorough, well-sourced information with critical analysis. Structure your responses with clear sections and actionable insights.",
  writing: "You are a professional writer and editor. Focus on clarity, engagement, and proper structure. Provide constructive feedback and improvement suggestions.",
  analysis: "You are a data analyst and critical thinker. Break down complex problems, identify patterns, and provide evidence-based conclusions with clear reasoning.",
  creative: "You are a creative professional. Think outside the box, provide innovative solutions, and inspire creativity while maintaining practical applicability."
};

export default function EnhancedAiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [isIncognito, setIsIncognito] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedInstruction, setSelectedInstruction] = useState("general");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch AI models
  const { data: aiModels = [] } = useQuery<AiModel[]>({
    queryKey: ["/api/ai-models"],
  });

  // Fetch messages for selected conversation
  const { data: conversationMessages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", {
        title,
        isIncognito,
        aiModel: selectedModel,
        systemPrompt: customPrompt || AI_INSTRUCTIONS[selectedInstruction as keyof typeof AI_INSTRUCTIONS],
        userId: 1, // Demo user
        projectId: null // Global conversation
      });
      return response.json();
    },
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "New Conversation",
        description: "Started a new chat session",
      });
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Create conversation if none selected
      if (!selectedConversation) {
        const conversation = await createConversationMutation.mutateAsync(
          content.slice(0, 50) + (content.length > 50 ? "..." : "")
        );
        setSelectedConversation(conversation.id);
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await apiRequest("POST", "/api/messages", {
        conversationId: selectedConversation,
        role: "user",
        content,
        metadata: { timestamp: new Date().toISOString() }
      });

      // Get AI response
      const response = await apiRequest("POST", "/api/chat/enhanced", {
        message: content,
        conversationId: selectedConversation,
        model: selectedModel,
        systemPrompt: customPrompt || AI_INSTRUCTIONS[selectedInstruction as keyof typeof AI_INSTRUCTIONS],
        includeHistory: true
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };
      setMessages(prev => [...prev, aiMessage]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Save to knowledge base
  const saveToKnowledgeMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await apiRequest("POST", "/api/knowledge-base", {
        title: `Chat Knowledge: ${new Date().toLocaleDateString()}`,
        summary: messageContent.slice(0, 200) + "...",
        content: messageContent,
        userId: 1,
        conversationId: selectedConversation,
        tags: ["chat", "ai-generated"]
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved to Knowledge Base",
        description: "This conversation has been saved for future reference.",
      });
    }
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    const message = input;
    setInput("");
    
    try {
      await sendMessageMutation.mutateAsync(message);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    setIsIncognito(false);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const toggleVoiceInput = () => {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsListening(!isListening);
      // Voice recognition implementation would go here
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversationMessages.length > 0) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  const MessageComponent = ({ message }: { message: Message }) => (
    <div className={`flex gap-3 p-4 ${message.role === "user" ? "bg-blue-50 dark:bg-blue-950/20" : "bg-slate-50 dark:bg-slate-800/50"}`}>
      <div className="flex-shrink-0">
        {message.role === "user" ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.role === "user" ? "You" : "AI Assistant"}
          </span>
          <span className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.metadata?.model && (
            <Badge variant="outline" className="text-xs">
              {message.metadata.model}
            </Badge>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
          {message.content}
        </div>
        
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyMessage(message.content)}
            className="h-6 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
          {message.role === "assistant" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveToKnowledgeMutation.mutate(message.content)}
              className="h-6 px-2"
            >
              <Save className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 safe-area-top">
        <h1 className="text-lg font-semibold">AI Assistant</h1>
        <div className="flex items-center gap-2">
          <Sheet open={showConversations} onOpenChange={setShowConversations}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={startNewConversation}
                  className="w-full"
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant={selectedConversation === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => {
                        setSelectedConversation(conv.id);
                        setShowConversations(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{conv.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          {conv.isIncognito && <Eye className="w-3 h-3" />}
                          <Badge variant="outline" className="text-xs">
                            {conv.aiModel}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map((model) => (
                        <SelectItem key={model.id} value={model.modelId}>
                          {model.name}
                          {model.isFree && <Badge className="ml-2 text-xs">Free</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>AI Instructions</Label>
                  <Select value={selectedInstruction} onValueChange={setSelectedInstruction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Assistant</SelectItem>
                      <SelectItem value="coding">Software Developer</SelectItem>
                      <SelectItem value="research">Research Specialist</SelectItem>
                      <SelectItem value="writing">Professional Writer</SelectItem>
                      <SelectItem value="analysis">Data Analyst</SelectItem>
                      <SelectItem value="creative">Creative Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Custom System Prompt</Label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter custom instructions for the AI..."
                    className="min-h-20"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="incognito"
                    checked={isIncognito}
                    onCheckedChange={setIsIncognito}
                  />
                  <Label htmlFor="incognito" className="flex items-center gap-2">
                    {isIncognito ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    Incognito Mode
                  </Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Choose your AI model and instructions, then start chatting. All conversations are automatically saved unless you're in incognito mode.
              </p>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Current Model: {selectedModel}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {isIncognito ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{isIncognito ? "Incognito Mode" : "Saving Enabled"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <MessageComponent message={message} />
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">AI Assistant</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              className={`h-11 w-11 ${isListening ? "bg-red-100 text-red-600" : ""}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-11 w-11"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {selectedConversation && (
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Model: {selectedModel}</span>
              {isIncognito && (
                <Badge variant="outline" className="text-xs">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Incognito
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveToKnowledgeMutation.mutate(messages.map(m => m.content).join("\n\n"))}
                className="h-6 px-2 text-xs"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Save Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}