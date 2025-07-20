import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from "sonner";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: string;
  walletAddress: string;
  onWithdrawSuccess?: (amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  walletAddress,
  onWithdrawSuccess,
}) => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawAll, setWithdrawAll] = React.useState(true);
  const maxBalance = parseFloat(availableBalance);
  const formattedBalance = maxBalance.toFixed(2);

  // Reset amount when modal opens or closes
  React.useEffect(() => {
    if (isOpen) {
      setWithdrawAll(true);
      setWithdrawAmount('');
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const numValue = parseFloat(value || '0');
      if (numValue <= maxBalance) {
        setWithdrawAmount(value);
      }
    }
  };

  const toggleWithdrawAll = () => {
    setWithdrawAll(!withdrawAll);
    if (!withdrawAll) {
      setWithdrawAmount('');
    }
  };

  const actualWithdrawAmount = withdrawAll ? maxBalance : parseFloat(withdrawAmount || '0');
  const isValidAmount = actualWithdrawAmount > 0 && actualWithdrawAmount <= maxBalance;

  const handleWithdraw = async () => {
    try {
      setIsSubmitting(true);
      
      const token = await getAccessTokenSilently();
      
      const response = await fetch('http://127.0.0.1:5000/api/withdraw-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          amount: actualWithdrawAmount,
          wallet: walletAddress
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Withdrawal failed');
      }
      
      const result = await response.json();
      
      if (onWithdrawSuccess) {
        onWithdrawSuccess(actualWithdrawAmount);
      }
      
      toast.success(`Successfully withdrew $${actualWithdrawAmount.toFixed(2)}!`);
      onClose();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-cyber-blue/20 bg-card/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyber-blue to-neon-green bg-clip-text flex items-center">
            <Coins className="h-5 w-5 mr-2 text-neon-green" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Transfer your earned StudyCoins to your personal wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Available Balance</label>
            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-neon-green to-cyber-blue bg-clip-text">
              $ {formattedBalance} USD
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground/80">Withdrawal Amount</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleWithdrawAll}
                className={`text-xs px-2 py-1 h-auto ${withdrawAll ? 'bg-neon-green/20 text-neon-green' : 'text-foreground/60'}`}
              >
                {withdrawAll && <Check className="h-3 w-3 mr-1" />}
                Withdraw All
              </Button>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">$</span>
              <Input
                type="text"
                value={withdrawAll ? formattedBalance : withdrawAmount}
                onChange={handleAmountChange}
                disabled={withdrawAll}
                className={`pl-8 border-2 ${withdrawAll ? 'border-neon-green/30 bg-neon-green/5' : 'border-cyber-blue/20 bg-background/50'} backdrop-blur-sm`}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Destination Wallet Address</label>
            <Input
              value={walletAddress}
              readOnly
              className="border-2 border-cyber-blue/20 bg-background/50 backdrop-blur-sm"
            />
            {!walletAddress && (
              <div className="flex items-center text-amber-500 text-xs mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Please set your wallet address in the dashboard first
              </div>
            )}
          </div>

          <div className="flex items-center justify-center p-4 border border-dashed border-cyber-blue/30 rounded-lg bg-cyber-blue/5">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <Coins className="h-4 w-4 text-neon-green" />
                </div>
                <ArrowRight className="h-4 w-4 mx-2 text-foreground/40" />
                <div className="h-8 w-8 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-cyber-blue" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 12H17M17 12L13 8M17 12L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-foreground/60">
                Funds will be transferred to your specified wallet address
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={isSubmitting || !walletAddress || !isValidAmount}
            className="bg-gradient-to-r from-cyber-blue to-neon-green text-black font-semibold hover:shadow-glow-cyan transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Withdraw ${actualWithdrawAmount.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
