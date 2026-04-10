import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/navbar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, Users, MapPin } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: "experiment" | "maintenance" | "meeting" | "training";
  participants: string[];
}

export default function LabScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    time: "",
    location: "",
    type: "experiment" as const,
    participants: "",
  });

  // Mock events data
  const [events] = useState<ScheduleEvent[]>([
    {
      id: "1",
      title: "Water Quality Analysis",
      description: "Testing water samples from Lake Michigan",
      date: new Date(),
      time: "09:00",
      location: "Lab Room A",
      type: "experiment",
      participants: ["Dr. Smith", "John Doe"],
    },
    {
      id: "2",
      title: "Equipment Maintenance",
      description: "Monthly calibration of pH meters",
      date: new Date(Date.now() + 86400000),
      time: "14:00",
      location: "Lab Room B",
      type: "maintenance",
      participants: ["Tech Team"],
    },
  ]);

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "experiment":
        return "bg-primary";
      case "maintenance":
        return "bg-yellow-500";
      case "meeting":
        return "bg-blue-500";
      case "training":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!selectedDate) return false;
    return event.date.toDateString() === selectedDate.toDateString();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New event:", eventForm);
    setShowEventForm(false);
    setEventForm({
      title: "",
      description: "",
      time: "",
      location: "",
      type: "experiment",
      participants: "",
    });
  };

  return (
  <div className=" bg-background">
        <Navbar />
    <div className="space-y-6">
      <div className="p-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Scheduling</h1>
          <p className="text-muted-foreground">
            Manage laboratory schedules, equipment bookings, and team coordination
          </p>
        </div>
        <Button onClick={() => setShowEventForm(true)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : "Select a date"}
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No events scheduled for this date</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.participants.join(", ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule New Event</CardTitle>
              <CardDescription>Add a new lab scheduling event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={eventForm.type}
                      onChange={(value: any) => setEventForm({ ...eventForm, type: value })}
                      placeholder="Select event type"
                      options={[
                        { label: "Experiment", value: "experiment" },
                        { label: "Maintenance", value: "maintenance" },
                        { label: "Meeting", value: "meeting" },
                        { label: "Training", value: "training" },
                      ]}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Lab Room A, Equipment Bay, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="participants">Participants</Label>
                  <Input
                    id="participants"
                    value={eventForm.participants}
                    onChange={(e) => setEventForm({ ...eventForm, participants: e.target.value })}
                    placeholder="Comma-separated names"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Schedule Event
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </div>
  );

}