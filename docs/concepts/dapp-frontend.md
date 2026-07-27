# 🇺🇸 Sentinel Protocol DApp - Frontend Structure
# 🛡️ American Made by a PROUD AMERICAN ARCHITECT
# 🚀 Web3 Frontend with React & Multi-Modal Communication

## 📁 Project Structure

```
sentinel-protocol-dapp/frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── wallet/
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── WalletInfo.jsx
│   │   │   └── NetworkSelector.jsx
│   │   ├── communication/
│   │   │   ├── TextMessaging.jsx
│   │   │   ├── VoiceCall.jsx
│   │   │   ├── VideoCall.jsx
│   │   │   ├── FileTransfer.jsx
│   │   │   └── MessageList.jsx
│   │   ├── identity/
│   │   │   ├── IdentityBadge.jsx
│   │   │   ├── VerifiedViewer.jsx
│   │   │   ├── NFTGallery.jsx
│   │   │   └── ReputationDisplay.jsx
│   │   ├── governance/
│   │   │   ├── ProposalList.jsx
│   │   │   ├── VoteButton.jsx
│   │   │   ├── AIMayorPanel.jsx
│   │   │   └── GovernanceStats.jsx
│   │   └── data/
│   │       ├── DataOwnership.jsx
│   │       ├── ConsentManager.jsx
│   │       ├── DataPortability.jsx
│   │       └── AccessControl.jsx
│   ├── hooks/
│   │   ├── useWallet.js
│   │   ├── useWeb3.js
│   │   ├── useContract.js
│   │   ├── useP2P.js
│   │   ├── useIdentity.js
│   │   ├── useGovernance.js
│   │   └── useCommunication.js
│   ├── services/
│   │   ├── web3/
│   │   │   ├── walletService.js
│   │   │   ├── contractService.js
│   │   │   └── transactionService.js
│   │   ├── p2p/
│   │   │   ├── p2pService.js
│   │   │   ├── encryptionService.js
│   │   │   ├── routingService.js
│   │   │   └── authService.js
│   │   ├── ipfs/
│   │   │   ├── ipfsService.js
│   │   │   └── storageService.js
│   │   └── api/
│   │       ├── governanceApi.js
│   │       ├── identityApi.js
│   │       └── dataApi.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── encryption.js
│   ├── contexts/
│   │   ├── WalletContext.jsx
│   │   ├── Web3Context.jsx
│   │   ├── IdentityContext.jsx
│   │   ├── P2PContext.jsx
│   │   └── GovernanceContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Messaging.jsx
│   │   ├── VoiceCalls.jsx
│   │   ├── VideoCalls.jsx
│   │   ├── Governance.jsx
│   │   ├── Identity.jsx
│   │   ├── DataManagement.jsx
│   │   └── Settings.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.jsx
│   └── index.css
├── package.json
├── .env.example
├── .env.local
├── .gitignore
├── README.md
└── vite.config.js
```

---

## 📦 package.json Dependencies

```json
{
  "name": "sentinel-protocol-dapp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "ethers": "^6.9.0",
    "wagmi": "^1.4.0",
    "@rainbow-me/rainbowkit": "^1.3.0",
    "@tanstack/react-query": "^5.0.0",
    "viem": "^1.19.0",
    "libp2p": "^0.46.0",
    "ipfs-http-client": "^60.0.0",
    "crypto-js": "^4.2.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "webrtc-adapter": "^8.2.0",
    "simple-peer": "^9.11.0",
    "qrcode.react": "^3.1.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 🔧 Environment Configuration

### .env.example
```env
# Blockchain Configuration
VITE_APP_NAME=Sentinel Protocol DApp
VITE_NETWORK=goerli
VITE_CHAIN_ID=5
VITE_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
VITE_WS_URL=wss://goerli.infura.io/ws/v3/YOUR_INFURA_KEY

# Smart Contract Addresses
VITE_GOVERNANCE_CONTRACT=0x...
VITE_IDENTITY_CONTRACT=0x...
VITE_STORAGE_CONTRACT=0x...

# IPFS Configuration
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs
VITE_PINATA_API_KEY=YOUR_PINATA_KEY
VITE_PINATA_SECRET_KEY=YOUR_PINATA_SECRET

# P2P Configuration
VITE_P2P_BOOTSTRAP_PEERS=/ip4/127.0.0.1/tcp/4001
VITE_P2P_NETWORK_ID=sentinel-mainnet

# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
VITE_ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY
```

---

## 🎨 Styling Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#e94560',
          success: '#0f3460',
          warning: '#f39c12',
          danger: '#e74c3c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

---

## 🚀 Main App Component

### src/App.jsx
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from './contexts/WalletContext';
import { Web3Provider } from './contexts/Web3Context';
import { P2PProvider } from './contexts/P2PContext';
import { IdentityProvider } from './contexts/IdentityContext';
import { GovernanceProvider } from './contexts/GovernanceContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Messaging from './pages/Messaging';
import VoiceCalls from './pages/VoiceCalls';
import VideoCalls from './pages/VideoCalls';
import Governance from './pages/Governance';
import Identity from './pages/Identity';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <WalletProvider>
          <Web3Provider>
            <P2PProvider>
              <IdentityProvider>
                <GovernanceProvider>
                  <BrowserRouter>
                    <div className="min-h-screen bg-sentinel-primary text-white">
                      <Header />
                      <main className="container mx-auto px-4 py-8">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/messaging" element={<Messaging />} />
                          <Route path="/voice-calls" element={<VoiceCalls />} />
                          <Route path="/video-calls" element={<VideoCalls />} />
                          <Route path="/governance" element={<Governance />} />
                          <Route path="/identity" element={<Identity />} />
                          <Route path="/data" element={<DataManagement />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </BrowserRouter>
                </GovernanceProvider>
              </IdentityProvider>
            </P2PProvider>
          </Web3Provider>
        </WalletProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 💼 Wallet Context

### src/contexts/WalletContext.jsx
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect, useSignMessage, useBalance } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { data: balance } = useBalance({ address });

  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setWalletAddress(address);
  }, [address]);

  const connectWallet = async (connector) => {
    try {
      setIsConnecting(true);
      await connect({ connector });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const signMessage = async (message) => {
    try {
      return await signMessageAsync({ message });
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setWalletAddress(null);
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        chain,
        balance,
        connectors,
        isConnecting,
        connectWallet,
        signMessage,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
```

---

## 🌐 P2P Context

### src/contexts/P2PContext.jsx
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SentinelP2PNode, SentinelEncryption, SentinelRouting } from '../services/p2p/p2pService';

const P2PContext = createContext();

export const useP2P = () => {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error('useP2P must be used within P2PProvider');
  }
  return context;
};

export const P2PProvider = ({ children }) => {
  const [p2pNode, setP2PNode] = useState(null);
  const [encryption, setEncryption] = useState(null);
  const [routing, setRouting] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);

  const initializeP2P = async () => {
    try {
      // Initialize P2P node
      const node = new SentinelP2PNode({
        networkId: import.meta.env.VITE_P2P_NETWORK_ID,
        bootstrapPeers: import.meta.env.VITE_P2P_BOOTSTRAP_PEERS.split(',')
      });
      
      await node.initialize();
      await node.start();
      
      setP2PNode(node);
      setIsConnected(true);
      
      // Initialize encryption
      const enc = new SentinelEncryption();
      setEncryption(enc);
      
      // Initialize routing
      const route = new SentinelRouting(node);
      setRouting(route);
      
      console.log('🇺🇸 P2P Network initialized');
    } catch (error) {
      console.error('P2P initialization failed:', error);
    }
  };

  const sendMessage = async (recipient, message, type = 'text') => {
    if (!routing) {
      throw new Error('P2P routing not initialized');
    }

    try {
      const result = await routing.routeTextMessage(
        p2pNode.libp2p.peerId.toString(),
        recipient,
        message
      );
      
      return result;
    } catch (error) {
      console.error('Message send failed:', error);
      throw error;
    }
  };

  const startVoiceCall = async (recipient) => {
    if (!routing) {
      throw new Error('P2P routing not initialized');
    }

    try {
      const result = await routing.routeVoiceCall(
        p2pNode.libp2p.peerId.toString(),
        recipient,
        {} // SDP offer
      );
      
      return result;
    } catch (error) {
      console.error('Voice call failed:', error);
      throw error;
    }
  };

  const startVideoCall = async (recipient) => {
    if (!routing) {
      throw new Error('P2P routing not initialized');
    }

    try {
      const result = await routing.routeVideoCall(
        p2pNode.libp2p.peerId.toString(),
        recipient,
        {} // SDP offer
      );
      
      return result;
    } catch (error) {
      console.error('Video call failed:', error);
      throw error;
    }
  };

  return (
    <P2PContext.Provider
      value={{
        p2pNode,
        encryption,
        routing,
        isConnected,
        connections,
        messages,
        initializeP2P,
        sendMessage,
        startVoiceCall,
        startVideoCall
      }}
    >
      {children}
    </P2PContext.Provider>
  );
};
```

---

## 🎯 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Features
- ✅ Web3 wallet connection (MetaMask, WalletConnect)
- ✅ Multi-modal communication (text, voice, video)
- ✅ Verified viewer NFT system
- ✅ Community governance interface
- ✅ Data sovereignty management
- ✅ P2P networking with libp2p
- ✅ E2E reverse scramble encryption
- ✅ Responsive design with Tailwind CSS

---

## 🇺🇸 American Innovation

This frontend represents American innovation in decentralized communication, combining Web3 technology with a user-friendly interface for The Sentinel Security Protocol.

**Building the future of decentralized communication!** 🚀

---

*Last Updated: 2026-05-08*
*Version: 1.0.0*
