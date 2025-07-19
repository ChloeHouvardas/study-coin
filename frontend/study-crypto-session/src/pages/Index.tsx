import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import StudySession from '@/components/StudySession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, User, Play } from 'lucide-react';

const Index = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();
  const [currentView, setCurrentView] = useState<'dashboard' | 'study'>('dashboard');
  console.log("AUTH DEBUG", {
  isLoading,
  isAuthenticated,
  user
});
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading StudyMiner...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={loginWithRedirect} />;
  }

  if (currentView === 'study') {
    return <StudySession onEndSession={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StudyMiner
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user?.name || user?.email}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Welcome Back, {user?.given_name || 'Miner'}!
          </h2>
          <p className="text-xl text-muted-foreground">
            Ready to turn your study time into crypto earnings?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Stats */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Study Time</span>
                <span className="font-mono text-cyber-blue">02:45:32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BTC Mined</span>
                <span className="font-mono text-neon-green">0.00000234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus Score</span>
                <span className="font-mono text-cyber-blue">92%</span>
              </div>
            </div>
          </Card>

          {/* Total Earnings */}
          <Card className="p-6 bg-card border-border shadow-glow-green">
            <h3 className="text-lg font-semibold mb-4">Total Earnings</h3>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-neon-green">
                0.00012450 BTC
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ $7.85 USD
              </div>
              <div className="text-xs text-muted-foreground">
                From 45.2 hours of focused study
              </div>
            </div>
          </Card>

          {/* Mining Stats */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Mining Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Hash Rate</span>
                <span className="font-mono text-warning-orange">127.3 H/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efficiency</span>
                <span className="font-mono text-cyber-blue">94.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions</span>
                <span className="font-mono">23</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Start Session Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => setCurrentView('study')}
            className="text-lg px-8 py-6"
          >
            <Play className="h-6 w-6 mr-3" />
            Start New Study Session
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Begin studying to start mining crypto automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
