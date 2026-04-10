import { useState,  } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { SlotReservationForm } from "@/components/forms/slot-reservation-form";
import { useToast } from "@/hooks/use-toast";
import type { SlotReservation } from "@shared/schema";
import Navbar from "@/components/layout/navbar";

export default function SlotReservationsPage() {
  const [selectedReservation, setSelectedReservation] =
    useState<SlotReservation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["slot-reservations"],
    queryFn: async () => {
      const response = await fetch("/api/slot-reservations", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch reservations");
      return response.json() as Promise<SlotReservation[]>;
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/slot-reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete reservation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slot-reservations"] });
      toast({
        title: "Success",
        description: "Slot reservation deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleEdit = (reservation: SlotReservation) => {
    setSelectedReservation(reservation);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      deleteReservationMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReservation(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex">
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mobile Bio Lab Reservations
          </h1>
          <p className="text-gray-600 mt-2">
            Reserve slots for accessing the on-wheels bio lab at your location
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedReservation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedReservation
                  ? "Edit Reservation"
                  : "New Slot Reservation"}
              </DialogTitle>
              <DialogDescription>
                Provide date, time, location, and purpose to request access to
                the mobile bio lab.
              </DialogDescription>
            </DialogHeader>
            <SlotReservationForm
              reservation={selectedReservation}
              onSuccess={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {reservations && reservations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((reservation) => (
            <Card
              key={reservation.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {new Date(reservation.slotDate).toLocaleDateString()}
                  </CardTitle>
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {reservation.slotTime}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {reservation.location}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Purpose:</span>
                  <p className="text-gray-600 mt-1">{reservation.purpose}</p>
                </div>
                {reservation.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span>
                    <p className="text-gray-600 mt-1">{reservation.notes}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Requested:{" "}
                  {new Date(reservation.requestedAt).toLocaleDateString()}
                </div>
                {reservation.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(reservation)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reservations yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first slot reservation for the mobile bio
              lab.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reservation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
    </div>
  );
}
