import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SlotReservation } from "@shared/schema";
import Navbar from "@/components/layout/navbar";

export default function AdminSlotReservationsPage() {
  const [selected, setSelected] = useState<SlotReservation | null>(null);
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reservations
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["slot-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/slot-reservations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<SlotReservation[]>;
    },
  });

  // Update reservation status
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: string;
      notes?: string;
    }) => {
      const res = await fetch(`/api/slot-reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slot-reservations"] });
      setSelected(null);
      setNotes("");
      toast({ title: "Success", description: "Updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter reservations
  const filtered = reservations.filter(
    (reservation) => filter === "all" || reservation.status === filter
  );

  // Get status badge color
  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || colors.pending;
  };

  // Update handlers
  const updateStatus = (id: number, status: string) => {
    updateMutation.mutate({ id, status, notes: notes || undefined });
  };

  // Count by status
  const count = (status: string) =>
    reservations.filter((reservation) => reservation.status === status).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Slot Reservation Management</h1>
            <p className="text-gray-600 mt-2">
              Manage mobile bio lab reservations
            </p>
          </div>
          <Select
            value={filter}
            onChange={setFilter}
            className="w-48"
            options={[
              { label: "All Reservations", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              label: "Pending",
              status: "pending",
              icon: Clock,
              color: "yellow",
            },
            {
              label: "Approved",
              status: "approved",
              icon: CheckCircle,
              color: "green",
            },
            {
              label: "Rejected",
              status: "rejected",
              icon: XCircle,
              color: "red",
            },
          ].map(({ label, status, icon: Icon, color }) => (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>
                      {count(status)}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 text-${color}-600`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reservations List */}
        {filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((reservation) => {
              return (
                <Card
                  key={reservation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {new Date(
                                reservation.slotDate
                              ).toLocaleDateString()}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />{" "}
                                {reservation.slotTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />{" "}
                                {reservation.location}
                              </span>
                            </div>
                          </div>
                          <Badge className={statusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-medium text-sm text-gray-700">
                            Purpose:
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.purpose}
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-sm text-gray-700">
                            Notes:
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.notes}
                          </p>
                        </div>

                        <div className="text-xs text-gray-500">
                          Requested:{" "}
                          {new Date(reservation.requestedAt).toLocaleString()}
                          {reservation.approvedAt &&
                            ` • Approved: ${new Date(
                              reservation.approvedAt
                            ).toLocaleString()}`}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(reservation);
                              setNotes(reservation.notes || "");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Reservation</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(
                                  reservation.slotDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span>{" "}
                                {reservation.slotTime}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Location:</span>{" "}
                                {reservation.location}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Purpose:</span>
                                <p className="mt-1 text-gray-600">
                                  {reservation.purpose}
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Admin Notes
                              </label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes..."
                                rows={3}
                              />
                            </div>

                            {reservation.status === "pending" && (
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() =>
                                    updateStatus(reservation.id, "approved")
                                  }
                                  disabled={updateMutation.isPending}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    updateStatus(reservation.id, "rejected")
                                  }
                                  disabled={updateMutation.isPending}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reservations found
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "No reservations submitted yet."
                  : `No ${filter} reservations.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
