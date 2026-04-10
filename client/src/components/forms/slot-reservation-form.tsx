import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { SlotReservation } from "@shared/schema";
import { CalendarIcon } from "lucide-react";

const schema = z.object({
  slotDate: z.date(),
  slotTime: z.string(),
  location: z.string(),
  purpose: z.string().min(10),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const timeSlots = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

export function SlotReservationForm({
  reservation,
  onSuccess,
}: {
  reservation?: SlotReservation | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: reservation
      ? {
          slotDate: new Date(reservation.slotDate),
          slotTime: reservation.slotTime,
          location: reservation.location,
          purpose: reservation.purpose,
          notes: reservation.notes ?? undefined,
        }
      : {},
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(
        reservation
          ? `/api/slot-reservations/${reservation.id}`
          : "/api/slot-reservations",
        {
          method: reservation ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Something went wrong");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slot-reservations"] });
      toast({ title: "Saved successfully" });
      onSuccess();
    },
  });

  const date = form.watch("slotDate");

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      {/* Date */}
      <Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      className="w-full flex items-center justify-start gap-2"
    >
      <CalendarIcon className="h-4 w-4" />
      {date ? format(date, "PPP") : "Pick date"}
    </Button>
  </PopoverTrigger>

  <PopoverContent className="p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={(d) => {
        form.setValue("slotDate", d!);
        setOpen(false);
      }}
    />
  </PopoverContent>
</Popover>

      {/* Time */}
      <Select
        placeholder="Select time"
        value={form.watch("slotTime")}
        onChange={(v) => form.setValue("slotTime", v)}
        options={timeSlots.map((t) => ({ label: t, value: t }))}
      />

      {/* Location */}
      <InputField placeholder="Location" {...form.register("location")} />

      {/* Purpose */}
      <Textarea placeholder="Purpose" {...form.register("purpose")} />

      {/* Notes */}
      <Textarea placeholder="Notes (optional)" {...form.register("notes")} />

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
