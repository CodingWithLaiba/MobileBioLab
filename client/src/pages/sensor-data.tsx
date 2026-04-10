import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Zap,
  Bluetooth,
  Wifi,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";

// Types
type SensorReading = {
  timestamp: string;
  temperature: number;
  ph: number;
  conductivity: number;
};

type SensorDevice = {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  batteryLevel: number;
  lastReading: string;
  status: "active" | "inactive" | "error";
};

// Mock data generators
const generateMockReading = (): SensorReading => {
  const now = new Date();
  const timeStr = `${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return {
    timestamp: timeStr,
    temperature: 22 + Math.random() * 3,
    ph: 6.8 + Math.random() * 0.6,
    conductivity: 440 + Math.random() * 40,
  };
};

const SENSORS: SensorDevice[] = [
  {
    id: "temp-001",
    name: "Temperature Probe",
    type: "Temperature",
    connected: true,
    batteryLevel: 85,
    lastReading: "Just now",
    status: "active",
  },
  {
    id: "ph-001",
    name: "pH Meter",
    type: "pH",
    connected: true,
    batteryLevel: 62,
    lastReading: "5s ago",
    status: "active",
  },
  {
    id: "cond-001",
    name: "Conductivity Sensor",
    type: "Conductivity",
    connected: false,
    batteryLevel: 23,
    lastReading: "2m ago",
    status: "inactive",
  },
];

const SensorCard = ({
  icon,
  title,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit?: string;
  color: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-full ${color} bg-opacity-10`}>{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">
            {value.toFixed(1)}
            {unit && ` ${unit}`}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SensorChart = ({
  title,
  dataKey,
  color,
  unit = "",
  data,
}: {
  title: string;
  dataKey: keyof SensorReading;
  color: string;
  unit?: string;
  data: SensorReading[];
}) => (
  <div>
    <h4 className="text-sm font-medium mb-2">
      {title} {unit && `(${unit})`}
    </h4>
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function SensorData() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sensorData, setSensorData] = useState<SensorReading[]>(() =>
    Array(10)
      .fill(0)
      .map(() => generateMockReading())
  );

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSensorData((prev) => [...prev.slice(1), generateMockReading()]);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const currentReading = sensorData[sensorData.length - 1];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sensor Data</h1>
            <p className="text-muted-foreground">
              Real-time environmental monitoring
            </p>
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Auto Updating" : "Pause Updates"}
          </Button>
        </div>

        {/* Current Readings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SensorCard
            icon={<Thermometer className="h-5 w-5 text-red-500" />}
            title="Temperature"
            value={currentReading.temperature}
            unit="°C"
            color="text-red-500"
          />
          <SensorCard
            icon={<Droplets className="h-5 w-5 text-blue-500" />}
            title="pH Level"
            value={currentReading.ph}
            color="text-blue-500"
          />
          <SensorCard
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            title="Conductivity"
            value={currentReading.conductivity}
            unit="μS/cm"
            color="text-yellow-500"
          />
        </div>

        {/* Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Sensor Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorChart
              title="Temperature"
              dataKey="temperature"
              color="#ef4444"
              unit="°C"
              data={sensorData}
            />
            <SensorChart
              title="pH Level"
              dataKey="ph"
              color="#3b82f6"
              data={sensorData}
            />
            <SensorChart
              title="Conductivity"
              dataKey="conductivity"
              color="#eab308"
              unit="μS/cm"
              data={sensorData}
            />
          </CardContent>
        </Card>

        {/* Sensor Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sensor Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SENSORS.map((sensor) => (
              <div key={sensor.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        sensor.connected ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {sensor.connected ? (
                        <Bluetooth className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Wifi className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{sensor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sensor.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sensor.status === "active"
                        ? "bg-green-100 text-green-800"
                        : sensor.status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Battery</span>
                    <span>{sensor.batteryLevel}%</span>
                  </div>
                  <Progress value={sensor.batteryLevel} className="h-2" />
                  {sensor.batteryLevel < 30 && (
                    <div className="flex items-center text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low battery
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Last update: {sensor.lastReading}</span>
                  {!sensor.connected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsConnecting(true);
                        setTimeout(() => {
                          setIsConnecting(false);
                          // In a real app, you would connect to the sensor here
                        }, 1000);
                      }}
                      disabled={isConnecting}
                      className="h-7 text-xs"
                    >
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
