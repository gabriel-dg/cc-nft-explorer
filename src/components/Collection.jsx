import { useState, useEffect } from 'react';
import * as Chakra from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { alchemy, CONTRACT_ADDRESS } from '../config/alchemy';
import { useENS } from '../context/ENSContext';
import NFTCard from './NFTCard';
import NFTCardSkeleton from './NFTCardSkeleton';
import { useNFTData } from '../hooks/useNFTData';
import AnimatedNumber from './AnimatedNumber';
import ErrorRetry from './ErrorRetry';
import { LoadingProgress } from './LoadingProgress';
import { getPolygonScanUrl } from '../utils/constants';

const Collection = () => {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [selectedNftOwners, setSelectedNftOwners] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [ensLoadingComplete, setEnsLoadingComplete] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const { isOpen, onOpen, onClose } = Chakra.useDisclosure();
  const { lookupENS, getCachedENS, isInCache } = useENS();
  const { loading, error, fetchNFTData } = useNFTData();
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchMetadataFromUri = async (uri) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (err) {
      console.error('Error fetching metadata from URI:', err);
      return null;
    }
  };

  const fetchNFTs = async () => {
    const result = await fetchNFTData(async () => {
      const [nftResponse, ownersResponse] = await Promise.all([
        alchemy.nft.getNftsForContract(CONTRACT_ADDRESS, {
          pageSize: 100,
          omitMetadata: false,
        }),
        alchemy.nft.getOwnersForContract(CONTRACT_ADDRESS, {
          withTokenBalances: true
        })
      ]);

      setTotalCount(nftResponse.nfts.length);
      setLoadedCount(0);

      const ownerCountMap = new Map();
      ownersResponse.owners.forEach(owner => {
        owner.tokenBalances.forEach(token => {
          const currentCount = ownerCountMap.get(token.tokenId) || 0;
          ownerCountMap.set(token.tokenId, currentCount + 1);
        });
      });

      // Process NFTs sequentially to avoid rate limiting
      const processedNfts = nftResponse.nfts.map((nft, index) => {
        setLoadedCount(index + 1);
        
        // Extract date and topic from attributes array
        const attributes = nft.raw?.metadata?.attributes || [];
        const date = attributes.find(attr => attr.trait_type === 'Date')?.value || 'Unknown Date';
        const topic = attributes.find(attr => attr.trait_type === 'Topic')?.value || 'Unknown Topic';

        return {
          tokenId: nft.tokenId,
          image: nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl || null,
          title: nft.title || `Token #${nft.tokenId}`,
          ownerCount: ownerCountMap.get(nft.tokenId) || 0,
          date,
          topic
        };
      }).sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

      return processedNfts;
    });

    if (result) {
      setNfts(result);
      setFilteredNfts(result);
    }
  };

  const handleOwnersClick = async (nft) => {
    setSelectedNft(nft);
    setIsModalLoading(true);
    setEnsLoadingComplete(false);
    onOpen();

    try {
      const response = await alchemy.nft.getOwnersForContract(CONTRACT_ADDRESS, {
        withTokenBalances: true
      });

      const tokenOwners = response.owners
        .filter(owner => owner.tokenBalances.some(token => token.tokenId === nft.tokenId))
        .map(owner => ({
          address: owner.ownerAddress,
          balance: owner.tokenBalances.find(token => token.tokenId === nft.tokenId).balance,
          ensName: getCachedENS(owner.ownerAddress)
        }));

      setSelectedNftOwners(tokenOwners);
      setIsModalLoading(false);

      const uncachedOwners = tokenOwners.filter(owner => !isInCache(owner.address));
      
      if (uncachedOwners.length === 0) {
        setEnsLoadingComplete(true);
        return;
      }

      const batchSize = 5;
      for (let i = 0; i < uncachedOwners.length; i += batchSize) {
        const batch = uncachedOwners.slice(i, i + batchSize);
        const ensPromises = batch.map(async (owner) => {
          const ensName = await lookupENS(owner.address);
          return { address: owner.address, ensName };
        });

        const resolvedBatch = await Promise.all(ensPromises);
        
        setSelectedNftOwners(prevOwners => {
          const newOwners = [...prevOwners];
          resolvedBatch.forEach(({ address, ensName }) => {
            const index = newOwners.findIndex(o => o.address === address);
            if (index !== -1) {
              newOwners[index] = { ...newOwners[index], ensName };
            }
          });
          return newOwners;
        });

        if (i + batchSize < uncachedOwners.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setEnsLoadingComplete(true);
    } catch (err) {
      console.error('Error fetching owners:', err);
      setIsModalLoading(false);
      setEnsLoadingComplete(true);
    }
  };

  if (loading) {
    return (
      <Chakra.Container py={10}>
        <Chakra.Box mb={8}>
          <Chakra.Heading size="lg" mb={2}>Collection Explorer</Chakra.Heading>
          <Chakra.Text color="gray.600">Browse all NFTs in the collection</Chakra.Text>
        </Chakra.Box>
        <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[...Array(6)].map((_, i) => (
            <NFTCardSkeleton key={i} />
          ))}
        </Chakra.SimpleGrid>
        <LoadingProgress value={loadedCount} total={totalCount} />
      </Chakra.Container>
    );
  }

  if (error) {
    return (
      <Chakra.Container centerContent py={10}>
        <ErrorRetry error={error} onRetry={fetchNFTs} />
      </Chakra.Container>
    );
  }

  return (
    <Chakra.Container py={10}>
      <Chakra.Box mb={8}>
        <Chakra.Heading size="lg" mb={2}>Collection Explorer</Chakra.Heading>
        <Chakra.Text 
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
        >
          Browse all NFTs in the collection
        </Chakra.Text>
      </Chakra.Box>

      <Chakra.Box mb={6}>
        <Chakra.Input
          placeholder="Search by Token ID or Title..."
          onChange={(e) => {
            const value = e.target.value.toLowerCase().trim();
            // Always filter from the original nfts array
            const filtered = nfts.filter(nft => 
              nft.title.toLowerCase().includes(value) || 
              nft.tokenId.includes(value)
            );
            setFilteredNfts(filtered);
          }}
          size="lg"
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          _hover={{
            borderColor: colorMode === 'dark' ? 'gray.500' : 'gray.300'
          }}
        />
      </Chakra.Box>

      <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredNfts.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onClick={handleOwnersClick}
            showOwners={true}
          />
        ))}
      </Chakra.SimpleGrid>

      <Chakra.Modal isOpen={isOpen} onClose={onClose} size="xl">
        <Chakra.ModalOverlay />
        <Chakra.ModalContent maxW={{ base: "90vw", md: "800px" }}>
          <Chakra.ModalHeader>
            <Chakra.Text noOfLines={1}>
              Owners of {selectedNft?.title}
            </Chakra.Text>
          </Chakra.ModalHeader>
          <Chakra.ModalCloseButton />
          <Chakra.ModalBody>
            {isModalLoading ? (
              <Chakra.Center py={6}>
                <Chakra.Spinner />
              </Chakra.Center>
            ) : (
              <Chakra.TableContainer>
                <Chakra.Table variant="simple" size="sm">
                  <Chakra.Thead>
                    <Chakra.Tr>
                      <Chakra.Th width="45%">Address</Chakra.Th>
                      <Chakra.Th width="45%">
                        ENS Name
                        {!ensLoadingComplete && (
                          <Chakra.Spinner size="xs" ml={2} />
                        )}
                      </Chakra.Th>
                      <Chakra.Th width="10%" isNumeric>Balance</Chakra.Th>
                    </Chakra.Tr>
                  </Chakra.Thead>
                  <Chakra.Tbody>
                    {selectedNftOwners.map((owner) => (
                      <Chakra.Tr key={owner.address}>
                        <Chakra.Td 
                          fontFamily="mono" 
                          fontSize="sm"
                          maxW="45%"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          <Chakra.Tooltip label="Click to view on Polygonscan">
                            <Chakra.Link
                              href={getPolygonScanUrl(owner.address)}
                              isExternal
                              color="purple.500"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {owner.address}
                            </Chakra.Link>
                          </Chakra.Tooltip>
                        </Chakra.Td>
                        <Chakra.Td maxW="45%">
                          {!ensLoadingComplete && owner.ensName === null ? (
                            <Chakra.Spinner size="xs" />
                          ) : owner.ensName ? (
                            <Chakra.Text 
                              color="purple.500"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                            >
                              {owner.ensName}
                            </Chakra.Text>
                          ) : (
                            <Chakra.Text color="gray.400">-</Chakra.Text>
                          )}
                        </Chakra.Td>
                        <Chakra.Td isNumeric width="10%">
                          <Chakra.Badge colorScheme="purple">
                            {owner.balance}
                          </Chakra.Badge>
                        </Chakra.Td>
                      </Chakra.Tr>
                    ))}
                  </Chakra.Tbody>
                </Chakra.Table>
              </Chakra.TableContainer>
            )}
          </Chakra.ModalBody>
          <Chakra.ModalFooter>
            <Chakra.Button onClick={onClose}>
              Close
            </Chakra.Button>
          </Chakra.ModalFooter>
        </Chakra.ModalContent>
      </Chakra.Modal>
    </Chakra.Container>
  );
};

export default Collection; 