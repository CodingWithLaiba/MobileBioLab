import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Microscope,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "wouter";
import type { Notification } from "@shared/schema";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "sample_entry":
        return "🧪";
      case "report_generated":
        return "📊";
      case "status_update":
        return "🔄";
      default:
        return "📬";
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border">
      <div className="max-w-full mx-auto p-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Microscope className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Mobile Bio Lab
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {user?.role === "admin" ? (
                  // 🧑‍💼 Admin-only links
                  <>
                    <Link href="/admin" className="nav-link-active">
                      Admin Dashboard
                    </Link>
                    <Link href="/admin/users" className="nav-link-inactive">
                      Users
                    </Link>
                    <Link href="/admin/protocols" className="nav-link-inactive">
                      Protocols
                    </Link>
                    <Link
                      href="/admin/slot-reservations"
                      className="nav-link-inactive"
                    >
                      Reservations
                    </Link>
                    {/* <Link href="/admin/reports" className="nav-link-inactive">
                      Reports
                    </Link> */}
                  </>
                ) : (
                  // 👩‍🔬 Regular user links
                  <>
                    {/* <Link href="/" className="nav-link-active">
                      Dashboard
                    </Link> */}
                    <Link href="/samples" className="nav-link-inactive">
                      Samples
                    </Link>
                    <Link href="/protocols" className="nav-link-inactive">
                      Protocols
                    </Link>
                    <Link href="/reports" className="nav-link-inactive">
                      Reports
                    </Link>
                    <Link
                      href="/slot-reservations"
                      className="nav-link-inactive"
                    >
                      Slot Reservations
                    </Link>
                    <Link
                      href="/data-visualization"
                      className="nav-link-inactive"
                    >
                      Data Viz
                    </Link>
                    <Link href="/qr-scanner" className="nav-link-inactive">
                      QR Scanner
                    </Link>
                    <Link href="/sensor-data" className="nav-link-inactive">
                      Sensors
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Popover
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-accent text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-border hover:bg-accent/50 cursor-pointer ${
                              !notification.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture || ""} />
                    <AvatarFallback>
                      {user ? getInitials(user.firstName, user.lastName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
