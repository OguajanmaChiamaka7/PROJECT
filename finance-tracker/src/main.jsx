import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TransactionProvider } from './context/TransactionContext.jsx'
import { GoalsProvider } from './context/GoalsContext.jsx'
import { GamificationProvider } from './context/GamificationContext.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { SavingsCircleProvider } from './context/SavingsCircleContext.jsx'
import './index.css'
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TransactionProvider>
          <GoalsProvider>
            <GamificationProvider>
              <GameProvider>
                <SavingsCircleProvider>
                  <App />
                </SavingsCircleProvider>
              </GameProvider>
            </GamificationProvider>
          </GoalsProvider>
        </TransactionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

