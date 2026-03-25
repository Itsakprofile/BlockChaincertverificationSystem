import React from 'react';
import { useBlockchain } from '../services/useBlockchain';

export const BlockchainConnector: React.FC = () => {
  const { isConnected, account, isCorrectNetwork, isLoading, error, connectWallet, switchToGanache } = useBlockchain();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
          </span>
        </div>

        {!isConnected && (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}
      </div>

      {isConnected && account && (
        <div className="mt-3 text-xs text-slate-600">
          <div>Account: {formatAddress(account)}</div>
          <div className="flex items-center mt-1">
            <span>Network: </span>
            {isCorrectNetwork ? (
              <span className="text-green-600 ml-1">Ganache ✓</span>
            ) : (
              <div className="flex items-center ml-1">
                <span className="text-red-600">Wrong Network</span>
                <button
                  onClick={switchToGanache}
                  disabled={isLoading}
                  className="ml-2 bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 disabled:bg-orange-400"
                >
                  Switch to Ganache
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};
