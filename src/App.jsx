import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// --- Config now has everything we need ---
import { CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider } from './config';
import './App.css';

// --- Our new components ---
import { useWallet } from './WalletContext.jsx';
import { HashConnectConnectionState } from 'hashconnect';
import { ProducerView } from './ProducerView.jsx';
import { ListingCard } from './ListingCard.jsx';

// We get this from config.js now
const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider);

function App() {
  const { connectionStatus, accountId, connectWallet, disconnectWallet } = useWallet();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // This state is a simple way to trigger a refresh from child components
  const [refreshId, setRefreshId] = useState(0);
  const refreshListings = () => setRefreshId(Date.now());

  // This function fetches listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log("Attempting to fetch listings...");
        setLoading(true);
        const fetchedListings = [];
        
        const listingCounter = await readOnlyContract.nextListingId();
        const total = Number(listingCounter);
        console.log(`Total listings (nextListingId): ${total}`);

        for (let i = 0; i < total; i++) {
          const listing = await readOnlyContract.listings(i);
          
          if (listing.active) {
            fetchedListings.push({
              id: i,
              seller: listing.seller,
              amount: listing.amountSEWH, // Send the BigInt, let the card format it
              price: listing.priceUSDC    // Send the BigInt, let the card format it
            });
          }
        }
        
        setListings(fetchedListings.reverse()); // Show newest first
        setLoading(false);

      } catch (error) {
        console.error("--- FULL FETCH ERROR ---", error);
        alert(`Error fetching listings. Check console (F12). Message: ${error.message}`);
        setLoading(false);
      }
    };

    fetchListings();
  }, [refreshId]); // This will re-run when refreshId changes

  return (
    <div className="container">
      <header>
        <h1>⚡ SOKO Energy Marketplace</h1>
        <p>A decentralized P2P energy market on Hedera.</p>
      </header>

      {/* --- This is our new connection block --- */}
      {connectionStatus === HashConnectConnectionState.Connected ? (
        <div className="wallet-info">
          <p><strong>Connected Account:</strong> {accountId}</p>
          <button className="connect-button disconnect" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      ) : (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {/* --- This is our new Producer section --- */}
      {/* Only show the "List Energy" form if the wallet is connected */}
      {connectionStatus === HashConnectConnectionState.Connected && (
        <ProducerView onListingSuccess={refreshListings} />
      )}

      <main>
        <h2>Available Energy Listings</h2>
        <button onClick={refreshListings} className="refresh-button">
          Refresh Listings
        </button>
        
        {loading ? (
          <p>Loading listings from the blockchain...</p>
        ) : (
          <div className="listings-grid">
            {listings.length === 0 ? (
              <p>No active listings found.</p>
            ) : (
              // --- We now use our new ListingCard component ---
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPurchaseSuccess={refreshListings}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;