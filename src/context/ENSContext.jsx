import { createContext, useContext, useState } from 'react';
import { mainnetAlchemy } from '../config/alchemy';

const ENSContext = createContext();

export const useENS = () => {
  const context = useContext(ENSContext);
  if (!context) {
    throw new Error('useENS must be used within an ENSProvider');
  }
  return context;
};

export const ENSProvider = ({ children }) => {
  const [ensCache, setENSCache] = useState(new Map());

  const lookupENS = async (address) => {
    // Check if we already have this address cached
    if (ensCache.has(address)) {
      return ensCache.get(address);
    }

    try {
      const ensName = await mainnetAlchemy.core.lookupAddress(address);
      setENSCache(prev => {
        const newCache = new Map(prev);
        newCache.set(address, ensName);
        return newCache;
      });
      return ensName;
    } catch (err) {
      setENSCache(prev => {
        const newCache = new Map(prev);
        newCache.set(address, null);
        return newCache;
      });
      return null;
    }
  };

  // Helper function to get cached ENS name without fetching
  const getCachedENS = (address) => {
    return ensCache.get(address) || null;
  };

  // Helper function to check if an address is in cache
  const isInCache = (address) => {
    return ensCache.has(address);
  };

  const value = {
    lookupENS,
    getCachedENS,
    isInCache,
    ensCache,
  };

  return (
    <ENSContext.Provider value={value}>
      {children}
    </ENSContext.Provider>
  );
}; 