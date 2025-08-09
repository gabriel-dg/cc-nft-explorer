import * as Chakra from "@chakra-ui/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useColorMode, useBreakpointValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon, SearchIcon, CopyIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from 'react-icons/fa';
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const brandTitle = useBreakpointValue({ base: 'Alchemy C.C.', md: 'Alchemy Community Call NFT' });
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [debounceId, setDebounceId] = useState(null);

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

  const handleSearchChange = (value) => {
    setSearchText(value);
    const path = location.pathname || '/collection';
    const isLive = path.startsWith('/collection') || path.startsWith('/leaderboard');
    if (!isLive) return; // Wallet will submit on Enter
    if (debounceId) window.clearTimeout(debounceId);
    const id = window.setTimeout(() => {
      const url = value.trim() ? `${path}?q=${encodeURIComponent(value.trim())}` : path;
      navigate(url, { replace: true });
    }, 500);
    setDebounceId(id);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchText(text);
        handleSearchChange(text);
      }
    } catch (err) {
      // Silently ignore if clipboard not available/denied
    }
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
                variant="solid"
                bg="brand.dark"
                color="white"
                _hover={{ bg: '#15123a' }}
                _active={{ bg: '#120f33' }}
                onClick={() => handleNavClick(item.path)}
                size="sm"
              >
                {item.label}
              </Chakra.Button>
            ))}
            <Chakra.IconButton
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
              size="sm"
              aria-label="Toggle color mode"
            />
          </Chakra.HStack>

          {/* Mobile Controls: 1) Search icon 2) Theme icon 3) Hamburger menu */}
          <Chakra.HStack spacing={2} display={{ base: "flex", md: "none" }}>
            <Chakra.IconButton
              aria-label="Open search"
              icon={<SearchIcon />}
              onClick={() => setIsSearchOpen((v) => !v)}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
              size="sm"
            />
            <Chakra.IconButton
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
              size="sm"
              aria-label="Toggle color mode"
            />
            <Chakra.IconButton
              onClick={() => setIsOpen(!isOpen)}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
              aria-label="Toggle menu"
            />
          </Chakra.HStack>
        </Chakra.Flex>

      </Chakra.Box>
      
      {/* Mobile inline search bar under header */}
      {isSearchOpen && (
        <Chakra.Box display={{ base: 'block', md: 'none' }} bg="#0e0b27" px={4} py={2} borderBottom="1px" borderColor="whiteAlpha.200">
          <Chakra.HStack>
            <Chakra.Input
              autoFocus
              placeholder={searchPlaceholder()}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              variant="neon"
              size="md"
              bg="whiteAlpha.100"
              color="white"
              _placeholder={{ color: 'whiteAlpha.600' }}
              _focus={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(156, 163, 175, 0.35)' }}
            />
            <Chakra.IconButton
              onClick={handleSearchSubmit}
              size="md"
              aria-label="Ejecutar búsqueda"
              icon={<FaPaperPlane />}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
            />
            <Chakra.IconButton
              onClick={handlePasteFromClipboard}
              size="md"
              aria-label="Pegar desde portapapeles"
              icon={<CopyIcon />}
              variant="solid"
              bg="brand.dark"
              color="white"
              _hover={{ bg: '#15123a' }}
              _active={{ bg: '#120f33' }}
            />
          </Chakra.HStack>
        </Chakra.Box>
      )}

      {/* Desktop inline search bar under header */}
      <Chakra.Box display={{ base: 'none', md: 'block' }} bg="#0e0b27" px={4} py={3} borderBottom="1px" borderColor="whiteAlpha.200">
          <Chakra.HStack maxW="container.xl" mx="auto">
          <Chakra.Input
            placeholder={searchPlaceholder()}
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            variant="neon"
            size="md"
            bg="whiteAlpha.100"
            color="white"
            _placeholder={{ color: 'whiteAlpha.600' }}
            _focus={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(156, 163, 175, 0.35)' }}
          />
          <Chakra.IconButton
            onClick={handleSearchSubmit}
            size="md"
            aria-label="Ejecutar búsqueda"
            icon={<FaPaperPlane />}
            variant="solid"
            bg="brand.dark"
            color="white"
            _hover={{ bg: '#15123a' }}
            _active={{ bg: '#120f33' }}
          />
          <Chakra.IconButton
            onClick={handlePasteFromClipboard}
            size="md"
            aria-label="Pegar desde portapapeles"
            icon={<CopyIcon />}
            variant="solid"
            bg="brand.dark"
            color="white"
            _hover={{ bg: '#15123a' }}
            _active={{ bg: '#120f33' }}
          />
        </Chakra.HStack>
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
