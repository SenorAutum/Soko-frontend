import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletProvider } from './WalletContext.jsx' // 1. Import our provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap the entire app */}
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
)