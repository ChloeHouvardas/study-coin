import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import StudySession from '@/components/StudySession';
import WithdrawModal from '@/components/WithdrawModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LogOut, 
  User, 
  Play, 
  Coins,
  Clock,
  TrendingUp,
  Zap,
  Users,
  Trophy,
  Target,
  Calendar,
  Activity,
  Award,
  Star,
  Brain,
  Shield,
  Flame
} from 'lucide-react';

const Index = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [currentView, setCurrentView] = useState<'dashboard' | 'study'>('dashboard');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [availableBalance, setAvailableBalance] = useState("0.00");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch('http://127.0.0.1:5000/api/wallet-info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setWalletAddress(data.wallet || "");
        setAvailableBalance(data.balance || "0.00");
      } catch (err) {
        console.error("Failed to fetch wallet info:", err);
      }
    };

    if (isAuthenticated) fetchWalletInfo();
  }, [isAuthenticated]);
useEffect(() => {
  const fetchStats = async () => {
    setLoadingStats(true); // start loader
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('http://127.0.0.1:5000/api/user-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStatsData(data);
      console.log("Fetched stats:", data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false); // stop loader
    }
  };

  if (isAuthenticated) fetchStats();
}, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-2xl font-bold mb-2 text-transparent bg-gradient-to-r from-cyber-blue to-neon-green bg-clip-text">
            StudyMiner
          </div>
          <p className="text-foreground/60">Initializing mining protocols...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={loginWithRedirect} />;
  }

  if (loadingStats) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-2xl font-bold mb-2 text-transparent bg-gradient-to-r from-neon-green to-cyber-blue bg-clip-text">
          Fetching Stats...
        </div>
        <p className="text-foreground/60">Loading your mining dashboard</p>
      </div>
    </div>
  );
}


  if (currentView === 'study') {
    return (
      <StudySession
        onEndSession={() => setCurrentView('dashboard')}
        setCurrentView={setCurrentView}
      />
    );
  }



const fallbackData = {
  studyTime: '00:00:00',
  btcMined: '0.00000000',
  usdValue: '$0.00',
  focusScore: '0%',
  sessions: 0,
  efficiency: '0%'
};

