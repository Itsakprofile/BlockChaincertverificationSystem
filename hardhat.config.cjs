require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.20',
  networks: {
    ganache: {
      url: process.env.GANACHE_URL || 'http://127.0.0.1:7545',
      chainId: 1337,
      gas: 9500000,
      timeout: 200000
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './node_modules/.cache/hardhat',
    artifacts: './artifacts'
  }
};
