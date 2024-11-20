import * as Chakra from '@chakra-ui/react';

export const LoadingProgress = ({ value, total }) => {
  const { colorMode } = Chakra.useColorMode();
  
  return (
    <Chakra.Box>
      <Chakra.Progress 
        value={(value / total) * 100} 
        size="xs" 
        colorScheme="purple" 
      />
      <Chakra.Text 
        fontSize="sm" 
        color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} 
        mt={1}
      >
        Loading {value} of {total}
      </Chakra.Text>
    </Chakra.Box>
  );
}; 