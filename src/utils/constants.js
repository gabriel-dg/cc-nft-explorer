export const getOpenSeaUrl = (contractAddress, tokenId) => 
  `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;

export const getPolygonScanUrl = (address) => 
  `https://polygonscan.com/address/${address}`;