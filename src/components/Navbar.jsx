import * as Chakra from "@chakra-ui/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useColorMode, useBreakpointValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const brandTitle = useBreakpointValue({ base: 'Alchemy C.C.', md: 'Alchemy Community Call NFT' });

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const navItems = [
    { path: "/collection", label: "Collection" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/wallet", label: "Wallet Explorer" },
  ];

  const handleSearchSubmit = () => {
    const text = searchText.trim();
    const basePath = location.pathname || "/collection";
    const url = text ? `${basePath}?q=${encodeURIComponent(text)}` : basePath;
    navigate(url);
    setIsOpen(false);
  };

  const searchPlaceholder = () => {
    if (location.pathname.startsWith("/wallet")) return "Address (0x...) or ENS name";
    if (location.pathname.startsWith("/leaderboard")) return "Filter by address or ENS";
    return "Search by Token ID or Title...";
  };

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
          >
            {brandTitle}
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
            <Chakra.HStack spacing={2}>
              <Chakra.Input
                size="sm"
                placeholder={searchPlaceholder()}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                variant="neon"
                width="280px"
              />
              <Chakra.Button size="sm" onClick={handleSearchSubmit}>Search</Chakra.Button>
            </Chakra.HStack>
            <Chakra.IconButton
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="solid"
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
          <Chakra.VStack minH="100vh" spacing={6} align="stretch" justify="flex-start" pt={24} pb={12} px={4}>
            <Chakra.HStack>
              <Chakra.Input
                placeholder={searchPlaceholder()}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                variant="neon"
                size="md"
              />
              <Chakra.Button size="md" onClick={handleSearchSubmit}>Search</Chakra.Button>
            </Chakra.HStack>
            {navItems.map((item) => (
              <Chakra.Button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                size="lg"
                variant="solid"
              >
                {item.label}
              </Chakra.Button>
            ))}
            <Chakra.Button
              leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              size="lg"
              variant="solid"
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
