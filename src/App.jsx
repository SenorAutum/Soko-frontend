import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import './App.css';

// Set up a read-only provider to fetch data without a wallet
const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
const readOnlyProvider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC);
const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider);


function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // This function runs when the page loads
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const fetchedListings = [];
                
                // Get the total number of listings ever created
                const listingCounter = await readOnlyContract.nextListingId();
                const total = Number(listingCounter); // Convert BigInt to number

                // Loop through all listings by their ID
                for (let i = 0; i < total; i++) {
                    const listing = await readOnlyContract.listings(i);
                    
                    // Only add active listings to our list
                    if (listing.active) {
                        fetchedListings.push({
                            id: i,
                            seller: listing.seller,
                            amount: Number(listing.amountSEWH), // Convert to number for display
                            price: Number(listing.priceUSDC) // Convert to number for display
                        });
                    }
                }
                
                setListings(fetchedListings);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching listings:", error);
                alert("Could not fetch listings from the smart contract.");
                setLoading(false);
            }
        };

        fetchListings();
    }, []); // The empty array [] means this runs only once

    // This is the same connectWallet function as before.
    // It's still correct, even if your environment is blocking it.
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const userAccount = accounts[0];
                setAccount(userAccount);
                const sokoContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                setContract(sokoContract);
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Wallet connection failed. Please ensure your wallet is unlocked and enabled.");
            }
        } else {
            alert("Wallet not detected. Please install a compatible wallet like HashPack.");
        }
    };

    return (
        <div className="container">
            <header>
                <h1>⚡ SOKO Energy Marketplace</h1>
                <p>A decentralized P2P energy market on Hedera.</p>
            </header>

            {account ? (
                <div className="wallet-info">
                    <p><strong>Connected Account:</strong> {account}</p>
                </div>
            ) : (
                <button className="connect-button" onClick={connectWallet}>
                    Connect Wallet
                </button>
            )}

            <main>
                <h2>Available Energy Listings</h2>
                {loading ? (
                    <p>Loading listings from the blockchain...</p>
                ) : (
                    <div className="listings-grid">
                        {listings.length === 0 ? (
                            <p>No active listings found.</p>
                        ) : (
                            listings.map((listing) => (
                                <div key={listing.id} className="listing-card">
                                    <p><strong>Seller:</strong> {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                                    <p><strong>Amount:</strong> {listing.amount} SEWH</p>
                                    {/* Note: We will format this price better later */}
                                    <p><strong>Price:</strong> {listing.price} USDC-cents</p>
                                    <button className="buy-button">Buy Now</button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;