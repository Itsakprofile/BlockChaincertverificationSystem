<div align="center">

</div>

# BlockCertVerify

BlockCertVerify is a secure certificate verification system that detects fake or altered certificates by comparing their generated hash values with stored blockchain records.

---

## 🚀 Run Locally

### Prerequisites
- Node.js installed
- MetaMask browser extension installed
- Ganache (local Ethereum chain) running on `http://127.0.0.1:7545`

### Steps
1. Clone repository and install dependencies
   - `npm install`

2. Start local Ganache chain
   - Open Ganache UI or run `ganache-cli -p 7545`.

3. Configure environment
   - Copy `.env` (already present) and set `VITE_CERT_REGISTRY_ADDRESS` after deploy.
   - `GANACHE_URL` defaults to `http://127.0.0.1:7545`.

4. Compile and deploy smart contract
   - `npx hardhat compile`
   - `npm run deploy:local`
   - Note contract address from console and set `VITE_CERT_REGISTRY_ADDRESS`.

5. Start frontend
   - `npm run dev`

6. Open browser to `http://localhost:5173` (or Vite port) and connect MetaMask.

---

## 📝 Blockchain Contract (Solidity)

Contract file: `contracts/CertificateRegistry.sol`

Features:
- addCertificate(certId, pdfHash) only by owner
- verifyCertificate(certId, pdfHash) view
- revokeCertificate(certId) only by owner
- getCertificate(certId) view

---

## 🔌 Frontend Integration (ethers.js + MetaMask)

Service file: `services/blockchain.ts`

Key methods:
- `addBlock(entry)` = writes certId/pdfHash to chain
- `revokeCertificate(certId)` = calls on-chain revoke
- `getCertificateStatus(certId, pdfHash)` = on-chain verification result
- `hashFile(file)` = SHA-256 of PDF content

## 📱 UI changes

- `pages/AdminDashboard.tsx`:
  - credential issue writes transaction to chain
  - revoke button disabled for revoked certs
  - QR code includes verification URL

- `pages/StudentDashboard.tsx`:
  - shows certificate status from smart contract
  - QR code for public verification link

- `pages/PublicVerify.tsx`:
  - verifies against chain status using contract

---

## 🧪 Test workflow

1. Issue certificate in Admin Dashboard.
2. Confirm transaction in MetaMask.
3. Verify status in Student Dashboard.
4. Use Public Verify page or QR code to check.
5. Revoke in Admin Dashboard and confirm status updates to `REVOKED`.

---

## 📌 Features
- Blockchain-based certificate validation
- Tamper detection using hash comparison
- Secure verification system
- Admin & Student dashboards

---

## 🛠 Tech Stack
- React + TypeScript
- Vite
- Blockchain logic
- Node ecosystem

---

## 📄 Project Purpose
Designed to prevent fake certificates and enable instant verification for institutions and employers.
