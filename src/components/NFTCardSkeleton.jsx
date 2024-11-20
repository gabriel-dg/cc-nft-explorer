import * as Chakra from '@chakra-ui/react';

const NFTCardSkeleton = () => (
  <Chakra.Box
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    shadow="md"
  >
    <Chakra.AspectRatio ratio={1}>
      <Chakra.Skeleton height="100%" />
    </Chakra.AspectRatio>
    <Chakra.Box p={4}>
      <Chakra.Skeleton height="24px" width="70%" mb={2} />
      <Chakra.Flex justify="space-between" align="center">
        <Chakra.Skeleton height="20px" width="40%" />
        <Chakra.Skeleton height="24px" width="20%" />
      </Chakra.Flex>
    </Chakra.Box>
  </Chakra.Box>
);

export default NFTCardSkeleton; 