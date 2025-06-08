import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthStatus {
  authenticated: boolean;
  services: string[];
}

export default function GoogleAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    refetchInterval: 5000, // Check status every 5 seconds
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/auth/google");
      const data = await response.json();
      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      setIsConnecting(true);
      window.open(authUrl, '_blank', 'width=500,height=600');
      
      // Listen for the connection completion
      const checkConnection = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      }, 2000);

      // Stop checking after 2 minutes
      setTimeout(() => {
        clearInterval(checkConnection);
        setIsConnecting(false);
      }, 120000);
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Google connection. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  });

  useEffect(() => {
    // Check if we just got connected (from URL params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      setIsConnecting(false);
      toast({
        title: "Google Connected",
        description: "Successfully connected to Google services.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    // Stop loading animation when authenticated
    if (authStatus?.authenticated && isConnecting) {
      setIsConnecting(false);
    }
  }, [authStatus, isConnecting]);

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          Google Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus?.authenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Connected</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Available Services:</p>
              <div className="flex flex-wrap gap-2">
                {authStatus.services.includes('gmail') && (
                  <Badge variant="outline" className="border-green-500/20 text-green-400">
                    Gmail
                  </Badge>
                )}
                {authStatus.services.includes('calendar') && (
                  <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                    Calendar
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                You can now access your real Gmail and Google Calendar data directly in the platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Not Connected</span>
            </div>
            
            <p className="text-sm text-slate-400">
              Connect your Google account to access real Gmail and Calendar data with AI assistance.
            </p>

            <Button
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending || isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {connectMutation.isPending || isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isConnecting ? "Connecting..." : "Initiating..."}
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Google Account
                </>
              )}
            </Button>

            {isConnecting && (
              <div className="text-xs text-slate-500 text-center">
                A popup window should have opened. Please complete the authorization there.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}