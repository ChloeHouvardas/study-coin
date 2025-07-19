import { Card } from "@/components/ui/card";
import { Coins, Clock, Zap } from "lucide-react";
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

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStudying, sessionStartTime]);

  useEffect(() => {
    if (!isStudying) return;

    const fetchData = async () => {
      try {
        const [earningsRes, hashrateRes] = await Promise.all([
          fetch("http://localhost:3001/earnings"),
          fetch("http://localhost:3001/hashrate")
        ]);
        
        const earningsData = await earningsRes.json();
        const hashrateData = await hashrateRes.json();
        console.log("Earnings Data:", earningsData);
        console.log("Hashrate Data:", hashrateData);
        setCryptoMined(parseFloat(earningsData.estimated_usd) || 0);
        setHashRate(parseFloat(hashrateData.hashrate_hs) || 0);
      } catch (err) {
        console.error("Failed to fetch mining data:", err);
      }
    };

    const interval = setInterval(fetchData, 3000);
    fetchData(); // Call immediately as well

    return () => clearInterval(interval);
  }, [isStudying]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyber-blue" />
              <span className="text-sm font-medium">Session Time</span>
            </div>
            <span className="text-sm font-mono text-cyber-blue">
              {formatTime(elapsedTime)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-neon-green animate-pulse" />
              <span className="text-sm font-medium">XMR Mined</span>
            </div>
            <span className="text-sm font-mono text-neon-green">
              {cryptoMined.toFixed(8)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning-orange" />
              <span className="text-sm font-medium">Hash Rate</span>
            </div>
            <span className="text-sm font-mono text-warning-orange">
              {hashRate.toFixed(1)} H/s
            </span>
          </div>

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
