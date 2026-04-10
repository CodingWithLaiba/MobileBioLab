import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Filter, QrCode, Share2 } from "lucide-react";
import SampleForm from "@/components/forms/sample-form";
import type { Sample } from "@shared/schema";
import { SampleShareForm } from "@/components/forms/sample-share-form";
import Select from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InputField } from "@/components/ui/input-field";

export default function Samples() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewSample, setViewSample] = useState<Sample | null>(null);
  const [editSample, setEditSample] = useState<Sample | null>(null);
  const [shareSample, setShareSample] = useState<Sample | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: samples = [], isLoading } = useQuery<Sample[]>({
    queryKey: ["/api/samples"],
  });

  const filteredSamples = samples.filter(
    (sample) =>
      sample.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.sampleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateSampleMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      location?: string | null;
      status?: string;
      tempature?:number |  null;
      ph?: number | null;
    }) => {
      const { id, ...data } = payload;
      const res = await apiRequest("PUT", `/api/samples/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/samples"] });
      setEditSample(null);
      toast({ title: "Sample updated" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "processing":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // const getSampleTypeIcon = (type: string) => {
  //   switch (type) {
  //     case "water":
  //       return "💧";
  //     case "soil":
  //       return "🌱";
  //     case "plant":
  //       return "🌿";
  //     case "biological_fluid":
  //       return "🧪";
  //     case "air":
  //       return "💨";
  //     default:
  //       return "🔬";
  //   }
  // };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold ">Samples</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track your biological samples
                </p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex items-center" onClick={() => setLocation("/qr-scanner")}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      New Sample
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Sample</DialogTitle>
                    </DialogHeader>
                    <SampleForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search and Filter */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-5 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <InputField
                    type="search"
                      placeholder="Search samples by ID, type, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Samples Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Sample Collection ({filteredSamples.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading samples...
                  </div>
                ) : filteredSamples.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? (
                      "No samples found matching your search."
                    ) : (
                      "No samples available."
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sample ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Collection Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Temperature</TableHead>
                        <TableHead>pH</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSamples.map((sample) => (
                        <TableRow key={sample.id}>
                          <TableCell className="font-medium">
                            <div>
                              <span>{sample.sampleId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {sample.sampleType.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              sample.collectionDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{sample.location || "N/A"}</TableCell>
                          <TableCell>
                            {sample.temperature
                              ? `${sample.temperature}°C`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{sample.ph ? sample.ph : "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(sample.status)}>
                              {sample.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog
                                open={
                                  !!viewSample && viewSample.id === sample.id
                                }
                                onOpenChange={(o) => !o && setViewSample(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewSample(sample)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Sample {sample.sampleId}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Type:
                                      </span>{" "}
                                      <span className="capitalize">
                                        {sample.sampleType.replace("_", " ")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Collected:
                                      </span>{" "}
                                      {new Date(
                                        sample.collectionDate
                                      ).toLocaleString()}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Location:
                                      </span>{" "}
                                      {sample.location || "N/A"}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Temperature:
                                      </span>{" "}
                                      {sample.temperature ?? "N/A"}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        pH:
                                      </span>{" "}
                                      {sample.ph ?? "N/A"}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Status:
                                      </span>{" "}
                                      {sample.status}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={
                                  !!editSample && editSample.id === sample.id
                                }
                                onOpenChange={(o) => !o && setEditSample(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditSample(sample)}
                                  >
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Edit Sample {sample.sampleId}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm">
                                        Location
                                      </label>
                                      <InputField
                                      type="text"
                                        defaultValue={sample.location || ""}
                                        id={`loc-${sample.id}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm">Status</label>
                                      <Select
                                        value={sample.status}
                                        onChange={(val) =>
                                          setEditSample((s) =>
                                            s ? { ...s, status: val as any } : s
                                          )
                                        }
                                        placeholder="Select status"
                                        options={[
                                          { label: "Pending", value: "pending" },
                                          { label: "Processing", value: "processing" },
                                          { label: "Completed", value: "completed" },
                                        ]}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditSample(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          const loc =
                                            (
                                              document.getElementById(
                                                `loc-${sample.id}`
                                              ) as HTMLInputElement
                                            )?.value ?? "";
                                          updateSampleMutation.mutate({
                                            id: sample.id,
                                            location: loc || null,
                                            status:
                                              editSample?.status ||
                                              sample.status,
                                          });
                                        }}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={
                                  !!shareSample && shareSample.id === sample.id
                                }
                                onOpenChange={(o) => !o && setShareSample(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShareSample(sample)}
                                  >
                                    <Share2 className="h-4 w-4 mr-1" /> Share
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Share Sample {sample.sampleId}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <SampleShareForm
                                    sample={sample}
                                    onSuccess={() => setShareSample(null)}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
