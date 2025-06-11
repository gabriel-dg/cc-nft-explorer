# Alchemy Community Call NFT Explorer

A React-based web application for exploring ERC-1155 NFT collections on the Polygon network. This project was developed to showcase NFT collection data from the Alchemy Community Call NFT contract.

## Features

- **Collection Explorer**: Browse all NFTs in the collection with their images and owner counts
- **Leaderboard**: View top NFT holders ranked by their total holdings
- **Wallet Explorer**: Search for specific wallet addresses or ENS names to view their NFT holdings
- **ENS Integration**: Automatic resolution of ENS names to addresses and vice versa
- **Dark Mode**: Full dark mode support for better viewing experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- React 18
- Vite
- Chakra UI
- Alchemy SDK
- React Router DOM
- Framer Motion

## Alchemy Methods Used

The project utilizes the following Alchemy SDK methods:

- **NFT Methods**:
  - `alchemy.nft.getNftsForContract()`: Fetches all NFTs for the NFT contract
  - `alchemy.nft.getOwnersForContract()`: Gets all owners of NFTs in the contract with their token balances
  - `alchemy.nft.getNftsForOwner()`: Fetches NFTs owned by a specific wallet address

- **ENS Methods**:
  - `mainnetAlchemy.core.lookupAddress()`: Looks up ENS names for Ethereum addresses
  - `mainnetAlchemy.core.resolveName()`: Resolves ENS names to Ethereum addresses

The application uses two Alchemy instances:
- Main instance configured for the Polygon network to interact with the NFT contract
- Secondary instance configured for Ethereum mainnet for ENS resolution

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- An Alchemy API key (get one at [alchemy.com](https://www.alchemy.com))

## Installation

1. Clone the repository

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```bash
ALCHEMY_API_KEY=your_alchemy_api_key
NETWORK=
CONTRACT_ADDRESS=
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Project Structure
```
src/
├── components/ # React components
├── config/ # Configuration files
├── context/ # React context providers
├── hooks/ # Custom React hooks
├── utils/ # Utility functions
└── theme.js # Chakra UI theme customization
```

## Key Components

- **Collection**: Displays all NFTs in a grid layout with images and owner counts
- **Leaderboard**: Shows top NFT holders with pagination and sorting
- **WalletExplorer**: Allows searching for specific wallet holdings
- **ENSContext**: Provides ENS name resolution with caching

## Environment Variables

- `ALCHEMY_API_KEY`: Your Alchemy API key
- `NETWORK`: The blockchain network
- `CONTRACT_ADDRESS`: The ERC-1155 contract address to explore

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Alchemy University](https://university.alchemy.com) for the inspiration and NFT contract
- [Alchemy SDK](https://docs.alchemy.com/reference/alchemy-sdk-quickstart) for blockchain interaction

