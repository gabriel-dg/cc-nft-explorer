import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { getPolygonScanUrl, getOpenSeaUrl } from "../utils/constants";
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
  const location = useLocation();

  useEffect(() => {
    fetchNFTs();
  }, []);

  useEffect(() => {
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery]);

  // Read search query from URL (?q=...) reactively
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('q') || '';
    const q = raw.trim().toLowerCase();
    setSearchQuery(raw);
    const filtered = nfts.filter((nft) => {
      const title = (nft.title || '').toLowerCase();
      const topic = (nft.topic || '').toLowerCase();
      const tokenIdHex = String(nft.tokenId || '').toLowerCase();
      let tokenIdDec = '';
      try {
        tokenIdDec = String(parseInt(nft.tokenId, 16));
      } catch {}
      return (
        (q && (
          title.includes(q) ||
          topic.includes(q) ||
          tokenIdHex.includes(q) ||
          (tokenIdDec && tokenIdDec.includes(q)) ||
          (`token #${tokenIdDec}`).includes(q) ||
          (`token #${tokenIdHex}`).includes(q)
        ))
      );
    });
    setFilteredNfts(q ? filtered : nfts);
  }, [location.search, nfts]);

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
    const q = value.trim().toLowerCase();
    setSearchQuery(value);
    const filtered = nfts.filter((nft) => {
      const title = (nft.title || '').toLowerCase();
      const topic = (nft.topic || '').toLowerCase();
      const tokenIdHex = String(nft.tokenId || '').toLowerCase();
      let tokenIdDec = '';
      try {
        tokenIdDec = String(parseInt(nft.tokenId, 16));
      } catch {}
      return (
        (q && (
          title.includes(q) ||
          topic.includes(q) ||
          tokenIdHex.includes(q) ||
          (tokenIdDec && tokenIdDec.includes(q)) ||
          (`token #${tokenIdDec}`).includes(q) ||
          (`token #${tokenIdHex}`).includes(q)
        ))
      );
    });
    setFilteredNfts(q ? filtered : nfts);
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

  // Featured NFT (first one) and the rest
  const featuredNft = currentNfts[0];
  const otherNfts = currentNfts.slice(1);

  if (loading) {
    return (
      <Chakra.Container py={10}>
        <Chakra.Box mb={8}>
          <Chakra.Heading size="md" mb={2} variant="glow">
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
        <Chakra.Heading size="md" mb={2} variant="glow">
          Collection Explorer
        </Chakra.Heading>
        <Chakra.Text variant="neon">
          Browse all NFTs in the collection
        </Chakra.Text>
      </Chakra.Box>

      {/* Search moved to header */}

      {/* Featured Section (Image left, Info right on desktop; stacked on mobile) */}
      {featuredNft && (
        <Chakra.Box mb={8}>
          {/* Mobile: stacked */}
          <Chakra.Box display={{ base: "block", lg: "none" }}>
            <Chakra.VStack spacing={4} align="stretch">
              <Chakra.Box
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
              >
                <Chakra.AspectRatio ratio={1}>
                  <Chakra.Box position="relative" width="100%" height="100%">
                    <Chakra.Link
                      href={getOpenSeaUrl(CONTRACT_ADDRESS, featuredNft.tokenId)}
                      isExternal
                      _hover={{ opacity: 0.9 }}
                      display="block"
                      width="100%"
                      height="100%"
                    >
                      {featuredNft.image ? (
                        <Chakra.Image src={featuredNft.image} alt={featuredNft.title} objectFit="cover" w="100%" h="100%" />
                      ) : (
                        <Chakra.Center bg="gray.100" h="100%">No Image</Chakra.Center>
                      )}
                    </Chakra.Link>
                  </Chakra.Box>
                </Chakra.AspectRatio>
              </Chakra.Box>
              <Chakra.Box
                borderWidth="1px"
                borderRadius="xl"
                p={4}
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
              >
                <Chakra.Heading size="md" mb={2} noOfLines={2}>{featuredNft.title}</Chakra.Heading>
                <Chakra.Stack spacing={2}>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">ID:</Chakra.Text> {featuredNft.tokenId}</Chakra.Text>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">Date:</Chakra.Text> {featuredNft.date}</Chakra.Text>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">Topic:</Chakra.Text> {featuredNft.topic}</Chakra.Text>
                  <Chakra.Button size="sm" onClick={() => handleOwnersClick(featuredNft)}>
                    {featuredNft.ownerCount} Owners
                  </Chakra.Button>
                </Chakra.Stack>
              </Chakra.Box>
            </Chakra.VStack>
          </Chakra.Box>

          {/* Desktop: two columns */}
          <Chakra.Box display={{ base: "none", lg: "block" }}>
            <Chakra.Grid templateColumns="1fr 1fr" gap={6}>
              <Chakra.Box
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
              >
                <Chakra.AspectRatio ratio={1}>
                  <Chakra.Box>
                    {featuredNft.image ? (
                      <Chakra.Image src={featuredNft.image} alt={featuredNft.title} objectFit="cover" w="100%" h="100%" />
                    ) : (
                      <Chakra.Center bg="gray.100" h="100%">No Image</Chakra.Center>
                    )}
                  </Chakra.Box>
                </Chakra.AspectRatio>
              </Chakra.Box>
              <Chakra.Box
                borderWidth="1px"
                borderRadius="xl"
                p={6}
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
              >
                <Chakra.Heading size="lg" mb={3} noOfLines={2}>{featuredNft.title}</Chakra.Heading>
                <Chakra.Stack spacing={3}>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">ID:</Chakra.Text> {featuredNft.tokenId}</Chakra.Text>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">Date:</Chakra.Text> {featuredNft.date}</Chakra.Text>
                  <Chakra.Text><Chakra.Text as="span" fontWeight="bold">Topic:</Chakra.Text> {featuredNft.topic}</Chakra.Text>
                  <Chakra.Button size="sm" onClick={() => handleOwnersClick(featuredNft)}>
                    {featuredNft.ownerCount} Owners
                  </Chakra.Button>
                  <Chakra.Button as={Chakra.Link} href={getOpenSeaUrl(CONTRACT_ADDRESS, featuredNft.tokenId)} isExternal size="sm">
                    View on OpenSea
                  </Chakra.Button>
                </Chakra.Stack>
              </Chakra.Box>
            </Chakra.Grid>
          </Chakra.Box>
        </Chakra.Box>
      )}

      {/* Remaining NFTs Grid */}
      {otherNfts.length > 0 && (
        <Chakra.Box mb={8}>
          <Chakra.Heading size="md" mb={4} variant="glow">
            More NFTs
          </Chakra.Heading>
          <Chakra.SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {otherNfts.map((nft) => (
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
              {"<"}
            </Chakra.Button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
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
              {">"}
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
