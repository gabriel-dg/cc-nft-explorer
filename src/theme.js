import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'white' : '#0e0b27',
        color: props.colorMode === 'light' ? 'brand.dark' : 'white',
        minH: '100vh',
      },
    }),
  },
  colors: {
    brand: {
      primary: '#6366f1', // Purple glow
      secondary: '#8b5cf6', // Lighter purple
      accent: '#9CA3AF', // Muted gray accent
      dark: '#0e0b27', // Dark purple background
      darker: '#16213e', // Darker purple
      darkest: '#0f3460', // Darkest purple
      button: '#1a1738', // Button color
    },
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
        variant: 'solid',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'light' ? 'white' : 'brand.dark',
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          _hover: {
            bg: props.colorMode === 'light' ? 'gray.100' : '#15123a',
          },
          _active: {
            bg: props.colorMode === 'light' ? 'gray.200' : '#120f33',
          },
        }),
        neon: (props) => ({
          bg: props.colorMode === 'light' ? 'white' : 'brand.dark',
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          border: 'none',
          _hover: {
            bg: props.colorMode === 'light' ? 'gray.100' : '#15123a',
          },
          _active: {
            bg: props.colorMode === 'light' ? 'gray.200' : '#120f33',
          },
        }),
        glow: (props) => ({
          bg: props.colorMode === 'light' ? 'white' : 'brand.dark',
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          border: 'none',
          _hover: {
            bg: props.colorMode === 'light' ? 'gray.100' : '#15123a',
          },
          _active: {
            bg: props.colorMode === 'light' ? 'gray.200' : '#120f33',
          },
        }),
      },
    },
    Heading: {
      variants: {
        neon: (props) => ({
          color: 'brand.accent',
          fontWeight: 'bold',
        }),
        glow: (props) => ({
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          fontWeight: 'bold',
        }),
      },
    },
    Text: {
      variants: {
        neon: {
          color: 'brand.accent',
        },
        glow: {
          color: 'white',
        },
      },
    },
    Table: {
      variants: {
        simple: (props) => ({
          th: {
            borderColor: props.colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200',
            color: props.colorMode === 'light' ? 'brand.dark' : 'white',
            bg: props.colorMode === 'light' ? 'gray.50' : 'whiteAlpha.100',
          },
          td: {
            borderColor: props.colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200',
            color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'light' ? 'white' : 'whiteAlpha.100',
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          backdropFilter: props.colorMode === 'light' ? 'none' : 'blur(10px)',
          border: '1px solid',
          borderColor: props.colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200',
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'light' ? 'white' : 'brand.dark',
          color: props.colorMode === 'light' ? 'brand.dark' : 'white',
          border: '1px solid',
          borderColor: props.colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200',
        },
      }),
    },
    Input: {
      variants: {
        neon: (props) => ({
          field: {
            bg: props.colorMode === 'light' ? 'white' : 'whiteAlpha.100',
            border: '2px solid',
            borderColor: 'brand.accent',
            color: props.colorMode === 'light' ? 'brand.dark' : 'white',
            _focus: {
              borderColor: 'brand.accent',
              boxShadow: props.colorMode === 'light' ? '0 0 0 2px rgba(0,0,0,0.05)' : '0 0 0 2px rgba(156, 163, 175, 0.35)',
            },
            _placeholder: {
              color: props.colorMode === 'light' ? 'gray.500' : 'whiteAlpha.600',
            },
          },
        }),
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme; 