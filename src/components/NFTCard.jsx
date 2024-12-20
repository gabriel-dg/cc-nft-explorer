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
        </Chakra.Box>
      </Chakra.AspectRatio>

      <Chakra.Box 
        p={4}
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        color={colorMode === 'dark' ? 'white' : 'gray.800'}
      >
        <Chakra.Heading size="md" mb={2} noOfLines={1}>
          {nft.title}
        </Chakra.Heading>
        <Chakra.Flex justify="space-between" mb={2}>
          <Chakra.Text 
            fontSize="sm"
            color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
            flex="1"
          >
            <Chakra.Text as="span" fontWeight="bold" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
              Date:
            </Chakra.Text>{' '}
            {nft.date}
          </Chakra.Text>
          <Chakra.Text 
            fontSize="sm"
            color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
            flex="1"
            textAlign="right"
          >
            <Chakra.Text as="span" fontWeight="bold" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
              Topic:
            </Chakra.Text>{' '}
            {nft.topic}
          </Chakra.Text>
        </Chakra.Flex>
        <Chakra.Flex justify="space-between" align="center">
          <Chakra.Text 
            fontSize="xs"
            color={colorMode === 'dark' ? 'gray.500' : 'gray.400'}
          >
            <Chakra.Text as="span" fontWeight="bold">
              ID:
            </Chakra.Text>{' '}
            {nft.tokenId}
          </Chakra.Text>
          {showOwners ? (
            <Chakra.Button
              size="sm"
              colorScheme="purple"
              onClick={() => onClick?.(nft)}
            >
              {nft.ownerCount} Owners
            </Chakra.Button>
          ) : (
            <Chakra.Badge colorScheme="purple">
              Balance: {nft.balance}
            </Chakra.Badge>
          )}
        </Chakra.Flex>
      </Chakra.Box>
    </MotionBox>
  );
};

export default NFTCard; 