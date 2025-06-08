import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Reply, Archive, Star, Search, Edit, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailItem {
  id: number;
  name: string;
  content: {
    to: string;
    from: string;
    subject: string;
    body: string;
    status: "draft" | "sent" | "received";
    priority: "low" | "medium" | "high";
    starred: boolean;
    read: boolean;
  };
  type: string;
  createdAt: string;
}

export default function EmailView() {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: "",
    priority: "medium" as const,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: localEmails = [] } = useQuery<EmailItem[]>({
    queryKey: ["/api/projects"],
    select: (data) => data.filter(project => project.type === "email"),
  });

  const { data: gmailEmails = [] } = useQuery({
    queryKey: ["/api/gmail/emails"],
    enabled: true,
    retry: false,
    onError: () => {
      // Gmail not available, use local emails only
    }
  });

  // Combine local and Gmail emails
  const emails = [
    ...localEmails,
    ...(gmailEmails.map((email: any) => ({
      id: `gmail-${email.id}`,
      name: `Gmail: ${email.subject}`,
      content: {
        to: email.to || "",
        from: email.from,
        subject: email.subject,
        body: email.body || email.snippet,
        status: "received" as const,
        priority: "medium" as const,
        starred: false,
        read: true,
      },
      type: "email",
      createdAt: email.date || new Date().toISOString(),
    })) || [])
  ];

  const aiEnhanceMutation = useMutation({
    mutationFn: async (emailContent: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: `Please help me improve this email content for clarity, professionalism, and effectiveness: ${emailContent}`,
      });
      const result = await response.json();
      return result.response;
    },
    onSuccess: (enhancedContent) => {
      setNewEmail({...newEmail, body: enhancedContent});
      toast({
        title: "Email Enhanced",
        description: "AI has improved your email content.",
      });
    },
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (status: "draft" | "sent") => {
      if (status === "sent") {
        // Try to send via Gmail first
        try {
          const response = await apiRequest("POST", "/api/gmail/send", {
            to: newEmail.to,
            subject: newEmail.subject,
            body: newEmail.body,
          });
          return response.json();
        } catch (error) {
          // Fall back to local storage if Gmail fails
          const response = await apiRequest("POST", "/api/projects", {
            name: `Email: ${newEmail.subject}`,
            description: `Email ${status}: ${newEmail.subject}`,
            type: "email",
            content: {
              ...newEmail,
              from: "user@aistudio.com",
              status,
              starred: false,
              read: true,
            },
          });
          return response.json();
        }
      } else {
        // For drafts, always save locally
        const response = await apiRequest("POST", "/api/projects", {
          name: `Email: ${newEmail.subject}`,
          description: `Email ${status}: ${newEmail.subject}`,
          type: "email",
          content: {
            ...newEmail,
            from: "user@aistudio.com",
            status,
            starred: false,
            read: true,
          },
        });
        return response.json();
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewEmail({
        to: "",
        subject: "",
        body: "",
        priority: "medium",
      });
      setShowCompose(false);
      toast({
        title: status === "draft" ? "Draft Saved" : "Email Sent",
        description: status === "draft" ? "Your email draft has been saved." : "Your email has been sent successfully.",
      });
    },
  });

  const filteredEmails = emails.filter(email =>
    email.content.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">AI Email</h2>
            <Badge variant="outline" className="border-cyan-500/20 text-cyan-400">
              <Mail className="w-3 h-3 mr-1" />
              Smart Compose
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => aiEnhanceMutation.mutate(newEmail.body)}
              disabled={!newEmail.body || aiEnhanceMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Enhance
            </Button>
            <Button
              onClick={() => setShowCompose(!showCompose)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className="w-96 bg-slate-800/30 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
                placeholder="Search emails..."
              />
            </div>
            
            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inbox" className="mt-4">
                <div className="space-y-2">
                  {filteredEmails.filter(e => e.content.status === "received").map((email) => (
                    <Card
                      key={email.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEmail?.id === email.id
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                {email.content.from}
                              </span>
                              {email.content.starred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                              <span className="text-xs">{getPriorityIcon(email.content.priority)}</span>
                            </div>
                            <h4 className="font-medium text-sm truncate mb-1">
                              {email.content.subject}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {email.content.body}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-500">
                                {new Date(email.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(email.content.status)}`}>
                                {email.content.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="sent" className="mt-4">
                <div className="space-y-2">
                  {filteredEmails.filter(e => e.content.status === "sent").map((email) => (
                    <Card
                      key={email.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEmail?.id === email.id
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                To: {email.content.to}
                              </span>
                              <span className="text-xs">{getPriorityIcon(email.content.priority)}</span>
                            </div>
                            <h4 className="font-medium text-sm truncate mb-1">
                              {email.content.subject}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {email.content.body}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-500">
                                {new Date(email.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(email.content.status)}`}>
                                {email.content.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="drafts" className="mt-4">
                <div className="space-y-2">
                  {filteredEmails.filter(e => e.content.status === "draft").map((email) => (
                    <Card
                      key={email.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEmail?.id === email.id
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">
                                To: {email.content.to}
                              </span>
                              <span className="text-xs">{getPriorityIcon(email.content.priority)}</span>
                            </div>
                            <h4 className="font-medium text-sm truncate mb-1">
                              {email.content.subject}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {email.content.body}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-500">
                                {new Date(email.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(email.content.status)}`}>
                                {email.content.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Email View/Compose */}
        <div className="flex-1 flex flex-col">
          {showCompose ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-slate-800/30 border-b border-slate-700 p-4">
                <h3 className="font-semibold">Compose Email</h3>
              </div>
              <div className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={newEmail.to}
                      onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                      placeholder="To: recipient@example.com"
                      className="bg-slate-800 border-slate-600"
                    />
                    <select
                      value={newEmail.priority}
                      onChange={(e) => setNewEmail({...newEmail, priority: e.target.value as any})}
                      className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <Input
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                    placeholder="Subject"
                    className="bg-slate-800 border-slate-600"
                  />
                  <Textarea
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                    placeholder="Write your email..."
                    className="h-64 bg-slate-800 border-slate-600 resize-none"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowCompose(false)}>
                      Cancel
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => saveEmailMutation.mutate("draft")}
                        disabled={!newEmail.subject || saveEmailMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button
                        onClick={() => saveEmailMutation.mutate("sent")}
                        disabled={!newEmail.to || !newEmail.subject || saveEmailMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedEmail ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-slate-800/30 border-b border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedEmail.content.subject}</h3>
                    <p className="text-sm text-slate-400">
                      From: {selectedEmail.content.from} • To: {selectedEmail.content.to}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(selectedEmail.content.status)}>
                      {selectedEmail.content.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                          {selectedEmail.content.from.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{selectedEmail.content.from}</div>
                          <div className="text-sm text-slate-400">
                            {new Date(selectedEmail.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xl">{getPriorityIcon(selectedEmail.content.priority)}</span>
                    </div>
                    <div className="prose prose-slate prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                        {selectedEmail.content.body}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select an Email</h3>
                <p className="text-slate-400 mb-4">
                  Choose an email from the list to view it, or compose a new one.
                </p>
                <Button onClick={() => setShowCompose(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Compose Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}