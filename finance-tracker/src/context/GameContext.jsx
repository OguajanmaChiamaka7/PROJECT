// GameContext.jsx
import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    isPlaying: false
  });
  
  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };
  
  const endGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };
  
  const updateScore = (newScore) => {
    setGameState(prev => ({ ...prev, score: newScore }));
  };
  
  return (
    <GameContext.Provider value={{ 
      gameState, 
      startGame, 
      endGame, 
      updateScore 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};