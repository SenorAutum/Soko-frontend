import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  SEWH_TOKEN_ADDRESS,
  ERC20_ABI
} from './config';

// Helper function to handle the complex "approve" logic
async function checkAndRequestApproval(
  ethersSigner,
  tokenContract,
  spenderAddress,
  amount
) {
  try {
    const ownerAddress = await ethersSigner.getAddress();
    console.log(`Checking allowance for ${ownerAddress}...`);
    
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    
    if (allowance < amount) {
      console.log("Allowance is too low. Requesting approval...");
      alert("Please approve the transaction to allow the marketplace to spend your $SEWH$.");
      
      const approveTx = await tokenContract.approve(spenderAddress, amount);
      await approveTx.wait(); // Wait for 1 confirmation
      
      console.log("Approval successful.");
      return true;
    }
    
    console.log("Allowance is sufficient.");
    return true;
  } catch (error) {
    console.error("Error during approval:", error);
    alert(`Approval failed: ${error.message}`);
    return false;
  }
}

export function ProducerView({ onListingSuccess }) {
  const { ethersSigner } = useWallet();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  // This is the logic for $SEWH$ which has 8 decimals
  const getAmountInSmallestUnit = (value) => {
    // Assuming $SEWH$ has 8 decimals (like most Hedera tokens)
    return ethers.parseUnits(value, 8);
  };
  
  // This is the logic for USDC which has 6 decimals
  const getPriceInSmallestUnit = (value) => {
    // Assuming our price is in cents (e.g., 15 cents)
    // And USDC has 6 decimals. 15 cents = 150,000 smallest units.
    return BigInt(value) * BigInt(10000); // 1 cent = 10,000 units (15 * 10k = 150k)
  };

  const handleListEnergy = async (e) => {
    e.preventDefault();
    if (!ethersSigner) {
      alert("Wallet is not connected.");
      return;
    }
    if (SEWH_TOKEN_ADDRESS === "0x...YOUR_SEWH_TOKEN_ADDRESS_HERE") {
      alert("CRITICAL ERROR: SEWH_TOKEN_ADDRESS is not set in config.js");
      return;
    }

    setIsListing(true);
    alert("Listing energy... Please approve two transactions: 1. Approve $SEWH$, 2. List Energy");

    try {
      // 1. Create contract instances
      const sewhContract = new ethers.Contract(SEWH_TOKEN_ADDRESS, ERC20_ABI, ethersSigner);
      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethersSigner);

      // 2. Convert inputs to their smallest unit
      const amountSEWH = getAmountInSmallestUnit(amount); // e.g., 1000 $SEWH$
      const priceUSDC = getPriceInSmallestUnit(price);   // e.g., 15 cents

      // 3. Check/request approval for $SEWH$ tokens
      const approved = await checkAndRequestApproval(
        ethersSigner,
        sewhContract,
        CONTRACT_ADDRESS,
        amountSEWH
      );

      if (!approved) {
        setIsListing(false);
        return;
      }

      // 4. If approval is successful, call listEnergy
      console.log("Approval confirmed. Listing energy...");
      alert("Approval successful. Now, please confirm the final 'listEnergy' transaction.");
      
      const listTx = await marketContract.listEnergy(amountSEWH, priceUSDC);
      await listTx.wait();

      alert("Energy listed successfully!");
      setIsListing(false);
      setAmount('');
      setPrice('');
      onListingSuccess(); // This will tell App.jsx to refresh
    } catch (error) {
      console.error("Error listing energy:", error);
      alert(`Listing failed: ${error.message}`);
      setIsListing(false);
    }
  };

  return (
    <div className="producer-view">
      <h2>Become a Producer</h2>
      <form onSubmit={handleListEnergy}>
        <div className="form-group">
          <label>Energy Amount (in $SEWH$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
          />
        </div>
        <div className="form-group">
          <label>Price (in USDC-cents)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 15"
            required
          />
        </div>

        <button 
  type="button" 
  className="ai-button" 
  onClick={() => alert("AI Suggestion (Mockup): Based on current grid demand and solar forecasts, our AI suggests a price of 17 USDC-cents for a rapid sale.")}
>
  🤖 Get AI Price Suggestion
</button>
        <button type="submit" disabled={isListing}>
          {isListing ? "Listing..." : "List Your Energy"}
        </button>
      </form>
    </div>
  );
}