import * as Chakra from "@chakra-ui/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const navItems = [
    { path: "/collection", label: "Collection" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/wallet", label: "Wallet Explorer" },
  ];

  return (
    <>
      <Chakra.Box
        bg="#0e0b27"
        px={4}
        position="sticky"
        top={0}
        zIndex={10}
        borderBottom="1px"
        borderColor="whiteAlpha.200"
        backdropFilter="blur(10px)"
      >
        <Chakra.Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo/Brand */}
          <Chakra.Box
            cursor="pointer"
            onClick={() => navigate("/")}
            color="white"
            fontWeight="bold"
            fontSize={{ base: "lg", md: "xl" }}
            flexShrink={0}
            textShadow="0 0 15px rgba(255, 255, 255, 0.8)"
            _hover={{
              textShadow: "0 0 20px rgba(255, 255, 255, 1)",
            }}
          >
            Alchemy Community Call NFT
          </Chakra.Box>

          {/* Desktop Navigation */}
          <Chakra.HStack 
            spacing={4} 
            display={{ base: "none", md: "flex" }}
            flexShrink={0}
          >
            {navItems.map((item) => (
              <Chakra.Button
                key={item.path}
                variant={location.pathname === item.path ? "glow" : "neon"}
                onClick={() => handleNavClick(item.path)}
                size="sm"
              >
                {item.label}
              </Chakra.Button>
            ))}
            <Chakra.IconButton
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="neon"
              size="sm"
              aria-label="Toggle color mode"
            />
          </Chakra.HStack>

          {/* Mobile Menu Button */}
          <Chakra.IconButton
            display={{ base: "flex", md: "none" }}
            onClick={() => setIsOpen(!isOpen)}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="neon"
            aria-label="Toggle menu"
          />
        </Chakra.Flex>

      </Chakra.Box>
      
      {/* Mobile Fullscreen Overlay Navigation (outside header to avoid stacking context) */}
      {isOpen && (
        <Chakra.Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset={0}
          zIndex={1000}
          bg="#0e0b27"
          overflowY="auto"
        >
          <Chakra.IconButton
            aria-label="Close menu"
            icon={<CloseIcon />}
            onClick={() => setIsOpen(false)}
            position="absolute"
            top={4}
            right={4}
            variant="ghost"
            color="white"
          />
          <Chakra.VStack minH="100vh" spacing={6} align="center" justify="flex-start" pt={24} pb={12}>
            {navItems.map((item) => (
              <Chakra.Button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                size="lg"
                bg="#0e0b27"
                color="white"
                _hover={{ bg: 'rgba(14, 11, 39, 0.9)' }}
                _active={{ bg: 'rgba(14, 11, 39, 0.85)' }}
              >
                {item.label}
              </Chakra.Button>
            ))}
            <Chakra.Button
              leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              size="lg"
              bg="#0e0b27"
              color="white"
              _hover={{ bg: 'rgba(14, 11, 39, 0.9)' }}
              _active={{ bg: 'rgba(14, 11, 39, 0.85)' }}
            >
              {colorMode === "light" ? "Dark Mode" : "Light Mode"}
            </Chakra.Button>
          </Chakra.VStack>
        </Chakra.Box>
      )}

      <Chakra.Box
        bg="transparent"
        minH="calc(100vh - 64px)"
      >
        <Outlet />
      </Chakra.Box>
    </>
  );
};

export default Navbar;
