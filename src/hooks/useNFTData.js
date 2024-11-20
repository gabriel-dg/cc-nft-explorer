import { useState, useCallback } from 'react';
import { alchemy } from '../config/alchemy';

export const useNFTData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNFTData = useCallback(async (fetchFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchNFTData,
  };
}; 