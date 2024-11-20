import * as Chakra from '@chakra-ui/react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Chakra.Box 
        bg={colorMode === 'dark' ? 'purple.900' : 'purple.500'} 
        px={4} 
        position="sticky" 
        top={0} 
        zIndex={1}
        borderBottom="1px"
        borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'purple.600'}
      >
        <Chakra.Flex h={16} alignItems="center" justifyContent="space-between">
          <Chakra.Box 
            cursor="pointer" 
            onClick={() => navigate('/')}
            color="white"
            fontWeight="bold"
            fontSize="xl"
          >
            AU Community Call NFT
          </Chakra.Box>

          <Chakra.HStack spacing={4}>
            <Chakra.Button
              variant={location.pathname === '/collection' ? 'solid' : 'ghost'}
              onClick={() => navigate('/collection')}
              colorScheme="whiteAlpha"
              color="white"
              _hover={{
                bg: colorMode === 'dark' ? 'whiteAlpha.300' : 'whiteAlpha.500'
              }}
            >
              Collection
            </Chakra.Button>
            <Chakra.Button
              variant={location.pathname === '/leaderboard' ? 'solid' : 'ghost'}
              onClick={() => navigate('/leaderboard')}
              colorScheme="whiteAlpha"
              color="white"
              _hover={{
                bg: colorMode === 'dark' ? 'whiteAlpha.300' : 'whiteAlpha.500'
              }}
            >
              Leaderboard
            </Chakra.Button>
            <Chakra.Button
              variant={location.pathname === '/wallet' ? 'solid' : 'ghost'}
              onClick={() => navigate('/wallet')}
              colorScheme="whiteAlpha"
              color="white"
              _hover={{
                bg: colorMode === 'dark' ? 'whiteAlpha.300' : 'whiteAlpha.500'
              }}
            >
              Wallet Explorer
            </Chakra.Button>
            <Chakra.IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="whiteAlpha"
              color="white"
              _hover={{
                bg: colorMode === 'dark' ? 'whiteAlpha.300' : 'whiteAlpha.500'
              }}
              aria-label="Toggle color mode"
            />
          </Chakra.HStack>
        </Chakra.Flex>
      </Chakra.Box>
      <Chakra.Box 
        bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
        minH="calc(100vh - 64px)"
      >
        <Outlet />
      </Chakra.Box>
    </>
  );
};

export default Navbar; 