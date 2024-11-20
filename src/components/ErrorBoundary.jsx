import React from 'react';
import * as Chakra from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Chakra.Container centerContent py={10}>
          <Chakra.VStack spacing={4}>
            <Chakra.Icon as={Chakra.WarningIcon} w={8} h={8} color="red.500" />
            <Chakra.Text>Something went wrong!</Chakra.Text>
            <Chakra.Button onClick={() => window.location.reload()}>
              Refresh Page
            </Chakra.Button>
          </Chakra.VStack>
        </Chakra.Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 