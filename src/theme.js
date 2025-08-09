import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: '#0e0b27',
        color: 'white',
        minH: '100vh',
      },
    }),
  },
  colors: {
    brand: {
      primary: '#6366f1', // Purple glow
      secondary: '#8b5cf6', // Lighter purple
      accent: '#06b6d4', // Cyan for neon effect
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
        solid: {
          bg: 'brand.button',
          color: 'white',
          _hover: {
            bg: 'rgba(26, 23, 56, 0.9)',
          },
          _active: {
            bg: 'rgba(26, 23, 56, 0.85)',
          },
        },
        neon: {
          bg: 'brand.button',
          color: 'white',
          border: 'none',
          _hover: {
            bg: 'rgba(26, 23, 56, 0.9)',
          },
          _active: {
            bg: 'rgba(26, 23, 56, 0.85)',
          },
        },
        glow: {
          bg: 'brand.button',
          color: 'white',
          border: 'none',
          _hover: {
            bg: 'rgba(26, 23, 56, 0.9)',
          },
          _active: {
            bg: 'rgba(26, 23, 56, 0.85)',
          },
        },
      },
    },
    Heading: {
      variants: {
        neon: {
          color: 'brand.accent',
          textShadow: '0 0 10px rgba(6, 182, 212, 0.8)',
          fontWeight: 'bold',
        },
        glow: {
          color: 'white',
          textShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
          fontWeight: 'bold',
        },
      },
    },
    Text: {
      variants: {
        neon: {
          color: 'brand.accent',
          textShadow: '0 0 5px rgba(6, 182, 212, 0.6)',
        },
        glow: {
          color: 'white',
          textShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
        },
      },
    },
    Table: {
      variants: {
        simple: (props) => ({
          th: {
            borderColor: 'whiteAlpha.200',
            color: 'white',
            bg: 'whiteAlpha.100',
          },
          td: {
            borderColor: 'whiteAlpha.200',
            color: 'white',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: 'whiteAlpha.100',
          color: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: 'brand.dark',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
        },
      }),
    },
    Input: {
      variants: {
        neon: {
          field: {
            bg: 'whiteAlpha.100',
            border: '2px solid',
            borderColor: 'brand.accent',
            color: 'white',
            _focus: {
              borderColor: 'brand.accent',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
            },
            _placeholder: {
              color: 'whiteAlpha.600',
            },
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme; 