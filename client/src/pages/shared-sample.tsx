import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SharedSampleResponse {
  id: number;
  sampleId: number;
  sharedBy: number;
  sharedWith?: string | null;
  shareToken: string;
  shareType: string;
  expiresAt?: string | null;
  accessCount: number;
  maxAccess?: number | null;
  isActive: boolean;
  createdAt: string;
}

interface Sample {
  id: number;
  sampleId: string;
  sampleType: string;
  collectionDate: string;
  location?: string | null;
  temperature?: string | null;
  ph?: string | null;
}

export default function SharedSamplePage() {
  const [, params] = useRoute("/shared-sample/:token");
  const token = params?.token ?? "";

  const [share, setShare] = useState<SharedSampleResponse | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/sample-shares/token/${token}`);
        if (!res.ok) throw new Error("Invalid or expired share link");
        const shareData: SharedSampleResponse = await res.json();
        setShare(shareData);
        const sampleRes = await fetch(`/api/samples/${shareData.sampleId}`, {
          credentials: "include",
        });
        if (sampleRes.ok) {
          setSample(await sampleRes.json());
        }
      } catch (e: any) {
        setError(e.message || "Failed to load shared sample");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!share) return <div className="p-8">Share not found.</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Shared Sample</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Share Token: {share.shareToken}
          </div>
          {sample ? (
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                Sample {sample.sampleId}
              </div>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline" className="capitalize">
                  {sample.sampleType.replace("_", " ")}
                </Badge>
                <span>
                  Collected: {new Date(sample.collectionDate).toLocaleString()}
                </span>
                <span>Location: {sample.location || "N/A"}</span>
              </div>
              <div className="text-sm">
                Temperature: {sample.temperature ?? "N/A"}
              </div>
              <div className="text-sm">pH: {sample.ph ?? "N/A"}</div>
            </div>
          ) : (
            <div className="text-sm">
              You may need to log in to view full sample details.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
