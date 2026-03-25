const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const CertificateRegistry = await hre.ethers.getContractFactory('CertificateRegistry');
  const registry = await CertificateRegistry.deploy();
  await registry.deployed();

  console.log('CertificateRegistry deployed to:', registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
