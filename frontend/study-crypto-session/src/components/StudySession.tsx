import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Square, Play } from "lucide-react";
import Dashboard from "./Dashboard";
import { useAuth0 } from "@auth0/auth0-react";

interface StudySessionProps {
  onEndSession: () => void;
}

export default function StudySession({ onEndSession }: StudySessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [cpuPercentage, setCpuPercentage] = useState(50);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [accessToken, setAccessToken] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraPerm = await navigator.permissions.query({ name: "camera" as PermissionName });
        const micPerm = await navigator.permissions.query({ name: "microphone" as PermissionName });

        setCameraPermission(cameraPerm.state as "granted" | "denied" | "prompt");
        setMicPermission(micPerm.state as "granted" | "denied" | "prompt");

        cameraPerm.onchange = () => setCameraPermission(cameraPerm.state as any);
        micPerm.onchange = () => setMicPermission(micPerm.state as any);
      } catch (error) {
        console.error("Permission check failed:", error);
        setCameraPermission("denied");
        setMicPermission("denied");
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);
      } catch (err) {
        console.error("Failed to get access token", err);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const startSession = async () => {
    if (cameraPermission !== 'granted' || micPermission !== 'granted') {
      alert('Camera and microphone permissions are required.');
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cpuPercentage,
          sessionDuration,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to start session:', errorData);
        alert('Failed to start session. Please try again.');
        return;
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      alert('An error occurred while starting the session.');
      return;
    }

    setIsRecording(true);
    const start = new Date();
    setSessionStartTime(start);

    timeoutRef.current = setTimeout(() => {
      console.log("Session expired – auto-ending.");
      endSession(true); // mark as expired
    }, sessionDuration * 60 * 1000);
  };

  const endSession = async (expired = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      await fetch("http://127.0.0.1:5000/api/end-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          expired,
          startTime: sessionStartTime?.toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to end session:', err);
    }

    setIsRecording(false);
    setSessionStartTime(null);
    onEndSession();
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6 relative">
      {isRecording && <Dashboard isStudying sessionStartTime={sessionStartTime || undefined} />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Study Session
          </h1>
          <p className="text-muted-foreground">
            Focus on your studies while our AI monitors your attention and mines crypto.
          </p>
        </div>

        <div className={`transition-all duration-500 ${isRecording ? 'h-[600px]' : 'h-[320px]'} rounded-xl overflow-hidden mb-6`}>
          {isRecording && cameraPermission === "granted" ? (
            <img
              src="http://localhost:5000/video_feed"
              alt="Live study feed"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              {cameraPermission !== "granted" ? "Camera permission required" : "Start a session to begin"}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <Card className="flex-1 p-4 bg-card border-border">
            <label className="text-sm font-medium block mb-1">Session Duration (minutes)</label>
            <input
              type="number"
              min={5}
              max={240}
              value={sessionDuration}
              onChange={e => setSessionDuration(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Card>

          <Card className="flex-1 p-4 bg-card border-border">
            <label className="text-sm font-medium block mb-1">CPU Usage for Mining (%)</label>
            <input
              type="range"
              min={10}
              max={100}
              step={10}
              value={cpuPercentage}
              onChange={e => setCpuPercentage(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1 text-right">{cpuPercentage}%</p>
          </Card>
        </div>

        <Button
          size="lg"
          onClick={isRecording ? () => endSession(false) : startSession}
          disabled={cameraPermission !== 'granted' || micPermission !== 'granted'}
          className="w-full"
          variant={isRecording ? 'destructive' : 'default'}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5 mr-2" /> End Session
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" /> Start Study Session
            </>
          )}
        </Button>
      </div>
    </div>
  );
}