import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Brain, Coins, Shield, TrendingUp, Clock } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Coins className="h-8 w-8 text-cyber-blue animate-pulse" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StudyMiner
          </h1>
        </div>
        <Button variant="cyber" onClick={onLogin}>
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-float">
            Study Smart,
            <br />
            Mine Crypto
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Turn your study sessions into crypto earnings. AI-powered focus detection ensures you stay productive while mining digital assets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="" size="lg" onClick={onLogin}>
              Start Mining Study Sessions
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Revolutionary Study-to-Earn Platform
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-border hover:shadow-glow-cyan transition-all duration-300">
              <Brain className="h-12 w-12 text-cyber-blue mb-4" />
              <h4 className="text-xl font-semibold mb-2">AI Focus Detection</h4>
              <p className="text-muted-foreground">
                Advanced AI monitors your study sessions through video and audio to ensure genuine focus and productivity.
              </p>
            </Card>
            
            <Card className="p-6 bg-card border-border hover:shadow-glow-green transition-all duration-300">
              <Coins className="h-12 w-12 text-neon-green mb-4" />
              <h4 className="text-xl font-semibold mb-2">Crypto Mining</h4>
              <p className="text-muted-foreground">
                Mine cryptocurrency while you study. Your focused study time translates directly into digital earnings.
              </p>
            </Card>
            
            <Card className="p-6 bg-card border-border hover:shadow-glow-cyan transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-electric-purple mb-4" />
              <h4 className="text-xl font-semibold mb-2">Real-time Analytics</h4>
              <p className="text-muted-foreground">
                Track your study progress, crypto earnings, and productivity metrics in real-time with beautiful dashboards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12 text-background">
            Join the Study Revolution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-background mb-2">10K+</div>
              <div className="text-background/80">Active Miners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-background mb-2">50M+</div>
              <div className="text-background/80">Study Hours</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-background mb-2">$2M+</div>
              <div className="text-background/80">Crypto Earned</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-background mb-2">95%</div>
              <div className="text-background/80">Focus Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="h-6 w-6 text-cyber-blue" />
            <span className="font-semibold">StudyMiner</span>
          </div>
          <p className="text-muted-foreground">
            The future of productive learning is here. Study smarter, earn crypto.
          </p>
        </div>
      </footer>
    </div>
  );
}