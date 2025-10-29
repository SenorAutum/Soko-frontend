// --- FIX: Corrected the import statement ---
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashConnect, HashConnectConnectionState } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';
import { ethers } from 'ethers';

// 1. Initialize the HashConnect instance
const hashconnect = new HashConnect(
  LedgerId.TESTNET,
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  {
    name: "SOKO DePIN",
    description: "Peer-to-peer energy trading on Hedera.",
    // --- FIX: Corrected the URL typo ---
    icons: ["https://www.hashpack.app/icon.svg"],
    url: window.location.origin
  },
  true
);

// 2. Create the React Context
const WalletContext = createContext(null);

// 3. Create the Provider component (UPDATED)
export const WalletProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState(HashConnectConnectionState.Disconnected);
  const [accountId, setAccountId] = useState('');
  
  // --- FIX: Added the missing pairingData state ---
  const [pairingData, setPairingData] = useState(null);
  
  // --- NEW STATE FOR WRITEABLE APP ---
  const [ethersProvider, setEthersProvider] = useState(null);
  const [ethersSigner, setEthersSigner] = useState(null);
  // --- END NEW STATE ---

  const initialize = async (pairedData) => {
    // This function runs AFTER pairing is successful
    console.log("Initializing Ethers.js provider...");
    
    // 4. Get the signer from HashConnect
    const signer = hashconnect.getSigner(pairedData.accountIds[0]);

    // 5. Wrap it in an ethers.js BrowserProvider
    const provider = new ethers.BrowserProvider(signer);

    // 6. Get the Ethers.js signer
    const ethSigner = await provider.getSigner();

    // 7. Store the provider and signer in state
    setEthersProvider(provider);
    setEthersSigner(ethSigner);

    setAccountId(pairedData.accountIds[0]);
    setConnectionStatus(HashConnectConnectionState.Connected);
    console.log("Ethers.js signer is ready.");
  };

  useEffect(() => {
    const initHashConnect = async () => {
      try {
        await hashconnect.init();
        
        if (hashconnect.foundPairing()) {
          const pairedData = hashconnect.getPairingData();
          console.log("Found existing pairing:", pairedData);
          setPairingData(pairedData); // Set pairingData for use
          await initialize(pairedData); // Initialize ethers signer
        } else {
          console.log("No existing pairing found.");
        }
      } catch (e) {
        console.error("Error initializing HashConnect:", e);
      }
    };

    // --- Register Event Listeners ---
    hashconnect.pairingEvent.on(async (pairedData) => {
      console.log("Paired successfully:", pairedData);
      setPairingData(pairedData); // Set pairingData for use
      await initialize(pairedData); // Initialize ethers signer
    });

    hashconnect.disconnectionEvent.on(() => {
      console.log("Disconnected.");
      setPairingData(null);
      setAccountId('');
      setConnectionStatus(HashConnectConnectionState.Disconnected);
      // --- Clear ethers state ---
      setEthersProvider(null);
      setEthersSigner(null);
      // --- End ---
    });

    hashconnect.connectionStatusChangeEvent.on((status) => {
      console.log("Connection status changed:", status);
      setConnectionStatus(status);
    });

    initHashConnect();
  }, []);

  // This logic is now simplified
  const connectWallet = () => {
    // --- FIX: Corrected typo 'HashConnectConnectionSState' ---
    if (connectionStatus === HashConnectConnectionState.Disconnected) {
      console.log("Opening pairing modal...");
      hashconnect.openPairingModal();
    }
  };

  const disconnectWallet = () => {
    // --- This now works because `pairingData` is in state ---
    if (connectionStatus === HashConnectConnectionState.Connected && pairingData) {
      console.log("Disconnecting...");
      hashconnect.disconnect(pairingData.topic);
    }
  };

  // 8. Provide the new values to the app
  const value = {
    connectionStatus,
    accountId,
    connectWallet,
    disconnectWallet,
    ethersProvider, // NEW: So we can use the provider
    ethersSigner,   // NEW: So we can sign transactions
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// 4. Create a custom hook to use the context (same as before)
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};