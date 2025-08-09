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
        solid: {
          bg: 'brand.dark',
          color: 'white',
          _hover: {
            bg: '#15123a',
          },
          _active: {
            bg: '#120f33',
          },
        },
        neon: {
          bg: 'brand.dark',
          color: 'white',
          border: 'none',
          _hover: {
            bg: '#15123a',
          },
          _active: {
            bg: '#120f33',
          },
        },
        glow: {
          bg: 'brand.dark',
          color: 'white',
          border: 'none',
          _hover: {
            bg: '#15123a',
          },
          _active: {
            bg: '#120f33',
          },
        },
      },
    },
    Heading: {
      variants: {
        neon: {
          color: 'brand.accent',
          fontWeight: 'bold',
        },
        glow: {
          color: 'white',
          fontWeight: 'bold',
        },
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
              boxShadow: '0 0 0 2px rgba(156, 163, 175, 0.35)',
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