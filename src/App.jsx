import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import './App.css';

function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);

    const connectWallet = async () => {
        // The 'window.ethereum' object is the universal standard for modern wallets like HashPack.
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Use the standard provider injected by the wallet
                const provider = new ethers.BrowserProvider(window.ethereum);
                
                // Request account access. This will prompt the user in their wallet.
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const userAccount = accounts[0];

                setAccount(userAccount);
                setProvider(provider);

                // Create an instance of our smart contract, connected to the user's signer
                const sokoContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                setContract(sokoContract);

                console.log("Wallet Connected:", userAccount);

            } catch (error) {
                console.error("Error connecting wallet:", error);
                // Check for a specific user rejection error
                if (error.code === 4001) {
                    alert("Connection request rejected. Please approve the connection in your wallet.");
                } else {
                    alert("An error occurred while connecting the wallet.");
                }
            }
        } else {
            alert("Wallet not detected. Please install a compatible wallet like HashPack and ensure it's enabled.");
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
        </div>
    );
}

export default App;