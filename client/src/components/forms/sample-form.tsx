import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "../ui/input-field";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Select from "@/components/ui/select";
import { QrCode, Bluetooth, Save } from "lucide-react";
import { insertSampleSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";


const sampleFormSchema = insertSampleSchema.omit({ userId: true });
type SampleFormData = z.infer<typeof sampleFormSchema>;

interface SampleFormProps {
  onSuccess?: () => void;
}

export default function SampleForm({ onSuccess }: SampleFormProps) {
  const { toast } = useToast();
  const [isDraft, setIsDraft] = useState(false);

  const createSampleMutation = useMutation({
    mutationFn: async (data: SampleFormData) => {
      const res = await apiRequest("POST", "/api/samples", data);
      return await res.json();
    },
    onSuccess: (sample) => {
      queryClient.invalidateQueries({ queryKey: ["/api/samples"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: isDraft ? "Draft saved" : "Sample submitted",
        description: isDraft
          ? "Sample data has been saved as draft"
          : `Sample ${sample.sampleId} has been successfully submitted`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting sample",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SampleFormData>({
    resolver: zodResolver(sampleFormSchema),
    defaultValues: {
      sampleId: "",
      sampleType: "water",
      collectionDate: new Date(),
      collectionTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: "",
      temperature: "",
      ph: "",
      status: "pending",
    },
  });

  const onSubmit = (data: SampleFormData) => {
    const submitData = {
      ...data,
      collectionDate: data.collectionDate,
      status: isDraft ? "pending" : data.status || "pending",
      // Clean up empty string values for optional numeric fields
      temperature:
        data.temperature && data.temperature !== "" ? data.temperature : null,
      ph: data.ph && data.ph !== "" ? data.ph : null,
      location: data.location || null,
    };
    console.log("Submitting sample data:", submitData);
    createSampleMutation.mutate(submitData);
  };

 

  // const handleBluetoothSync = (field: string) => {
  //   toast({
  //     title: "Bluetooth Sync",
  //     description: `Attempting to sync ${field} data from sensor...`,
  //   });

  //   // Simulate sensor data for demo
  //   setTimeout(() => {
  //     if (field === "temperature") {
  //       form.setValue("temperature", "23.5");
  //     } else if (field === "ph") {
  //       form.setValue("ph", "7.2");
  //     }
  //     toast({
  //       title: "Sensor Data Synced",
  //       description: `${field} value updated from sensor`,
  //     });
  //   }, 1000);
  // };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-border mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Quick Sample Entry
          </CardTitle>
          
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FormField
              control={form.control}
              name="sampleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample ID</FormLabel>
                  <FormControl>
                    < InputField placeholder="e.g., WS-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sampleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select type..."
                      options={[
                        { label: "Water", value: "water" },
                        { label: "Soil", value: "soil" },
                        { label: "Plant", value: "plant" },
                        { label: "Biological Fluid", value: "biological_fluid" },
                        { label: "Air", value: "air" },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Date</FormLabel>
                  <FormControl>
                    < InputField
                      type="date"
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(new Date(e.target.value + "T00:00:00"))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    < InputField
                      placeholder="GPS coordinates or address"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <div className="flex">
                    <FormControl>
                      < InputField
                        type="number"
                        placeholder="25.0"
                        className="rounded-r-none"
                        value={field.value || ""}
                        onChange={field.onChange}
                        
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>pH Level</FormLabel>
                  <div className="flex">
                    <FormControl>
                      < InputField
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        placeholder="7.0"
                        className="rounded-r-none"
                        value={field.value || ""}
                        onChange={field.onChange}
                       
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collectionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Time</FormLabel>
                  <FormControl>
                    < InputField type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDraft(true);
                  form.handleSubmit(onSubmit)();
                }}
                disabled={createSampleMutation.isPending}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                type="submit"
                onClick={() => setIsDraft(false)}
                disabled={createSampleMutation.isPending}
              >
                {createSampleMutation.isPending
                  ? "Submitting..."
                  : "Submit Sample"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
