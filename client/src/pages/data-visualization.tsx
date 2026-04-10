import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import Navbar from "@/components/layout/navbar";

interface DataPoint {
  date: string;
  temperature: number;
  ph: number;
  conductivity: number;
  location: string;
  sampleType: string;
}

export default function DataVisualization() {
  const [selectedChart, setSelectedChart] = useState("line");
  const [selectedParameter, setSelectedParameter] = useState("temperature");

  const getLast7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    }).reverse();
  };

  // Mock data
  const sampleData: DataPoint[] = getLast7Days().map((date, index) => ({
    date,
    temperature: 22 + Math.random(),
    ph: 7.0 + Math.random(),
    conductivity: 450 + Math.random(),
    location: ["Lake Michigan", "Research Field", "Lab Room A", "Lab Room B"][
      index % 4
    ],
    sampleType: ["water", "soil", "biological_fluid", "air"][index % 4],
  }));
  // Pie chart data (sample type distribution)
  const sampleTypeData = [
    { name: "Water", value: 45, color: "#3b82f6" },
    { name: "Soil", value: 25, color: "#8b5cf6" },
    { name: "Biological Fluid", value: 20, color: "#10b981" },
    { name: "Air", value: 10, color: "#f59e0b" },
  ];

  const getParameterColor = (param: string) => {
    switch (param) {
      case "temperature":
        return "#ef4444";
      case "ph":
        return "#3b82f6";
      case "conductivity":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  const exportData = () => {
    const doc = new jsPDF();

    // Table headers
    const headers = [
      ["Date", "Temperature", "pH", "Conductivity", "Location", "Sample Type"],
    ];

    // Table rows
    const rows = sampleData.map((row) => [
      row.date,
      row.temperature,
      row.ph,
      row.conductivity,
      row.location,
      row.sampleType,
    ]);

    // Add title
    doc.setFontSize(16);
    doc.text("Lab Data Export", 14, 15);

    // Add table
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
    });

    // Save PDF
    doc.save("lab-data-export.pdf");
  };
  return (
    <div className=" bg-background">
      <Navbar />
      <div className="space-y-6">
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Data Visualization
            </h1>
            <p className="text-muted-foreground">
              Interactive charts and analytics for laboratory data analysis
            </p>
          </div>
          <Button onClick={exportData} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualization Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chart Type</label>
                <Select
                  value={selectedChart}
                  onChange={setSelectedChart}
                  placeholder="Select chart type"
                  className="w-40"
                  options={[
                    { label: "Line Chart", value: "line" },
                    { label: "Bar Chart", value: "bar" },
                    { label: "Pie Chart", value: "pie" },
                  ]}
                />
              </div>
              {selectedChart !== "pie" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parameter</label>
                  <Select
                    value={selectedParameter}
                    onChange={setSelectedParameter}
                    placeholder="Select parameter"
                    className="w-40"
                    options={[
                      { label: "Temperature", value: "temperature" },
                      { label: "pH Level", value: "ph" },
                      { label: "Conductivity", value: "conductivity" },
                    ]}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedChart === "pie"
                ? "Sample Type Distribution"
                : `${
                    selectedParameter.charAt(0).toUpperCase() +
                    selectedParameter.slice(1)
                  } Trends`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              {selectedChart === "line" ? (
                <LineChart
                  data={sampleData}
                  margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedParameter}
                    stroke={getParameterColor(selectedParameter)}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              ) : selectedChart === "bar" ? (
                <BarChart
                  data={sampleData}
                  margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={selectedParameter}
                    fill={getParameterColor(selectedParameter)}
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={sampleTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {sampleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
