import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CalendarEvent {
  id: number;
  name: string;
  content: {
    title: string;
    description: string;
    date: string;
    time: string;
    location?: string;
    attendees?: string[];
    type: "meeting" | "reminder" | "task" | "event";
    priority: "low" | "medium" | "high";
  };
  type: string;
  createdAt: string;
}

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    time: "",
    location: "",
    type: "meeting" as const,
    priority: "medium" as const,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: localEvents = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/projects"],
    select: (data) => data.filter(project => project.type === "calendar"),
  });

  const { data: googleEvents = [] } = useQuery({
    queryKey: ["/api/calendar/events"],
    enabled: true,
    retry: false,
    onError: () => {
      // Google Calendar not available, use local events only
    }
  });

  // Combine local and Google Calendar events
  const events = [
    ...localEvents,
    ...(googleEvents.map((event: any) => ({
      id: `google-${event.id}`,
      name: `Google: ${event.summary}`,
      content: {
        title: event.summary || "Untitled Event",
        description: event.description || "",
        date: event.start?.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "00:00",
        location: event.location || "",
        attendees: event.attendees?.map((a: any) => a.email) || [],
        type: "event" as const,
        priority: "medium" as const,
      },
      type: "calendar",
      createdAt: event.created || new Date().toISOString(),
    })) || [])
  ];

  const aiSuggestMutation = useMutation({
    mutationFn: async (eventData: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: `Please help me optimize this calendar event and suggest improvements: ${eventData}`,
      });
      const result = await response.json();
      return result.response;
    },
    onSuccess: (suggestion) => {
      toast({
        title: "AI Suggestions Ready",
        description: "AI has analyzed your event and provided suggestions.",
      });
    },
  });

  const saveEventMutation = useMutation({
    mutationFn: async () => {
      const eventDate = selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      
      // Try to create in Google Calendar first
      try {
        const startDateTime = `${eventDate}T${newEvent.time}:00`;
        const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration
        
        const response = await apiRequest("POST", "/api/calendar/events", {
          summary: newEvent.title,
          description: newEvent.description,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
          location: newEvent.location,
        });
        return response.json();
      } catch (error) {
        // Fall back to local storage if Google Calendar fails
        const response = await apiRequest("POST", "/api/projects", {
          name: newEvent.title,
          description: `Calendar event: ${newEvent.title}`,
          type: "calendar",
          content: {
            ...newEvent,
            date: eventDate,
          },
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewEvent({
        title: "",
        description: "",
        time: "",
        location: "",
        type: "meeting",
        priority: "medium",
      });
      setShowEventForm(false);
      toast({
        title: "Event Created",
        description: "Your calendar event has been saved successfully.",
      });
    },
  });

  const selectedDateEvents = events.filter(event => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.content.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "reminder":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "task":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-green-500/10 text-green-400";
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">AI Calendar</h2>
            <Badge variant="outline" className="border-indigo-500/20 text-indigo-400">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Smart Scheduling
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => aiSuggestMutation.mutate(JSON.stringify(newEvent))}
              disabled={!newEvent.title || aiSuggestMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Optimize
            </Button>
            <Button
              onClick={() => setShowEventForm(!showEventForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Sidebar */}
        <div className="w-80 bg-slate-800/30 border-r border-slate-700 flex flex-col">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-slate-700"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <Card key={event.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {event.content.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(event.content.date).toLocaleDateString()} at {event.content.time}
                        </p>
                        <Badge variant="outline" className={`text-xs mt-1 ${getEventTypeColor(event.content.type)}`}>
                          {event.content.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="flex-1 flex flex-col">
          {showEventForm && (
            <div className="bg-slate-800/30 border-b border-slate-700 p-6">
              <h3 className="font-semibold mb-4">Create New Event</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Location (optional)"
                  className="bg-slate-800 border-slate-600"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                  className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200"
                >
                  <option value="meeting">Meeting</option>
                  <option value="reminder">Reminder</option>
                  <option value="task">Task</option>
                  <option value="event">Event</option>
                </select>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description"
                  className="col-span-2 bg-slate-800 border-slate-600"
                  rows={2}
                />
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEventForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveEventMutation.mutate()}
                    disabled={!newEvent.title || saveEventMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Event
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-slate-400">
                  {selectedDateEvents.length} events scheduled
                </p>
              </div>

              <div className="space-y-4">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event) => (
                    <Card key={event.id} className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{event.content.title}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.content.time}
                              </div>
                              {event.content.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.content.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getEventTypeColor(event.content.type)}>
                              {event.content.type}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(event.content.priority)}>
                              {event.content.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-3">{event.content.description}</p>
                        {event.content.attendees && event.content.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-400">
                              {event.content.attendees.length} attendees
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
                    <p className="text-slate-400 mb-4">
                      Create your first event for this date.
                    </p>
                    <Button onClick={() => setShowEventForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}