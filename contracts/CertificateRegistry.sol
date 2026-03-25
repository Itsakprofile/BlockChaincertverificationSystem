// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Certificate Registry (Academic Credential Integrity)
/// @notice Simple mapping of certificate IDs to hashed certificate data with revocation support
contract CertificateRegistry {
    address public owner;

    struct Certificate {
        string pdfHash;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(string => Certificate) private _certificates;

    event CertificateAdded(string indexed certId, string pdfHash, uint256 indexed issuedAt, address indexed issuer);
    event CertificateRevoked(string indexed certId, uint256 indexed revokedAt, address indexed revoker);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Add a certificate hash to the registry
    /// @param certId Unique certificate id such as CERT-XXXXX
    /// @param pdfHash SHA-256 hash of the certificate PDF
    function addCertificate(string calldata certId, string calldata pdfHash) external onlyOwner {
        require(bytes(certId).length > 0, "Certificate ID required");
        require(bytes(pdfHash).length > 0, "PDF hash required");
        require(_certificates[certId].issuedAt == 0, "Certificate already exists");

        _certificates[certId] = Certificate({
            pdfHash: pdfHash,
            issuedAt: block.timestamp,
            revoked: false
        });

        emit CertificateAdded(certId, pdfHash, block.timestamp, msg.sender);
    }

    /// @notice Verify certificate details and whether revoked
    /// @param certId Unique certificate id
    /// @param pdfHash SHA-256 hash to verify against stored hash
    /// @return exists true if certificate exists
    /// @return revoked true if certificate has been revoked
    /// @return hashMatches true if provided hash matches record
    function verifyCertificate(string calldata certId, string calldata pdfHash) external view returns (bool exists, bool revoked, bool hashMatches) {
        Certificate storage cert = _certificates[certId];
        if (cert.issuedAt == 0) {
            return (false, false, false);
        }
        bool hm = (keccak256(bytes(cert.pdfHash)) == keccak256(bytes(pdfHash)));
        return (true, cert.revoked, hm);
    }

    /// @notice Revoke a certificate
    /// @param certId Unique certificate id
    function revokeCertificate(string calldata certId) external onlyOwner {
        Certificate storage cert = _certificates[certId];
        require(cert.issuedAt != 0, "Certificate not found");
        require(!cert.revoked, "Certificate already revoked");

        cert.revoked = true;

        emit CertificateRevoked(certId, block.timestamp, msg.sender);
    }

    /// @notice Fetch certificate raw status from on-chain registry
    /// @param certId Unique certificate id
    /// @return pdfHash stored hash string
    /// @return issuedAt timestamp when certificate was added
    /// @return revoked status
    function getCertificate(string calldata certId) external view returns (string memory pdfHash, uint256 issuedAt, bool revoked) {
        Certificate storage cert = _certificates[certId];
        require(cert.issuedAt != 0, "Certificate not found");
        return (cert.pdfHash, cert.issuedAt, cert.revoked);
    }
}
