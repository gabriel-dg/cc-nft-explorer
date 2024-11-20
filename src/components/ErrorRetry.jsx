import * as Chakra from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

const ErrorRetry = ({ error, onRetry }) => {
  const { colorMode } = useColorMode();
  return (
    <Chakra.Alert 
      status="error" 
      borderRadius="md"
      bg={colorMode === 'dark' ? 'red.900' : 'red.50'}
    >
      <Chakra.AlertIcon />
      <Chakra.Box flex="1">
        <Chakra.AlertTitle>Error</Chakra.AlertTitle>
        <Chakra.AlertDescription display="block">
          {error}
          <Chakra.Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={onRetry}
            ml={4}
          >
            Retry
          </Chakra.Button>
        </Chakra.AlertDescription>
      </Chakra.Box>
    </Chakra.Alert>
  );
};

export default ErrorRetry; 