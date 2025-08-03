import React, { useState, useCallback } from 'react';
import './App.css';
import PokerTable from './components/PokerTable';
import ProbabilityDashboard from './components/ProbabilityDashboard';
import { getMockAnalysis } from './mock';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [playerCount, setPlayerCount] = useState(2);

  const handleCardsChange = useCallback((holeCards, communityCards) => {
    const newAnalysis = getMockAnalysis(holeCards, communityCards);
    setAnalysis(newAnalysis);
  }, []);

  const handlePlayersChange = useCallback((count) => {
    setPlayerCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Poker Table */}
          <div className="lg:col-span-1">
            <PokerTable 
              onCardsChange={handleCardsChange}
              onPlayersChange={handlePlayersChange}
            />
          </div>

          {/* Analysis Dashboard */}
          <div className="lg:col-span-1">
            <ProbabilityDashboard 
              analysis={analysis} 
              playerCount={playerCount}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            <span className="font-semibold">Note:</span> This is a demo version with mock calculations. 
            Full Monte Carlo simulations and combinatorial analysis will be implemented in the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;