export const CONTRACT_ABI = [
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

export const CONTRACT_CONFIG = {
  // Replace with your deployed contract address
  address: process.env.VITE_CERT_REGISTRY_ADDRESS || '0xYourDeployedContractAddress',
  abi: CONTRACT_ABI
};
