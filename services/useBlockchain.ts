import { useState, useEffect } from 'react';
import { BlockchainService } from '../services/blockchain';

export interface BlockchainState {
  isConnected: boolean;
  account: string | null;
  isCorrectNetwork: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useBlockchain = () => {
  const [state, setState] = useState<BlockchainState>({
    isConnected: false,
    account: null,
    isCorrectNetwork: false,
    isLoading: false,
    error: null,
  });

  const connectWallet = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const account = await BlockchainService.connectWallet();
      const isCorrectNetwork = await BlockchainService.isOnCorrectNetwork();

      setState({
        isConnected: true,
        account,
        isCorrectNetwork,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  };

  const switchToGanache = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await BlockchainService.switchToGanache();
      const isCorrectNetwork = await BlockchainService.isOnCorrectNetwork();

      setState(prev => ({
        ...prev,
        isCorrectNetwork,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  };

  const checkConnection = async () => {
    const account = BlockchainService.getCurrentAccount();
    if (account) {
      const isCorrectNetwork = await BlockchainService.isOnCorrectNetwork();
      setState({
        isConnected: true,
        account,
        isCorrectNetwork,
        isLoading: false,
        error: null,
      });
    }
  };

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setState(prev => ({ ...prev, account: accounts[0] }));
        } else {
          setState({
            isConnected: false,
            account: null,
            isCorrectNetwork: false,
            isLoading: false,
            error: null,
          });
        }
      });

      // Listen for network changes
      (window as any).ethereum.on('chainChanged', async () => {
        const isCorrectNetwork = await BlockchainService.isOnCorrectNetwork();
        setState(prev => ({ ...prev, isCorrectNetwork }));
      });
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeAllListeners('accountsChanged');
        (window as any).ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    ...state,
    connectWallet,
    switchToGanache,
  };
};
