import * as Chakra from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { getOpenSeaUrl } from '../utils/constants';
import { CONTRACT_ADDRESS } from '../config/alchemy';

const MotionBox = motion(Chakra.Box);

const NFTCard = ({ nft, onClick, showOwners = false }) => {
  const { colorMode } = useColorMode();

  return (
    <MotionBox
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      shadow="base"
      whileHover={{ 
        y: -5,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.2 }}
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      borderColor="whiteAlpha.200"
      w="full"
    >
      <Chakra.AspectRatio ratio={1}>
        <Chakra.Box position="relative" width="100%" height="100%">
          <Chakra.Link
            href={getOpenSeaUrl(CONTRACT_ADDRESS, nft.tokenId)}
            isExternal
            _hover={{ opacity: 0.8 }}
            display="block"
            width="100%"
            height="100%"
          >
            {nft.image ? (
              <Chakra.Image
                src={nft.image}
                alt={nft.title}
                objectFit="cover"
                width="100%"
                height="100%"
                fallback={<Chakra.Center h="100%">No Image</Chakra.Center>}
                loading="lazy"
              />
            ) : (
              <Chakra.Center bg="gray.100" h="100%">No Image</Chakra.Center>
            )}
          </Chakra.Link>
          
          {/* Metadata overlay top (date/topic) */}
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

          {/* Metadata overlay bottom (title, id, owners) */}
          <Chakra.Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="rgba(0,0,0,0.65)"
            color="white"
            px={3}
            py={3}
          >
            <Chakra.Heading size="md" mb={2} noOfLines={1}>
              {nft.title}
            </Chakra.Heading>
            <Chakra.Flex justify="space-between" align="center">
              <Chakra.Text fontSize="xs">
                <Chakra.Text as="span" fontWeight="bold">ID:</Chakra.Text>{' '}
                {nft.tokenId}
              </Chakra.Text>
              {showOwners ? (
                <Chakra.Button size="xs" colorScheme="purple" onClick={() => onClick?.(nft)}>
                  {nft.ownerCount} Owners
                </Chakra.Button>
              ) : (
                <Chakra.Badge colorScheme="purple">Balance: {nft.balance}</Chakra.Badge>
              )}
            </Chakra.Flex>
          </Chakra.Box>
        </Chakra.Box>
      </Chakra.AspectRatio>
    </MotionBox>
  );
};

export default NFTCard; 