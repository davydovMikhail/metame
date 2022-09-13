import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

  solidity: {
    compilers: [
      {
        version: "0.8.11" 
      }
    ]
  },
  networks: {
    mainnet: {
      url: "https://rpc.ankr.com/eth",
      accounts: {mnemonic: process.env.MNEMONIC}
    },
    
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: {mnemonic: process.env.MNEMONIC}
    },

  },
  gasReporter: {
    enabled: true
  }
};

export default config;
