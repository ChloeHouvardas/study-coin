import { Card } from "@/components/ui/card";
import { Coins, Clock, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardProps {
  isStudying: boolean;
  sessionStartTime?: Date;
}

export default function Dashboard({ isStudying, sessionStartTime }: DashboardProps) {
  const [cryptoMined, setCryptoMined] = useState(0.00000000);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hashRate, setHashRate] = useState(0);

  useEffect(() => {
    if (!isStudying || !sessionStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
      
      // Simulate crypto mining - increases based on study time
      const miningRate = 0.00000001; // BTC per second
      const newCrypto = elapsed * miningRate;
      setCryptoMined(newCrypto);
      
      // Simulate varying hash rate
      setHashRate(125.5 + Math.random() * 10);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isStudying, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStudying) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-border shadow-gaming">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins className="h-5 w-5" />
            <span className="text-sm">Not studying</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="p-4 bg-card/90 backdrop-blur-sm border-border shadow-glow-cyan">
        <div className="space-y-3 min-w-[250px]">
          {/* Session Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-blue" />
              <span className="text-sm font-medium">Session Time</span>
            </div>
            <span className="text-sm font-mono text-cyber-blue">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Crypto Mined */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-neon-green animate-pulse" />
              <span className="text-sm font-medium">BTC Mined</span>
            </div>
            <span className="text-sm font-mono text-neon-green">
              {cryptoMined.toFixed(8)}
            </span>
          </div>

          {/* Hash Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning-orange" />
              <span className="text-sm font-medium">Hash Rate</span>
            </div>
            <span className="text-sm font-mono text-warning-orange">
              {hashRate.toFixed(1)} H/s
            </span>
          </div>

          {/* Mining Status */}
          <div className="flex items-center justify-center pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-xs text-neon-green font-medium">MINING ACTIVE</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}