import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as Chakra from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { alchemy, CONTRACT_ADDRESS } from '../config/alchemy';
import { useENS } from '../context/ENSContext';
import { useNFTData } from '../hooks/useNFTData';
import { getPolygonScanUrl } from '../utils/constants';
import AnimatedNumber from './AnimatedNumber';

const Leaderboard = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [tokenIds, setTokenIds] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const { lookupENS, getCachedENS, isInCache } = useENS();
  const { loading, error, fetchNFTData } = useNFTData();

  const { isOpen, onOpen, onClose } = Chakra.useDisclosure();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [sortField, setSortField] = useState('count');
  const [sortDirection, setSortDirection] = useState('desc');

  const { colorMode } = useColorMode();
  const location = useLocation();

  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const currentPage = page;

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await alchemy.nft.getOwnersForContract(CONTRACT_ADDRESS, {
        withTokenBalances: true,
        erc1155: true
      });

      const ownersWithBalances = response.owners
        .map(owner => ({
          address: owner.ownerAddress,
          count: owner.tokenBalances.reduce((acc, token) => 
            acc + (parseInt(token.balance) || 0), 0),
          tokenBalances: owner.tokenBalances,
          ensName: getCachedENS(owner.ownerAddress)
        }))
        .sort((a, b) => b.count - a.count);

      setOwners(ownersWithBalances);

      const uncachedOwners = ownersWithBalances.filter(owner => !isInCache(owner.address));
      
      if (uncachedOwners.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < uncachedOwners.length; i += batchSize) {
          const batch = uncachedOwners.slice(i, i + batchSize);
          const ensPromises = batch.map(async (owner) => {
            const ensName = await lookupENS(owner.address);
            return { address: owner.address, ensName };
          });

          const resolvedBatch = await Promise.all(ensPromises);
          
          setOwners(prevOwners => {
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
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  const handleNFTClick = async (owner) => {
    setSelectedOwner(owner);
    setIsModalLoading(true);
    onOpen();

    try {
      const formattedTokens = owner.tokenBalances.map(token => ({
        tokenId: token.tokenId,
        balance: token.balance
      }));

      setTokenIds(formattedTokens);
    } catch (err) {
      console.error('Error fetching token IDs:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const sortedOwners = [...owners].sort((a, b) => {
    const multiplier = sortDirection === 'desc' ? -1 : 1;
    if (sortField === 'count') {
      return multiplier * (a.count - b.count);
    }
    return multiplier * a[sortField].localeCompare(b[sortField]);
  });

  // Optional: support header search (?q=...) to filter by address/ENS without mutating original list
  const [query, setQuery] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery((params.get('q') || '').toLowerCase());
  }, [location.search]);

  if (loading) {
    return (
      <Chakra.Container py={10}>
        <Chakra.VStack spacing={4} align="stretch">
          <Chakra.Box mb={8}>
            <Chakra.Heading size="lg" mb={2}>NFT Leaderboard</Chakra.Heading>
            <Chakra.Text color="gray.600">Top holders of the collection</Chakra.Text>
          </Chakra.Box>
          {[...Array(5)].map((_, i) => (
            <Chakra.Box key={i} p={4} borderWidth="1px" borderRadius="lg">
              <Chakra.HStack justify="space-between">
                <Chakra.Skeleton height="20px" width="40%" />
                <Chakra.Skeleton height="20px" width="20%" />
              </Chakra.HStack>
            </Chakra.Box>
          ))}
        </Chakra.VStack>
      </Chakra.Container>
    );
  }

  if (error) {
    return (
      <Chakra.Container centerContent py={10}>
        <Chakra.Alert status="error" borderRadius="md">
          <Chakra.AlertIcon />
          <Chakra.AlertTitle>Error loading leaderboard</Chakra.AlertTitle>
          <Chakra.AlertDescription>{error}</Chakra.AlertDescription>
        </Chakra.Alert>
      </Chakra.Container>
    );
  }

  return (
    <Chakra.Container py={10}>
      <Chakra.Box mb={8}>
        <Chakra.Heading size="lg" mb={2} variant="glow">NFT Leaderboard</Chakra.Heading>
        <Chakra.Text variant="neon">
          Top holders of the collection
        </Chakra.Text>
      </Chakra.Box>
      
      <Chakra.TableContainer
        bg="whiteAlpha.100"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="lg"
        backdropFilter="blur(10px)"
      >
        <Chakra.Table variant="simple" bg="transparent">
          <Chakra.Thead>
            <Chakra.Tr>
              <Chakra.Th>Position</Chakra.Th>
              <Chakra.Th>Address</Chakra.Th>
              <Chakra.Th>ENS Name</Chakra.Th>
              <Chakra.Th 
                cursor="pointer" 
                onClick={() => {
                  if (sortField === 'count') {
                    setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortField('count');
                    setSortDirection('desc');
                  }
                }}
              >
                NFTs {sortField === 'count' && (sortDirection === 'desc' ? '▼' : '▲')}
              </Chakra.Th>
            </Chakra.Tr>
          </Chakra.Thead>
           <Chakra.Tbody>
            {sortedOwners
              .filter(o => !query || o.address.toLowerCase().includes(query) || (o.ensName || '').toLowerCase().includes(query))
              .slice((page - 1) * itemsPerPage, page * itemsPerPage)
              .map((owner, index) => (
              <Chakra.Tr key={owner.address}>
                <Chakra.Td>{((page - 1) * itemsPerPage) + index + 1}</Chakra.Td>
                <Chakra.Td fontFamily="mono" fontSize="sm">
                  <Chakra.Tooltip label="Click to view on Polygonscan">
                    <Chakra.Link
                      href={getPolygonScanUrl(owner.address)}
                      isExternal
                      color="brand.accent"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {owner.address}
                    </Chakra.Link>
                  </Chakra.Tooltip>
                </Chakra.Td>
                <Chakra.Td color={owner.ensName ? 'brand.accent' : 'gray.400'}>
                  {owner.ensName || '-'}
                </Chakra.Td>
                <Chakra.Td 
                  isNumeric
                  cursor="pointer"
                  color="brand.accent"
                  _hover={{ color: 'gray.300', textDecoration: 'underline' }}
                  onClick={() => handleNFTClick(owner)}
                >
                  <AnimatedNumber value={owner.count} />
                </Chakra.Td>
              </Chakra.Tr>
            ))}
          </Chakra.Tbody>
        </Chakra.Table>
      </Chakra.TableContainer>

      <Chakra.Box mt={4}>
        <Chakra.HStack spacing={4} justify="center">
          <Chakra.ButtonGroup>
            <Chakra.Button
              variant="neon"
              onClick={() => setPage(1)}
              isDisabled={page === 1}
            >
              {"<<"}
            </Chakra.Button>
            <Chakra.Button
              variant="neon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              {"<"}
            </Chakra.Button>
            <Chakra.Button
              variant="glow"
              _hover={{ cursor: 'default' }}
              _active={{ bg: 'brand.button' }}
            >
             {currentPage} / {totalPages}
            </Chakra.Button>
            <Chakra.Button
              variant="neon"
              onClick={() => setPage(p => p + 1)}
              isDisabled={page >= totalPages}
            >
              {">"}
            </Chakra.Button>
            <Chakra.Button
              variant="neon"
              onClick={() => setPage(totalPages)}
              isDisabled={page >= totalPages}
            >
              {">>"}
            </Chakra.Button>
          </Chakra.ButtonGroup>

          <Chakra.Select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              setPage(Math.floor(((page - 1) * itemsPerPage) / newItemsPerPage) + 1);
            }}
            width="140px"
            bg="whiteAlpha.100"
            border="2px solid"
            borderColor="brand.accent"
            color="white"
            _focus={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(156, 163, 175, 0.35)' }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </Chakra.Select>
        </Chakra.HStack>

        <Chakra.Text 
          textAlign="center" 
          mt={2} 
          fontSize="sm"
          color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
        >
          Showing {Math.min((page - 1) * itemsPerPage + 1, owners.length)} - {Math.min(page * itemsPerPage, owners.length)} of {owners.length} holders
        </Chakra.Text>
      </Chakra.Box>

      <Chakra.Modal isOpen={isOpen} onClose={onClose} size="xl">
        <Chakra.ModalOverlay />
        <Chakra.ModalContent>
          <Chakra.ModalHeader>
            NFTs owned by {selectedOwner?.ensName || selectedOwner?.address}
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
                      <Chakra.Th>Token ID</Chakra.Th>
                      <Chakra.Th isNumeric>Balance</Chakra.Th>
                    </Chakra.Tr>
                  </Chakra.Thead>
                  <Chakra.Tbody>
                    {tokenIds.map((token) => (
                      <Chakra.Tr key={token.tokenId}>
                        <Chakra.Td>{token.tokenId}</Chakra.Td>
                        <Chakra.Td isNumeric>
                          <Chakra.Badge colorScheme="purple">
                            {token.balance}
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
            <Chakra.Button variant="neon" onClick={onClose}>
              Close
            </Chakra.Button>
          </Chakra.ModalFooter>
        </Chakra.ModalContent>
      </Chakra.Modal>
    </Chakra.Container>
  );
};

export default Leaderboard; 


