import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Square, Play } from "lucide-react";
import Dashboard from "./Dashboard";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


interface StudySessionProps {
  onEndSession: () => void;
  setCurrentView: (view: "dashboard" | "study") => void;
}


export default function StudySession({ onEndSession, setCurrentView }: StudySessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0);
  const [cpuPercentage, setCpuPercentage] = useState(50);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [accessToken, setAccessToken] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionCountdown, setDistractionCountdown] = useState<number | null>(null);
  const [sessionFailed, setSessionFailed] = useState<null | number>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
    if (!isRecording) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/focus-status");
        const data = await res.json();

        if (!data.studying) {
          if (distractionCountdown === null) {
            setDistractionCountdown(10);
          } else if (distractionCountdown === 1) {
            endSession(true);
          } else {
            setDistractionCountdown(prev => (prev !== null ? prev - 1 : null));
          }
          setIsDistracted(true);
        } else {
          setDistractionCountdown(null);
          setIsDistracted(false);
        }
      } catch (err) {
        console.error("Focus check failed", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, distractionCountdown]);

  useEffect(() => {
    if (!isRecording || sessionTimeLeft <= 0) return;

    const countdown = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev === 1) {
          clearInterval(countdown);
          setShowSuccessPopup(true);
          endSession(false); // trigger success session end
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isRecording, sessionTimeLeft]);

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
    setSessionTimeLeft(sessionDuration * 60);
  };

  const endSession = async (expired = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/end-session", {
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

      const result = await res.json();
      if (result.minedAmount !== undefined) {
        setSessionFailed(result.minedAmount);
        if (result.screenshot) {
          setScreenshotUrl(`http://localhost:5000/photos/${result.screenshot}`);
        }
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }

    setIsRecording(false);
    setSessionStartTime(null);
    setDistractionCountdown(null);
    setIsDistracted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6 relative">
      {isRecording && <Dashboard isStudying sessionStartTime={sessionStartTime || undefined} />}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1
            onClick={() => setCurrentView("dashboard")}
            className="cursor-pointer text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 block text-center hover:underline"
          >
            Study Session
          </h1>




          <p className="text-muted-foreground">
            Focus on your studies while our AI monitors your attention and mines crypto.
          </p>
        </div>

        <div className={`relative transition-all duration-500 ${isRecording ? 'h-[600px]' : 'h-[320px]'} rounded-xl overflow-hidden mb-6`}>
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

          {isRecording && sessionTimeLeft > 0 && (
            <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded font-mono text-sm shadow-md z-10">
              ⏳ {Math.floor(sessionTimeLeft / 60)
                .toString()
                .padStart(2, "0")}:
              {(sessionTimeLeft % 60).toString().padStart(2, "0")}
            </div>
          )}

          {isDistracted && distractionCountdown !== null && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
              ⚠️ Focus lost — ending in {distractionCountdown}s
            </div>
          )}

          {sessionFailed !== null && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <div className="text-center text-white space-y-4 px-4">
                <h2 className="text-3xl font-bold">❌ SESSION FAILED</h2>
                <p className="text-lg">
                  You lost out on <span className="font-semibold">{sessionFailed.toFixed(6)} coins</span>.
                </p>

                {screenshotUrl && (
                  <div>
                    <img
                      src={screenshotUrl}
                      alt="Screenshot"
                      className="max-h-[60vh] max-w-full rounded-lg border-4 border-white shadow-xl mx-auto"
                    />
                    <p className="mt-2 italic text-muted">"Caught you slacking off!"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {showSuccessPopup && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="text-center text-white px-4 space-y-4">
                <h2 className="text-3xl font-bold">🎉 Session Complete!</h2>
                <p className="text-lg">Congrats! Funds are ready to deposit.</p>
              </div>
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