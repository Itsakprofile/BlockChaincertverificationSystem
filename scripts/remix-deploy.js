// Remix Deployment Script for CertificateRegistry.sol
// Copy and paste this into Remix JavaScript VM or Injected Web3 console

// 1. First, compile the contract in Remix
// 2. Deploy using this script:

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "pdfHash",
        "type": "string"
      }
    ],
    "name": "addCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certId",
        "type": "string"
      }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "pdfHash",
        "type": "string"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "revoked",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hashMatches",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certId",
        "type": "string"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "internalType": "string",
        "name": "pdfHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "revoked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// After deployment, copy the contract address and update your .env file:
// VITE_CERT_REGISTRY_ADDRESS=0x...

// Example usage after deployment:
// const contract = new web3.eth.Contract(contractABI, '0x...contractAddress...');

// Add certificate
// await contract.methods.addCertificate('CERT-123', 'sha256-hash').send({from: account})

// Verify certificate
// const result = await contract.methods.verifyCertificate('CERT-123', 'sha256-hash').call()
// console.log('Exists:', result[0], 'Revoked:', result[1], 'Hash Matches:', result[2])

// Revoke certificate
// await contract.methods.revokeCertificate('CERT-123').send({from: account})
