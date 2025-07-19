import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Brain, Coins, Shield, TrendingUp, Clock, ChevronDown, Play, Star, Users, Award, Target } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-cyber-blue/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-cyber-blue" />
          <h1 className="text-3xl font-bold">
            Study<span className="text-neon-green">Coin</span>
          </h1>
        </div>
        <Button 
          onClick={onLogin}
          className="bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold px-6 py-2 rounded-lg hover:shadow-glow-cyan transition-all duration-300"
        >
          <Zap className="mr-2 h-4 w-4" />
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-gradient-to-r from-cyber-blue via-neon-green to-cyber-blue bg-clip-text">
            Study Smart,
            <br />
            Mine Crypto
          </h2>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your study sessions into <span className="text-cyber-blue font-semibold">cryptocurrency earnings</span>. 
            Our AI-powered focus detection ensures maximum productivity while you mine digital assets.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              onClick={onLogin}
              size="lg" 
              className="bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold px-8 py-4 rounded-lg hover:shadow-glow-cyan transition-all duration-300 hover:scale-105 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Mining Study Sessions
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300 px-8 py-4 text-lg"
            >
              Watch Demo
            </Button>
          </div>

        
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-background to-card/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionary <span className="text-transparent bg-gradient-to-r from-cyber-blue to-neon-green bg-clip-text">Study-to-Earn</span> Platform
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-cyber-blue to-neon-green mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Focus Detection",
                description: "Advanced neural networks monitor your study sessions through video and audio analysis to ensure authentic focus and maximize productivity.",
                color: "cyber-blue"
              },
              {
                icon: Coins,
                title: "Real-time Crypto Mining",
                description: "Earn cryptocurrency automatically while studying. Your focused attention translates directly into digital assets with our mining algorithm.",
                color: "neon-green"
              },
              {
                icon: TrendingUp,
                title: "Advanced Analytics",
                description: "Monitor your study progress, crypto earnings, and productivity metrics with real-time dashboards and insights.",
                color: "cyber-blue"
              }
            ].map((feature, i) => (
              <Card key={i} className="group p-8 bg-card/50 border-2 border-border hover:border-cyber-blue/50 transition-all duration-300 hover:shadow-glow-cyan">
                <div className="inline-flex p-3 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 mb-6">
                  <feature.icon className="h-8 w-8 text-cyber-blue" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-cyber-blue">
                  {feature.title}
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-card/30 via-background to-card/30 border-y border-cyber-blue/20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-gradient-to-r from-cyber-blue via-neon-green to-cyber-blue bg-clip-text">
            Join the Study Revolution
          </h3>
          
          <p className="text-xl text-foreground/80 mb-12 max-w-2xl mx-auto">
            Be part of the future where education meets blockchain technology. 
            Start earning while learning today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={onLogin}
              size="lg"
              className="bg-gradient-to-r from-neon-green to-cyber-blue text-black font-bold px-12 py-6 rounded-lg hover:shadow-glow-green transition-all duration-300 hover:scale-105 text-xl"
            >
              <Zap className="mr-3 h-6 w-6" />
              Start Mining Now
            </Button>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-cyber-blue/20 bg-gradient-to-b from-background to-card/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Coins className="h-8 w-8 text-cyber-blue" />
              <span className="text-2xl font-bold">
                Study<span className="text-neon-green">Coin</span>
              </span>
            </div>
            
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              The future of productive learning is here. Study smarter, earn crypto, 
              and join the next generation of digital learners.
            </p>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent mb-8"></div>
            
            <div className="text-sm text-foreground/50">
              © 2024 StudyMiner. Powering the future of education.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}