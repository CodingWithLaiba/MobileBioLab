import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/navbar";

import { InputField } from "@/components/ui/input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Search } from "lucide-react";

import type { Protocol } from "@shared/schema";

export default function Protocols() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: protocols = [], isLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const filteredProtocols = protocols.filter(
    (protocol) =>
      protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "review":
        return "bg-warning text-warning-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Protocol Library
                </h1>
                <p className="text-muted-foreground mt-2">
                  Access and manage standard laboratory protocols
                </p>
              </div>
            </div>

            {/* Search */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <InputField
                    type="search"
                    placeholder="Search protocols by title, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Loading protocols...
                </div>
              ) : filteredProtocols.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No protocols found matching your search."
                    : "No protocols available."}
                </div>
              ) : (
                filteredProtocols.map((protocol) => (
                  <Card
                    key={protocol.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🔬</span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">
                              {protocol.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge className={getStatusColor(protocol.status)}>
                          {protocol.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {protocol.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {protocol.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
