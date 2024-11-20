import * as Chakra from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Chakra.Container maxW="container.lg" py={10}>
      <Chakra.VStack spacing={8} align="center">
        <Chakra.Heading size="2xl" textAlign="center">
          Alchemy University Community Call NFT
        </Chakra.Heading>
        <Chakra.Text fontSize="xl" textAlign="center" color="gray.600">
          Explore ERC-1155 NFT collections and their holders
        </Chakra.Text>
        
        <Chakra.HStack spacing={4} wrap="wrap" justify="center">
          <Chakra.Button 
            colorScheme="purple" 
            size="lg"
            onClick={() => navigate('/collection')}
          >
            View Collection
          </Chakra.Button>
          <Chakra.Button 
            colorScheme="purple" 
            size="lg"
            onClick={() => navigate('/leaderboard')}
          >
            View Leaderboard
          </Chakra.Button>
          <Chakra.Button 
            colorScheme="purple" 
            size="lg"
            onClick={() => navigate('/wallet')}
          >
            Wallet Explorer
          </Chakra.Button>
        </Chakra.HStack>
      </Chakra.VStack>
    </Chakra.Container>
  );
};

export default Welcome; 