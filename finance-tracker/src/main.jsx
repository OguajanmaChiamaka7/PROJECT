import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TransactionProvider } from './context/TransactionContext.jsx'
import { GameProvider } from './context/GameContext.jsx'
import './index.css'
import "./styles/globals.css";



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TransactionProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

