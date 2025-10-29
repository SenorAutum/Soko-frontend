import { ethers } from 'ethers';

// 1. YOUR MARKETPLACE CONTRACT
export const CONTRACT_ADDRESS = "0x01e52b145e7c38d5b498c1ed43e5745c43c8cfa7";
export const CONTRACT_ABI = [
  // ... (Your full ABI from the previous message) ...
  // --- PASTE YOUR FULL ABI ARRAY HERE ---
  // (I'm omitting it for brevity, but you must have it here)
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_sewhTokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdcTokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "Cancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "Listed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "Sold",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_listingId",
        "type": "uint256"
      }
    ],
    "name": "buyEnergy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_listingId",
        "type": "uint256"
      }
    ],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amountSEWH",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_priceUSDC",
        "type": "uint256"
      }
    ],
    "name": "listEnergy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "listings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountSEWH",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "priceUSDC",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextListingId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sewhTokenAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcTokenAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// 2. A MINIMAL ERC20 (USDC/SEWH) ABI
// We only need 'approve' and 'allowance' for our frontend
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// 3. CRITICAL ADDRESSES (TESTNET)
// This is the official Hedera Testnet USDC token address
export const USDC_TOKEN_ADDRESS = "0x0000000000000000000000000000000000016a44";
// (Its HTS ID is 0.0.138407)

// -----------------------------------------------------------------
// !! CRITICAL !! YOU MUST PASTE YOUR DEPLOYED SEWH TOKEN ADDRESS HERE
export const SEWH_TOKEN_ADDRESS = "0.0.7056216";
// -----------------------------------------------------------------


// 4. HEDERA READ-ONLY PROVIDER (Your code, it's perfect)
const HEDERA_TESTNET_RPC = "https://testnet.hashio.io/api";
const HEDERA_TESTNET_CHAIN_ID = 296; 
export const readOnlyProvider = new ethers.JsonRpcProvider(HEDERA_TESTNET_RPC, HEDERA_TESTNET_CHAIN_ID);