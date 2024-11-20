import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: process.env.NETWORK,
};

const mainnetSettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(settings);
export const mainnetAlchemy = new Alchemy(mainnetSettings);
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 