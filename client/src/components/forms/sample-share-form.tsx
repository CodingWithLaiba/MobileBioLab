import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Copy, Mail, Link } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Sample } from "@shared/schema";

const sampleShareSchema = z
  .object({
    shareType: z.enum(["link", "email"]),
    sharedWith: z.string().email().optional(),
    expiresAt: z.date().optional(),
    maxAccess: z.number().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.shareType === "email" && !data.sharedWith) {
        return false;
      }
      return true;
    },
    {
      message: "Email is required when sharing via email",
      path: ["sharedWith"],
    }
  );

type SampleShareFormData = z.infer<typeof sampleShareSchema>;

interface SampleShareFormProps {
  sample: Sample;
  onSuccess: () => void;
}

export function SampleShareForm({ sample, onSuccess }: SampleShareFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SampleShareFormData>({
    resolver: zodResolver(sampleShareSchema),
    defaultValues: {
      shareType: "link",
      sharedWith: "",
      expiresAt: undefined,
      maxAccess: 10,
    },
  });

  const shareType = watch("shareType");
  const expiresAt = watch("expiresAt");

  const createShareMutation = useMutation({
    mutationFn: async (data: SampleShareFormData) => {
      const response = await fetch("/api/sample-shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          sampleId: sample.id,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create share");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sample-shares"] });
      const url = `${window.location.origin}/shared-sample/${data.shareToken}`;
      setShareUrl(url);

      if (shareType === "email") {
        // In a real implementation, you would send an email here
        toast({
          title: "Success",
          description: "Sample shared via email successfully",
        });
      } else {
        toast({
          title: "Success",
          description: "Share link created successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SampleShareFormData) => {
    createShareMutation.mutate(data);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const sendEmail = () => {
    const subject = `Shared Sample Data: ${sample.sampleId}`;
    const body = `I'm sharing sample data with you.\n\nSample ID: ${
      sample.sampleId
    }\nSample Type: ${sample.sampleType}\nCollection Date: ${new Date(
      sample.collectionDate
    ).toLocaleDateString()}\n\nAccess the data here: ${shareUrl}`;

    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  if (shareUrl) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Share Link Created
          </h3>
          <p className="text-gray-600">
            Your sample data is now ready to be shared
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <Label className="text-sm font-medium text-gray-700">Share URL</Label>
          <div className="flex mt-2">
            <Input value={shareUrl} readOnly className="flex-1 bg-white" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={sendEmail}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send via Email
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              setShareUrl("");
              reset();
              onSuccess();
            }}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Sample Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <span className="font-medium">ID:</span> {sample.sampleId}
          </p>
          <p>
            <span className="font-medium">Type:</span> {sample.sampleType}
          </p>
          <p>
            <span className="font-medium">Collection Date:</span>{" "}
            {new Date(sample.collectionDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Location:</span>{" "}
            {sample.location || "Not specified"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shareType">Share Method *</Label>
        <Select
          value={shareType}
          onChange={(value: string) =>
            setValue("shareType", value as "link" | "email")
          }
          placeholder="Select share method"
          options={[
            { label: "Share Link", value: "link" },
            { label: "Email Directly", value: "email" },
          ]}
        />
      </div>

      {shareType === "email" && (
        <div className="space-y-2">
          <Label htmlFor="sharedWith">Recipient Email *</Label>
          <Input
            id="sharedWith"
            type="email"
            placeholder="Enter recipient's email address"
            {...register("sharedWith")}
          />
          {errors.sharedWith && (
            <p className="text-sm text-red-600">{errors.sharedWith.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expiresAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiresAt ? format(expiresAt, "PPP") : "No expiration"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={(date) => {
                  setValue("expiresAt", date);
                  setIsCalendarOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAccess">Max Access Count</Label>
          <Input
            id="maxAccess"
            type="number"
            min="1"
            max="100"
            placeholder="10"
            {...register("maxAccess", { valueAsNumber: true })}
          />
          {errors.maxAccess && (
            <p className="text-sm text-red-600">{errors.maxAccess.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={createShareMutation.isPending}>
          {createShareMutation.isPending ? "Creating..." : "Create Share"}
        </Button>
      </div>
    </form>
  );
}