const currentData = statsData?.[selectedTimeframe] || fallbackData;

  const friends = [
    { name: 'Simon Risk', avatar: '👨‍💻', studyTime: '45.2h', earnings: '0.00028k XMR', rank: 1, isOnline: true },
    { name: 'Chloe Houvardas', avatar: '👩‍🎓', studyTime: '42.8h', earnings: '0.00025k XMR', rank: 2, isOnline: true },
    { name: 'Nicole Steiner', avatar: '👩‍💼', studyTime: '35.1h', earnings: '0.00021k XMR', rank: 4, isOnline: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-cyber-blue/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-cyber-blue/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-cyber-blue animate-pulse" />
          <h1 className="text-3xl font-bold">
            Study<span className="text-neon-green">Coin</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-cyber-blue/20 bg-card/50 backdrop-blur-sm">
            <User className="h-4 w-4 text-cyber-blue" />
            <span className="text-sm font-medium">{user?.name || user?.email}</span>
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="text-center mb-5">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-gradient-to-r from-cyber-blue via-neon-green to-cyber-blue bg-clip-text">
            Welcome Back, {user?.given_name || 'Miner'}!
          </h2>
          <p className="text-xl text-foreground/80">
            Your neural mining rig is <span className="text-neon-green font-semibold">online</span> and ready to earn
          </p>
        </div>

        <div className="text-center mb-6">
          <Button 
            size="lg" 
            onClick={() => setCurrentView('study')}
            className="bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold px-12 py-6 rounded-lg hover:shadow-glow-cyan transition-all duration-300 hover:scale-105 text-xl"
          >
            <Play className="h-6 w-6 mr-3" />
            Initialize Mining Session
          </Button>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Star className="h-4 w-4 text-neon-green fill-current" />
              <span>Neural AI Ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Zap className="h-4 w-4 text-cyber-blue" />
              <span>Mining Pool Active</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-5">
          <div className="flex gap-2 p-1 rounded-lg border border-cyber-blue/20 bg-card/50 backdrop-blur-sm">
            {(['today', 'week', 'month', 'year'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
                className={selectedTimeframe === timeframe 
                  ? "bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold" 
                  : "text-foreground/70 hover:text-foreground hover:bg-cyber-blue/10"
                }
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Study Time */}
          <Card className="p-6 bg-card/50 border-2 border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300 hover:shadow-glow-cyan backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyber-blue">Study Time</h3>
              <Clock className="h-6 w-6 text-cyber-blue" />
            </div>
            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyber-blue to-neon-green bg-clip-text">
              {currentData.studyTime}
            </div>
            <p className="text-sm text-foreground/60 mt-2">
              {currentData.sessions} focused sessions
            </p>
          </Card>

          {/* BTC Mined */}
          <Card className="p-6 bg-card/50 border-2 border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 hover:shadow-glow-green backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neon-green">XMR Mined</h3>
              <Coins className="h-6 w-6 text-neon-green" />
            </div>
            <div className="text-3xl font-bold text-neon-green">
              $ {parseFloat(currentData.btcMined).toFixed(2)} USD
            </div>
            <p className="text-sm text-foreground/60 mt-2">
              ≈ {currentData.usdValue} XMR
            </p>
          </Card>

          {/* Focus Score */}
          <Card className="p-6 bg-card/50 border-2 border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300 hover:shadow-glow-cyan backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyber-blue">Focus Score</h3>
              <Brain className="h-6 w-6 text-cyber-blue" />
            </div>
            <div className="text-3xl font-bold text-cyber-blue">
              {currentData.focusScore}
            </div>
            <p className="text-sm text-foreground/60 mt-2">
              AI-verified concentration
            </p>
          </Card>

          {/* Mining Efficiency */}
          <Card className="p-6 bg-card/50 border-2 border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 hover:shadow-glow-green backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neon-green">Efficiency</h3>
              <TrendingUp className="h-6 w-6 text-neon-green" />
            </div>
            <div className="text-3xl font-bold text-neon-green">
              {currentData.efficiency}
            </div>
            <p className="text-sm text-foreground/60 mt-2">
              Neural hash rate optimal
            </p>
          </Card>
        </div>

        {/* Wallet Section */}
        <Card className="p-6 mt-6 bg-card/50 border-2 border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300 hover:shadow-glow-cyan backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-cyber-blue">Mining Wallet</h3>
            <Shield className="h-6 w-6 text-cyber-blue" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-cyber-blue mb-2 block flex items-center gap-2">
                <Target className="h-4 w-4" />
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your XMR wallet address"
                className="w-full px-4 py-3 border-2 border-cyber-blue/20 rounded-lg bg-background/50 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-cyber-blue focus:outline-none focus:shadow-glow-cyan transition-all duration-300"
              />
            </div>
            
            <div className="flex flex-col justify-center">
              <label className="text-sm font-medium text-foreground/80 mb-2 block flex items-center gap-2">
                <Coins className="h-4 w-4 text-neon-green" />
                Available Balance
              </label>
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-neon-green to-cyber-blue bg-clip-text">
                $ {parseFloat(availableBalance).toFixed(2)} USD
              </div>
              <p className="text-sm text-foreground/60 mt-1">
                Ready for withdrawal
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button 
              onClick={async () => {
                try {
                  const token = await getAccessTokenSilently();
                  await fetch('http://127.0.0.1:5000/api/update-wallet', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ wallet: walletAddress }),
                  });
                  alert("Wallet updated successfully!");
                } catch (err) {
                  console.error("Failed to update wallet:", err);
                  alert("Failed to update wallet. Please try again.");
                }
              }}
              className="bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold px-6 py-2 rounded-lg hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
            >
              <Shield className="h-4 w-4 mr-2" />
              Save Wallet Address
            </Button>
            
            <Button 
              variant="outline"
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 hover:border-neon-green/50 hover:text-white transition-all duration-300"
              disabled={parseFloat(availableBalance) === 0}
              onClick={() => setIsWithdrawModalOpen(true)}
            >
              <Coins className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </Card>


        {/* Friends Section */}
        <Card className="p-6 mt-4 bg-card/50 border-2 border-cyber-blue/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-cyber-blue">Mining Network</h3>
            <Users className="h-6 w-6 text-cyber-blue" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {friends.map((friend, i) => (
              <div key={i} className="p-4 rounded-lg border border-cyber-blue/20 bg-background/30 text-center hover:border-cyber-blue/40 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="text-2xl mb-2">{friend.avatar}</div>
                  <div className={`w-2 h-2 rounded-full ml-1 ${friend.isOnline ? 'bg-neon-green' : 'bg-foreground/30'}`}></div>
                </div>
                <div className="font-semibold text-sm mb-1">{friend.name}</div>
                <div className="text-xs text-cyber-blue mb-1">#{friend.rank}</div>
                <div className="text-xs text-foreground/60 mb-1">{friend.studyTime}</div>
                <div className="text-xs text-neon-green">{friend.earnings}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Start Session Button */}

      </div>
      {/* Withdraw Modal */}
      <WithdrawModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        walletAddress={walletAddress}
        onWithdrawSuccess={(amount) => {
          const currentBalance = parseFloat(availableBalance);
          const newBalance = Math.max(0, currentBalance - amount).toFixed(2);
          setAvailableBalance(newBalance);
          
          setTimeout(() => {
            const fetchWalletInfo = async () => {
              try {
                const token = await getAccessTokenSilently();
                const res = await fetch('http://127.0.0.1:5000/api/wallet-info', {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                const data = await res.json();
                setWalletAddress(data.wallet || "");
                setAvailableBalance(data.balance || "0.00");
              } catch (err) {
                console.error("Failed to fetch wallet info:", err);
              }
            };
            fetchWalletInfo();
          }, 1000);
        }}
      />
    </div>
  );
};

export default Index;