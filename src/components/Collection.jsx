import { useState, useEffect } from "react";
import * as Chakra from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { alchemy, CONTRACT_ADDRESS } from "../config/alchemy";
import { useENS } from "../context/ENSContext";
import NFTCard from "./NFTCard";
import NFTCardSkeleton from "./NFTCardSkeleton";
import { useNFTData } from "../hooks/useNFTData";
import AnimatedNumber from "./AnimatedNumber";
import ErrorRetry from "./ErrorRetry";
import { LoadingProgress } from "./LoadingProgress";
import { getPolygonScanUrl } from "../utils/constants";
import { motion } from 'framer-motion';

const MotionBox = motion(Chakra.Box);

const Collection = () => {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [selectedNft, setSelectedNft] = useState(null);
  const [selectedNftOwners, setSelectedNftOwners] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [ensLoadingComplete, setEnsLoadingComplete] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const { isOpen, onOpen, onClose } = Chakra.useDisclosure();
  const { lookupENS, getCachedENS, isInCache } = useENS();
  const { loading, error, fetchNFTData } = useNFTData();
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchNFTs();
  }, []);

  useEffect(() => {
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchMetadataFromUri = async (uri) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (err) {
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
          withTokenBalances: true,
        }),
      ]);

      setTotalCount(nftResponse.nfts.length);
      setLoadedCount(0);

      const ownerCountMap = new Map();
      ownersResponse.owners.forEach((owner) => {
        owner.tokenBalances.forEach((token) => {
          const currentCount = ownerCountMap.get(token.tokenId) || 0;
          ownerCountMap.set(token.tokenId, currentCount + 1);
        });
      });

      const processedNfts = nftResponse.nfts
        .map((nft, index) => {
          setLoadedCount(index + 1);

          const attributes = nft.raw?.metadata?.attributes || [];
          const date =
            attributes.find((attr) => attr.trait_type === "Date")?.value ||
            "Unknown Date";
          const topic =
            attributes.find((attr) => attr.trait_type === "Topic")?.value ||
            "Unknown Topic";

          return {
            tokenId: nft.tokenId,
            image:
              nft.image?.thumbnailUrl ||
              nft.image?.cachedUrl ||
              nft.image?.originalUrl ||
              null,
            title: nft.title || `Token #${nft.tokenId}`,
            ownerCount: ownerCountMap.get(nft.tokenId) || 0,
            date,
            topic,
          };
        })
        .sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));

      return processedNfts;
    });

    if (result) {
      setNfts(result);
      setFilteredNfts(result);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    const filtered = nfts.filter(
      (nft) =>
        nft.title.toLowerCase().includes(value.toLowerCase()) ||
        nft.tokenId.includes(value)
    );
    setFilteredNfts(filtered);
  };

  const handleOwnersClick = async (nft) => {
    setSelectedNft(nft);
    setIsModalLoading(true);
    setEnsLoadingComplete(false);
    onOpen();

    try {
      const response = await alchemy.nft.getOwnersForContract(
        CONTRACT_ADDRESS,
        {
          withTokenBalances: true,
        }
      );

      const tokenOwners = response.owners
        .filter((owner) =>
          owner.tokenBalances.some((token) => token.tokenId === nft.tokenId)
        )
        .map((owner) => ({
          address: owner.ownerAddress,
          balance: owner.tokenBalances.find(
            (token) => token.tokenId === nft.tokenId
          ).balance,
          ensName: getCachedENS(owner.ownerAddress),
        }));

      setSelectedNftOwners(tokenOwners);
      setIsModalLoading(false);

      const uncachedOwners = tokenOwners.filter(
        (owner) => !isInCache(owner.address)
      );

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

        setSelectedNftOwners((prevOwners) => {
          const newOwners = [...prevOwners];
          resolvedBatch.forEach(({ address, ensName }) => {
            const index = newOwners.findIndex((o) => o.address === address);
            if (index !== -1) {
              newOwners[index] = { ...newOwners[index], ensName };
            }
          });
          return newOwners;
        });

        if (i + batchSize < uncachedOwners.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setEnsLoadingComplete(true);
    } catch (err) {
      setIsModalLoading(false);
      setEnsLoadingComplete(true);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredNfts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNfts = filteredNfts.slice(startIndex, endIndex);

  // Featured NFT (first one) and grid NFTs (next 4)
  const featuredNft = currentNfts[0];
  const gridNfts = currentNfts.slice(1, 5);
  const remainingNfts = currentNfts.slice(5);

  if (loading) {
    return (
      <Chakra.Container py={10}>
        <Chakra.Box mb={8}>
          <Chakra.Heading size="lg" mb={2} variant="glow">
            Collection Explorer
          </Chakra.Heading>
          <Chakra.Text variant="neon">
            Browse all NFTs in the collection
          </Chakra.Text>
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
        <Chakra.Heading size="lg" mb={2} variant="glow">
          Collection Explorer
        </Chakra.Heading>
        <Chakra.Text variant="neon">
          Browse all NFTs in the collection
        </Chakra.Text>
      </Chakra.Box>

      {/* Search Bar */}
      <Chakra.Box mb={8}>
        <Chakra.Input
          placeholder="Search by Token ID or Title..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          size="lg"
          variant="neon"
        />
      </Chakra.Box>

      {/* Featured Section */}
      {featuredNft && (
        <Chakra.Box mb={8}>
          <Chakra.Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Featured NFT */}
            <MotionBox
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              shadow="xl"
              whileHover={{ 
                y: -5,
                boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)"
              }}
              transition={{ duration: 0.3 }}
              bg="whiteAlpha.100"
              backdropFilter="blur(10px)"
              borderColor="whiteAlpha.200"
            >
              <Chakra.AspectRatio ratio={16/9}>
                <Chakra.Box position="relative" width="100%" height="100%">
                  {featuredNft.image ? (
                    <Chakra.Image
                      src={featuredNft.image}
                      alt={featuredNft.title}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                      fallback={<Chakra.Center h="100%">No Image</Chakra.Center>}
                    />
                  ) : (
                    <Chakra.Center bg="gray.100" h="100%">No Image</Chakra.Center>
                  )}
                  
                  {/* Metadata overlay */}
                  <Chakra.Box
                    position="absolute"
                    top={4}
                    left={4}
                    right={4}
                    bg="rgba(0, 0, 0, 0.7)"
                    color="white"
                    p={3}
                    borderRadius="md"
                    backdropFilter="blur(10px)"
                  >
                    <Chakra.Flex justify="space-between" align="center">
                      <Chakra.Text fontSize="sm" fontWeight="bold">
                        {featuredNft.date}
                      </Chakra.Text>
                      <Chakra.Text fontSize="sm" fontWeight="bold">
                        {featuredNft.topic}
                      </Chakra.Text>
                    </Chakra.Flex>
                  </Chakra.Box>
                </Chakra.Box>
              </Chakra.AspectRatio>
              
              <Chakra.Box p={6}>
                <Chakra.Heading size="lg" mb={3} noOfLines={2} variant="glow">
                  {featuredNft.title}
                </Chakra.Heading>
                <Chakra.Flex justify="space-between" align="center">
                  <Chakra.Text 
                    fontSize="sm"
                    variant="neon"
                  >
                    <Chakra.Text as="span" fontWeight="bold">
                      ID:
                    </Chakra.Text>{' '}
                    {featuredNft.tokenId}
                  </Chakra.Text>
                  <Chakra.Button
                    size="md"
                    variant="glow"
                    onClick={() => handleOwnersClick(featuredNft)}
                  >
                    {featuredNft.ownerCount} Owners
                  </Chakra.Button>
                </Chakra.Flex>
              </Chakra.Box>
            </MotionBox>

            {/* Grid of 4 NFTs */}
            <Chakra.Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {gridNfts.map((nft) => (
                <MotionBox
                  key={nft.tokenId}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  shadow="md"
                  whileHover={{ 
                    y: -3,
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ duration: 0.2 }}
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  borderColor="whiteAlpha.200"
                >
                  <Chakra.AspectRatio ratio={1}>
                    <Chakra.Box position="relative" width="100%" height="100%">
                      {nft.image ? (
                        <Chakra.Image
                          src={nft.image}
                          alt={nft.title}
                          objectFit="cover"
                          width="100%"
                          height="100%"
                          fallback={<Chakra.Center h="100%">No Image</Chakra.Center>}
                        />
                      ) : (
                        <Chakra.Center bg="gray.100" h="100%">No Image</Chakra.Center>
                      )}
                      
                      {/* Metadata overlay */}
                      <Chakra.Box
                        position="absolute"
                        top={2}
                        left={2}
                        right={2}
                        bg="rgba(0, 0, 0, 0.7)"
                        color="white"
                        p={2}
                        borderRadius="sm"
                        backdropFilter="blur(10px)"
                      >
                        <Chakra.Flex justify="space-between" align="center">
                          <Chakra.Text fontSize="xs" fontWeight="bold">
                            {nft.date}
                          </Chakra.Text>
                          <Chakra.Text fontSize="xs" fontWeight="bold">
                            {nft.topic}
                          </Chakra.Text>
                        </Chakra.Flex>
                      </Chakra.Box>
                    </Chakra.Box>
                  </Chakra.AspectRatio>
                  
                  <Chakra.Box p={3}>
                    <Chakra.Heading size="sm" mb={2} noOfLines={1} variant="glow">
                      {nft.title}
                    </Chakra.Heading>
                    <Chakra.Flex justify="space-between" align="center">
                      <Chakra.Text 
                        fontSize="xs"
                        variant="neon"
                      >
                        ID: {nft.tokenId}
                      </Chakra.Text>
                      <Chakra.Button
                        size="xs"
                        variant="glow"
                        onClick={() => handleOwnersClick(nft)}
                      >
                        {nft.ownerCount}
                      </Chakra.Button>
                    </Chakra.Flex>
                  </Chakra.Box>
                </MotionBox>
              ))}
            </Chakra.Grid>
          </Chakra.Grid>
        </Chakra.Box>
      )}

      {/* Remaining NFTs Grid */}
      {remainingNfts.length > 0 && (
        <Chakra.Box mb={8}>
          <Chakra.Heading size="md" mb={4} variant="glow">
            More NFTs
          </Chakra.Heading>
          <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {remainingNfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onClick={handleOwnersClick}
                showOwners={true}
              />
            ))}
          </Chakra.SimpleGrid>
        </Chakra.Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Chakra.Box display="flex" justifyContent="center" mt={8}>
          <Chakra.ButtonGroup spacing={2}>
            <Chakra.Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              variant="neon"
            >
              Previous
            </Chakra.Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Chakra.Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "glow" : "neon"}
                >
                  {page}
                </Chakra.Button>
              );
            })}
            
            <Chakra.Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              isDisabled={currentPage === totalPages}
              variant="neon"
            >
              Next
            </Chakra.Button>
          </Chakra.ButtonGroup>
        </Chakra.Box>
      )}

      {/* Modal for NFT Owners */}
      <Chakra.Modal isOpen={isOpen} onClose={onClose} size="xl">
        <Chakra.ModalOverlay />
        <Chakra.ModalContent maxW={{ base: "90vw", md: "800px" }}>
          <Chakra.ModalHeader>
            <Chakra.Text noOfLines={1} variant="glow">
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
                      <Chakra.Th width="10%" isNumeric>
                        Balance
                      </Chakra.Th>
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
                              color="brand.accent"
                              _hover={{ textDecoration: "underline" }}
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
                              color="brand.accent"
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
            <Chakra.Button variant="neon" onClick={onClose}>Close</Chakra.Button>
          </Chakra.ModalFooter>
        </Chakra.ModalContent>
      </Chakra.Modal>
    </Chakra.Container>
  );
};

export default Collection;
