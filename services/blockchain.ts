
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../blockchain/config';
import { BlockData, CertificateVerificationStatus } from '../types';

export class BlockchainService {
  private static _provider: ethers.BrowserProvider | null = null;
  private static _signer: ethers.Signer | null = null;
  private static _account: string | null = null;

  // Ganache network configuration
  private static readonly GANACHE_CHAIN_ID = '0x539'; // 1337 in hex
  private static readonly GANACHE_NETWORK = {
    chainId: '0x539',
    chainName: 'Ganache Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:7545'],
    blockExplorerUrls: [],
  };

  /**
   * Connect to MetaMask wallet
   */
  static async connectWallet(): Promise<string> {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask extension.');
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      this._account = accounts[0];
      await this.initProvider();
      return this._account;
    } catch (error) {
      throw new Error('Failed to connect wallet: ' + (error as Error).message);
    }
  }

  /**
   * Ensure wallet is connected and on correct network
   */
  private static async ensureConnection(): Promise<void> {
    if (!this._account) {
      await this.connectWallet();
    }

    if (!(await this.isOnCorrectNetwork())) {
      await this.switchToGanache();
    }
  }

  /**
   * Get current connected account
   */
  static getCurrentAccount(): string | null {
    return this._account;
  }

  private static getContractAddress(): string {
    const address = CONTRACT_CONFIG.address;
    if (!address || address === '0xYourDeployedContractAddress') {
      throw new Error('Contract address not configured. Please set VITE_CERT_REGISTRY_ADDRESS in .env');
    }
    return address;
  }

  /**
   * Check if connected to correct network (Ganache)
   */
  static async isOnCorrectNetwork(): Promise<boolean> {
    if (!this._provider) return false;

    try {
      const network = await this._provider.getNetwork();
      return network.chainId === BigInt(1337); // Ganache chain ID
    } catch (error) {
      return false;
    }
  }

  /**
   * Switch to Ganache network
   */
  static async switchToGanache(): Promise<void> {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.GANACHE_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [this.GANACHE_NETWORK],
          });
        } catch (addError) {
          throw new Error('Failed to add Ganache network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Ganache network');
      }
    }

    // Reinitialize provider after network switch
    await this.initProvider();
  }

  /**
   * Initialize ethers provider and signer
   */
  private static async initProvider(): Promise<void> {
    if (this._provider && this._signer) return;

    if (!(window as any).ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask and unlock wallet.');
    }

    this._provider = new ethers.BrowserProvider((window as any).ethereum as any);
    await this._provider.send('eth_requestAccounts', []);
    this._signer = await this._provider.getSigner();
  }

  private static async getContract(): Promise<ethers.Contract> {
    await this.initProvider();
    const signer = this._signer;
    if (!signer) throw new Error('Signer not initialized');

    return new ethers.Contract(this.getContractAddress(), CONTRACT_CONFIG.abi, signer);
  }

  /**
   * Add certificate record to smart contract
   * @param entry BlockData: certificateId, pdfHash, status etc
   */
  static async addBlock(entry: BlockData): Promise<void> {
    if (!entry.certificateId || !entry.pdfHash) {
      throw new Error('Missing certificateId or pdfHash');
    }

    await this.ensureConnection();
    const contract = await this.getContract();

    try {
      const tx = await contract.addCertificate(entry.certificateId, entry.pdfHash);
      await tx.wait();
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      throw new Error('Failed to add certificate: ' + error.message);
    }
  }

  /**
   * Revoke certificate by id (calls smart contract)
   * @param certificateId string
   */
  static async revokeCertificate(certificateId: string): Promise<void> {
    await this.ensureConnection();
    const contract = await this.getContract();

    try {
      const tx = await contract.revokeCertificate(certificateId);
      await tx.wait();
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      throw new Error('Failed to revoke certificate: ' + error.message);
    }
  }

  /**
   * Get certificate verification status from contract
   * @param certificateId string
   * @param currentPdfHash optional hash for integrity check
   */
  static async getCertificateStatus(certificateId: string, currentPdfHash?: string): Promise<CertificateVerificationStatus> {
    try {
      if (!currentPdfHash) {
        throw new Error('Current PDF hash is required for on-chain verification');
      }
      const contract = await this.getContract();
      const [exists, revoked, hashMatches] = await contract.verifyCertificate(certificateId, currentPdfHash);
      if (!exists) return 'NOT_FOUND';
      if (revoked) return 'REVOKED';
      if (!hashMatches) return 'INVALID';
      return 'VALID';
    } catch (error) {
      console.error('Blockchain status fetch failed', error);
      return 'NOT_FOUND';
    }
  }

  static async verifyCertificate(certificateId: string, currentPdfHash: string): Promise<CertificateVerificationStatus> {
    return this.getCertificateStatus(certificateId, currentPdfHash);
  }

  /**
   * Computes SHA-256 hash of a file
   * Used for certificate PDF integrity verification
   */
  static async hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

