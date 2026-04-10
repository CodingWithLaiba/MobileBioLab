import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Plus, Edit, Trash2, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import { type Protocol } from "@shared/schema";

// defining form rules
const formSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  category: z.enum([
    "water_analysis",
    "soil_testing",
    "plant_biology",
    "microbiology",
    "chemistry",
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedTime: z.string().min(1, "Required"),
  equipment: z.string().min(1, "Required"),
  materials: z.string().min(1, "Required"),
  safetyNotes: z.string().optional(),
  steps: z.string().min(1, "Required"),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminProtocols() {
  const { toast } = useToast(); //For showing notifications.
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Protocol | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch protocols
  const { data: protocols = [] } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "water_analysis",
      difficulty: "beginner",
      estimatedTime: "",
      equipment: "",
      materials: "",
      safetyNotes: "",
      steps: "",
      tags: "",
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = editing ? `/api/protocols/${editing.id}` : "/api/protocols";
      const method = editing ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Success",
        description: `Protocol ${editing ? "updated" : "created"}`,
      });
      closeDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save protocol",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/protocols/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({ title: "Deleted", description: "Protocol removed" });
    },
  });

  // Handlers
  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    form.reset();
  };

  const openEdit = (protocol: Protocol) => {
    setEditing(protocol);
    form.reset(protocol as any);
    setDialogOpen(true);
  };

  const onSubmit = (data: FormData) => saveMutation.mutate(data);

  // Filter protocols
  const filtered = protocols.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Protocol Management</h1>
        <p className="text-gray-600 mb-8">Manage laboratory protocols</p>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Protocol Library</CardTitle>
                <CardDescription>Create and manage protocols</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditing(null)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Protocol
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editing ? "Edit" : "Add"} Protocol
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the protocol details
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <InputField {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Select
                                  {...field}
                                  options={[
                                    {
                                      label: "Water Analysis",
                                      value: "water_analysis",
                                    },
                                    {
                                      label: "Soil Testing",
                                      value: "soil_testing",
                                    },
                                    {
                                      label: "Plant Biology",
                                      value: "plant_biology",
                                    },
                                    {
                                      label: "Microbiology",
                                      value: "microbiology",
                                    },
                                    { label: "Chemistry", value: "chemistry" },
                                  ]}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty</FormLabel>
                              <FormControl>
                                <Select
                                  {...field}
                                  options={[
                                    { label: "Beginner", value: "beginner" },
                                    {
                                      label: "Intermediate",
                                      value: "intermediate",
                                    },
                                    { label: "Advanced", value: "advanced" },
                                  ]}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estimatedTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <InputField
                                  placeholder="e.g., 2 hours"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="equipment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Equipment</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="materials"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Materials</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="safetyNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Safety Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="steps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Steps</FormLabel>
                            <FormControl>
                              <Textarea className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (Optional)</FormLabel>
                            <FormControl>
                              <InputField
                                placeholder="Comma-separated"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeDialog}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                          {editing ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <InputField
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={category}
                onChange={setCategory}
                className="w-[200px]"
                options={[
                  { label: "All Categories", value: "all" },
                  { label: "Water Analysis", value: "water_analysis" },
                  { label: "Soil Testing", value: "soil_testing" },
                  { label: "Plant Biology", value: "plant_biology" },
                  { label: "Microbiology", value: "microbiology" },
                  { label: "Chemistry", value: "chemistry" },
                ]}
              />
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm ">
                        {p.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{p.category?.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>{p.safetyNotes}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {p.materials || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Protocol
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete "{p.title}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(p.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
