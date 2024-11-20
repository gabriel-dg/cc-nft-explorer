import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        px: { base: 4, md: 8 },
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
    },
    Table: {
      variants: {
        simple: (props) => ({
          th: {
            borderColor: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'gray.200',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          },
          td: {
            borderColor: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'gray.200',
            color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        },
      }),
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 