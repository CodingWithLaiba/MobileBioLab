import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { Search, Plus, FileText, Share, BarChart3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Report, Sample } from "@shared/schema";
import { z } from "zod";
import jsPDF from "jspdf"; //Used to export reports as PDF.
import autoTable from "jspdf-autotable";

const reportFormSchema = insertReportSchema.omit({ generatedBy: true });
type ReportFormData = z.infer<typeof reportFormSchema>;

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const { data: samples = [] } = useQuery<Sample[]>({
    queryKey: ["/api/samples"],
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsFormOpen(false);
      toast({
        title: "Report created",
        description: "The report has been successfully generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      content: {},
      status: "draft",
    },
  });

  const onSubmit = (data: ReportFormData) => {
    const reportContent = {
      summary: "Auto-generated report summary",
      charts: [],
      analysis: "Analysis results will be displayed here",
      recommendations: "Recommendations based on analysis",
    };

    createReportMutation.mutate({
      ...data,
      content: reportContent,
    });
  };

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "shared":
        return "bg-primary text-primary-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleExportPDF = (report: Report) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${report.title}`, 14, 16);
    doc.setFontSize(11);
    if (report.sampleId) doc.text(`Sample ID: ${report.sampleId}`, 14, 30);

    doc.text(`Status: ${report.status}`, 14, 24);
    const filename = `${report.title.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground mt-1 sm:mt-2">
                  Generate and manage analytical reports
                </p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center w-full sm:w-auto justify-center">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Generate</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-11/12 sm:w-full">
                  <DialogHeader>
                    <DialogTitle>Generate New Report</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4 sm:space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Title</FormLabel>
                            <FormControl>
                              <InputField
                                placeholder="Enter report title"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sampleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sample</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value?.toString()}
                                onChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                                placeholder="Select a sample"
                                options={samples.map((sample) => ({
                                  label: `${sample.sampleId} - ${sample.sampleType}`,
                                  value: sample.id.toString(),
                                }))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select status"
                                options={[
                                  { label: "Draft", value: "draft" },
                                  { label: "Completed", value: "completed" },
                                  { label: "Shared", value: "shared" },
                                ]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFormOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createReportMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {createReportMutation.isPending
                            ? "Generating..."
                            : "Generate Report"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <Card className="mb-6 sm:mb-8">
              <CardContent className="p-4 sm:p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <InputField
                    type="search"
                    placeholder="Search reports by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Generated Reports ({filteredReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading reports...
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No reports found matching your search."
                      : "No reports found. Generate your first report to get started."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Title</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Sample ID</TableHead>
                          <TableHead className="text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Created</TableHead>
                          <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Updated</TableHead>
                          <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => {
                          const sample = samples.find(
                            (s) => s.id === report.sampleId
                          );
                          return (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm sm:text-base">{report.title}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-sm sm:text-base">{sample?.sampleId || "N/A"}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(report.status)}>
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-xs sm:text-sm">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-xs sm:text-sm">
                                  {new Date(report.updatedAt).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportPDF(report)}
                                    className="touch-target"
                                  >
                                    <span className="hidden sm:inline">Export PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
