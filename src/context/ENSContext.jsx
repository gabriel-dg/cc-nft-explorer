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
      console.log(`Using cached ENS for ${address}:`, ensCache.get(address));
      return ensCache.get(address);
    }

    try {
      console.log(`Fetching ENS for ${address}`);
      const ensName = await mainnetAlchemy.core.lookupAddress(address);
      // Update cache with the new ENS name (even if it's null)
      setENSCache(prev => {
        const newCache = new Map(prev);
        newCache.set(address, ensName);
        return newCache;
      });
      return ensName;
    } catch (err) {
      console.warn(`Error fetching ENS for ${address}:`, err);
      // Cache the error result as null to avoid retrying
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