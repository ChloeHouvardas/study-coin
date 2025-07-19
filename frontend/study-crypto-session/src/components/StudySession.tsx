import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Camera, Mic, Square, Play, AlertTriangle, CheckCircle } from "lucide-react";
import Dashboard from "./Dashboard";

interface StudySessionProps {
  onEndSession: () => void;
}

export default function StudySession({ onEndSession }: StudySessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [focusStatus, setFocusStatus] = useState<'focused' | 'distracted' | 'analyzing'>('analyzing');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Request camera and microphone permissions
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setCameraPermission('granted');
        setMicPermission('granted');
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Permission denied:', error);
        setCameraPermission('denied');
        setMicPermission('denied');
      }
    };

    requestPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    // Simulate AI focus detection
    const focusInterval = setInterval(() => {
      const focusStatuses: Array<'focused' | 'distracted' | 'analyzing'> = ['focused', 'focused', 'focused', 'analyzing', 'distracted'];
      const randomStatus = focusStatuses[Math.floor(Math.random() * focusStatuses.length)];
      setFocusStatus(randomStatus);
    }, 10000);

    return () => clearInterval(focusInterval);
  }, [isRecording]);

  const startSession = () => {
    if (cameraPermission !== 'granted' || micPermission !== 'granted') {
      alert('Camera and microphone permissions are required to start a study session.');
      return;
    }
    
    setIsRecording(true);
    setSessionStartTime(new Date());
    setFocusStatus('analyzing');
  };

  const endSession = () => {
    setIsRecording(false);
    setSessionStartTime(null);
    setFocusStatus('analyzing');
    onEndSession();
  };

  const getFocusStatusIcon = () => {
    switch (focusStatus) {
      case 'focused':
        return <CheckCircle className="h-5 w-5 text-neon-green" />;
      case 'distracted':
        return <AlertTriangle className="h-5 w-5 text-warning-orange" />;
      case 'analyzing':
        return <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getFocusStatusText = () => {
    switch (focusStatus) {
      case 'focused':
        return 'Focused - Mining Active';
      case 'distracted':
        return 'Distracted - Mining Paused';
      case 'analyzing':
        return 'Analyzing Focus...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <Dashboard isStudying={isRecording} sessionStartTime={sessionStartTime || undefined} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Study Session
          </h1>
          <p className="text-muted-foreground">
            Focus on your studies while our AI monitors your attention and mines crypto
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Feed */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Video Monitoring</h3>
                <div className="flex items-center gap-2">
                  <Camera className={`h-5 w-5 ${cameraPermission === 'granted' ? 'text-neon-green' : 'text-muted-foreground'}`} />
                  <Mic className={`h-5 w-5 ${micPermission === 'granted' ? 'text-neon-green' : 'text-muted-foreground'}`} />
                </div>
              </div>
              
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {cameraPermission === 'granted' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {cameraPermission === 'denied' ? 'Camera access denied' : 'Requesting camera access...'}
                      </p>
                    </div>
                  </div>
                )}
                
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">RECORDING</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Controls & Status */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Session Controls</h3>
                
                {!isRecording ? (
                  <Button 
                    size="lg" 
                    onClick={startSession}
                    disabled={cameraPermission !== 'granted' || micPermission !== 'granted'}
                    className="w-full"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Study Session
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    onClick={endSession}
                    className="w-full"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    End Session
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {getFocusStatusIcon()}
                      <span className="font-medium">{getFocusStatusText()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our AI is analyzing your video and audio to determine focus levels. 
                      Crypto mining is {focusStatus === 'focused' ? 'active' : 'paused'}.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Study Tips:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Keep your face visible to the camera</li>
                      <li>• Maintain focus on your study materials</li>
                      <li>• Minimize distractions and multitasking</li>
                      <li>• Take breaks when needed</li>
                    </ul>
                  </div>
                </div>
              )}

              {(cameraPermission === 'denied' || micPermission === 'denied') && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">Permissions Required</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please enable camera and microphone access to start your study session.
                    Refresh the page and grant permissions when prompted.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}