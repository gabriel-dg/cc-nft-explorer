import { ChakraProvider } from '@chakra-ui/react';
import { 
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import Welcome from './components/Welcome';
import Leaderboard from './components/Leaderboard';
import Collection from './components/Collection';
import Navbar from './components/Navbar';
import { ENSProvider } from './context/ENSContext';
import WalletExplorer from './components/WalletExplorer';
import theme from './theme';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Navbar />}>
      <Route index element={<Navigate to="/collection" replace />} />
      <Route path="leaderboard" element={<Leaderboard />} />
      <Route path="collection" element={<Collection />} />
      <Route path="wallet" element={<WalletExplorer />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ENSProvider>
        <RouterProvider router={router} />
      </ENSProvider>
    </ChakraProvider>
  );
}

export default App;
