import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  USDC_TOKEN_ADDRESS,
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
      alert("Please approve the transaction to allow the marketplace to spend your $USDC$.");
      
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

// Helper to format price (150000 units -> 15 cents)
function formatPrice(priceInSmallestUnit) {
    // We agreed price is in cents (15) but stored as 150000 units
    return Number(priceInSmallestUnit) / 10000;
}

// Helper to format amount (1000000000 units -> 1000 $SEWH$)
function formatAmount(amountInSmallestUnit) {
    // Assuming 8 decimals
    return Number(amountInSmallestUnit) / 10**8;
}

export function ListingCard({ listing, onPurchaseSuccess }) {
  const { ethersSigner, accountId } = useWallet();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!ethersSigner) {
      alert("Please connect your wallet to buy.");
      return;
    }

    setIsBuying(true);
    alert("Buying energy... Please approve two transactions: 1. Approve $USDC$, 2. Buy Energy");

    try {
      // 1. Create contract instances
      const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, ethersSigner);
      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethersSigner);

      // 2. Check/request approval for $USDC$ tokens
      // listing.price is already in the smallest unit from the contract
      const approved = await checkAndRequestApproval(
        ethersSigner,
        usdcContract,
        CONTRACT_ADDRESS,
        listing.price
      );

      if (!approved) {
        setIsBuying(false);
        return;
      }

      // 3. If approval is successful, call buyEnergy
      console.log("Approval confirmed. Buying energy...");
      alert("Approval successful. Now, please confirm the final 'buyEnergy' transaction.");

      const buyTx = await marketContract.buyEnergy(listing.id);
      await buyTx.wait();

      alert("Purchase successful! You now have the $SEWH$ tokens.");
      setIsBuying(false);
      onPurchaseSuccess(); // This will tell App.jsx to refresh
    } catch (error) {
      console.error("Error buying energy:", error);
      alert(`Purchase failed: ${error.message}`);
      setIsBuying(false);
    }
  };

  // Dont let user buy their own listing
  const isOwnListing = listing.seller.toLowerCase() === accountId.toLowerCase();

  return (
    <div className="listing-card">
      <p><strong>Seller:</strong> {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
      <p><strong>Amount:</strong> {formatAmount(listing.amount)} $SEWH$</p>
      <p><strong>Price:</strong> {formatPrice(listing.price)} USDC-cents</p>
      <button
        className="buy-button"
        onClick={handleBuyNow}
        disabled={isBuying || isOwnListing}
      >
        {isBuying ? "Buying..." : (isOwnListing ? "Your Listing" : "Buy Now")}
      </button>
    </div>
  );
}