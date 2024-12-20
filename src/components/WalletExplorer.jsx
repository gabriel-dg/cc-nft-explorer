import { useState } from 'react';
import * as Chakra from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { alchemy, CONTRACT_ADDRESS, mainnetAlchemy } from '../config/alchemy';
import { useENS } from '../context/ENSContext';
import { useNFTData } from '../hooks/useNFTData';
import NFTCard from './NFTCard';
import NFTCardSkeleton from './NFTCardSkeleton';
import { debounce } from '../utils/helpers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getPolygonScanUrl } from '../utils/constants';

const WalletExplorer = () => {
  const { colorMode } = useColorMode();
  const [searchInput, setSearchInput] = useLocalStorage('lastSearch', '');
  const [nfts, setNfts] = useState([]);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [resolvedENS, setResolvedENS] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { lookupENS } = useENS();
  const { loading, error, fetchNFTData } = useNFTData();

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setNfts([]);
    setResolvedAddress(null);
    setResolvedENS(null);
    setHasSearched(true);

    const result = await fetchNFTData(async () => {
      let searchAddress = searchInput;
      let ensName = null;

      if (!searchInput.startsWith('0x')) {
        try {
          const address = await mainnetAlchemy.core.resolveName(searchInput);
          if (address) {
            searchAddress = address;
            setResolvedENS(searchInput);
            setResolvedAddress(address);
          } else {
            throw new Error('ENS name not found');
          }
        } catch (err) {
          console.warn('ENS resolution failed, trying as address:', err);
        }
      } else {
        ensName = await lookupENS(searchAddress);
        if (ensName) {
          setResolvedENS(ensName);
          setResolvedAddress(searchAddress);
        }
      }

      const response = await alchemy.nft.getNftsForOwner(searchAddress, {
        contractAddresses: [CONTRACT_ADDRESS],
        omitMetadata: false,
      });

      return response.ownedNfts.map(nft => {
        const attributes = nft.raw?.metadata?.attributes || [];
        const date = attributes.find(attr => attr.trait_type === 'Date')?.value || 'Unknown Date';
        const topic = attributes.find(attr => attr.trait_type === 'Topic')?.value || 'Unknown Topic';

        return {
          tokenId: nft.tokenId,
          image: nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl || null,
          title: nft.title || `Token #${nft.tokenId}`,
          balance: nft.balance,
          date,
          topic
        };
      }).sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
    });

    if (result) setNfts(result);
  };

  const debouncedSearch = debounce(handleSearch, 500);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalNFTs = nfts.reduce((acc, nft) => acc + parseInt(nft.balance), 0);

  return (
    <Chakra.Container py={10}>
      <Chakra.Box mb={8}>
        <Chakra.Heading size="lg" mb={2}>Wallet Explorer</Chakra.Heading>
        <Chakra.Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} mb={6}>
          Enter an address or ENS name to view their NFTs
        </Chakra.Text>

        <Chakra.HStack spacing={4}>
          <Chakra.Input
            placeholder="Address (0x...) or ENS name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            size="lg"
          />
          <Chakra.Button
            onClick={handleSearch}
            size="lg"
            isLoading={loading}
          >
            Search
          </Chakra.Button>
        </Chakra.HStack>
      </Chakra.Box>

      {error && (
        <Chakra.Alert status="error" mb={6} borderRadius="md">
          <Chakra.AlertIcon />
          <Chakra.AlertTitle>Error</Chakra.AlertTitle>
          <Chakra.AlertDescription>{error}</Chakra.AlertDescription>
        </Chakra.Alert>
      )}

      {(resolvedAddress || resolvedENS || nfts.length > 0) && (
        <Chakra.Box mb={6}>
          <Chakra.VStack 
            align="stretch" 
            spacing={2} 
            p={4} 
            bg={colorMode === 'dark' ? 'purple.900' : 'purple.50'} 
            borderRadius="md"
          >
            <Chakra.HStack>
              <Chakra.Text fontWeight="bold">Address:</Chakra.Text>
              <Chakra.Tooltip label="Click to view on Polygonscan">
                <Chakra.Link
                  href={getPolygonScanUrl(resolvedAddress || searchInput)}
                  isExternal
                  color="purple.500"
                >
                  <Chakra.Code 
                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                  >
                    {resolvedAddress || searchInput}
                  </Chakra.Code>
                </Chakra.Link>
              </Chakra.Tooltip>
            </Chakra.HStack>
            {resolvedENS && (
              <Chakra.HStack>
                <Chakra.Text fontWeight="bold">ENS Name:</Chakra.Text>
                <Chakra.Text color="purple.500">{resolvedENS}</Chakra.Text>
              </Chakra.HStack>
            )}
            {nfts.length > 0 && (
              <Chakra.HStack>
                <Chakra.Text fontWeight="bold">Total NFTs:</Chakra.Text>
                <Chakra.Badge colorScheme="purple" fontSize="md" px={2} py={1}>
                  {totalNFTs}
                </Chakra.Badge>
              </Chakra.HStack>
            )}
          </Chakra.VStack>
        </Chakra.Box>
      )}

      {loading && (
        <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[...Array(3)].map((_, i) => (
            <NFTCardSkeleton key={i} />
          ))}
        </Chakra.SimpleGrid>
      )}

      {nfts.length > 0 && (
        <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              showOwners={false}
            />
          ))}
        </Chakra.SimpleGrid>
      )}

      {!loading && hasSearched && nfts.length === 0 && !error && (
        <Chakra.Alert status="info" borderRadius="md">
          <Chakra.AlertIcon />
          No NFTs found for this address
        </Chakra.Alert>
      )}
    </Chakra.Container>
  );
};

export default WalletExplorer; 