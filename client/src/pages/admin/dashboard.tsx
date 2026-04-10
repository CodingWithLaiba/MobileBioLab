import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Users,
  TestTubes,
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { User, Sample, Report } from "@shared/schema";
import Navbar from "@/components/layout/navbar";

// -------------------- Interfaces --------------------
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSamples: number;
  pendingSamples: number;
  completedSamples: number;
  totalReports: number;
  pendingReports: number;
  systemAlerts: number;
}

interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  timestamp: string; // changed from Date to string
  userName: string;
  details: string;
}

// -------------------- Component --------------------
export default function AdminDashboard() {
  // ✅ Queries with queryFn
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats").then((res) => res.json()),
  });

  const { data: recentUsers = [], isLoading: isLoadingUsers } = useQuery<
    User[]
  >({
    queryKey: ["/api/admin/recent-users"],
    queryFn: () => fetch("/api/admin/recent-users").then((res) => res.json()),
  });

  const { data: recentSamples = [] } = useQuery<Sample[]>({
    queryKey: ["/api/admin/recent-samples"],
    queryFn: () => fetch("/api/admin/recent-samples").then((res) => res.json()),
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
    queryFn: () => fetch("/api/admin/activity-logs").then((res) => res.json()),
  });

  // const { data: sampleTrends = [] } = useQuery<
  //   Array<{ date: string; samples: number }>
  // >({
  //   queryKey: ["/api/admin/sample-trends"],
  //   queryFn: () => fetch("/api/admin/sample-trends").then((res) => res.json()),
  // });

  //  Memoized role data
  // const userRoleData = useMemo(
  //   () => [
  //     {
  //       name: "Students",
  //       value: recentUsers.filter((u) => u?.role === "student").length,
  //       color: "#8884d8",
  //     },
  //     {
  //       name: "Researchers",
  //       value: recentUsers.filter((u) => u?.role === "researcher").length,
  //       color: "#82ca9d",
  //     },
  //     {
  //       name: "Technicians",
  //       value: recentUsers.filter((u) => u?.role === "technician").length,
  //       color: "#ffc658",
  //     },
  //     {
  //       name: "Admins",
  //       value: recentUsers.filter((u) => u?.role === "admin").length,
  //       color: "#ff7300",
  //     },
  //   ],
  //   [recentUsers]
  // );

  // -------------------- Helpers --------------------
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "CREATE_SAMPLE":
        return <TestTubes className="h-4 w-4 text-blue-500" />;
      case "GENERATE_REPORT":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "USER_LOGIN":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "UPDATE_PROTOCOL":
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "technician":
        return "default";
      case "researcher":
        return "secondary";
      case "student":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                System overview and administrative controls
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalUsers ?? 0}
                  </div>
                  
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Samples
                  </CardTitle>
                  <TestTubes className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalSamples}
                  </div>
                  
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reports Generated
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats?.totalReports ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Health
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    Healthy
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="text-red-500">
                      {adminStats?.systemAlerts ?? 0}
                    </span>
                    <span className="ml-1">active alerts</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                <TabsTrigger value="reports">System Reports</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Recent Samples Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sample Submissions</CardTitle>
                    <CardDescription>
                      Latest 10 samples submitted to the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sample ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSamples.slice(0, 10).map((sample) => (
                          <TableRow key={sample.id}>
                            <TableCell className="font-medium">
                              {sample.sampleId}
                            </TableCell>
                            <TableCell className="capitalize">
                              {sample.sampleType}
                            </TableCell>
                            <TableCell>User {sample.userId}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  sample.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {sample.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(sample.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Registrations</CardTitle>
                    <CardDescription>
                      Users who joined in the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell>
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Activity Logs</CardTitle>
                    <CardDescription>
                      Recent user actions and system events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityLogs.slice(0, 20).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg"
                        >
                          {getActivityIcon(log.action)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {log.userName ?? "Unknown user"}{" "}
                              {log.action?.toLowerCase().replace("_", " ") ??
                                ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.details}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Performance</CardTitle>
                      <CardDescription>
                        Key metrics and health indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Database Performance</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>API Response Time</span>
                          <span>98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Storage Usage</span>
                          <span>67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Quality Metrics</CardTitle>
                      <CardDescription>
                        Sample data integrity and completeness
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Complete Submissions</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Validation Errors</span>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium">3</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Processing Time</span>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium">2.3 min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
