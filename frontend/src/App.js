import React, { useState, useCallback } from 'react';
import './App.css';
import PokerTable from './components/PokerTable';
import ProbabilityDashboard from './components/ProbabilityDashboard';
import { PokerAPI, validateCards } from './services/pokerAPI';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCardsChange = useCallback(async (holeCards, communityCards) => {
    // Reset analysis if no hole cards
    const validHoleCards = holeCards.filter(Boolean);
    if (validHoleCards.length === 0) {
      setAnalysis(null);
      return;
    }

    // Need at least 2 hole cards to analyze
    if (validHoleCards.length < 2) {
      setAnalysis(null);
      return;
    }

    // Validate cards
    const validationErrors = validateCards(holeCards, communityCards);
    if (validationErrors.length > 0) {
      toast({
        title: "Invalid Cards",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await PokerAPI.analyzeHand(
        holeCards, 
        communityCards, 
        playerCount, 
        100000 // simulation iterations
      );

      if (result.success) {
        setAnalysis(result.data);
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Failed to analyze hand",
          variant: "destructive",
        });
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during analysis",
        variant: "destructive",
      });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [playerCount, toast]);

  const handlePlayersChange = useCallback((count) => {
    setPlayerCount(count);
    // Re-analyze with new player count if we have cards
    if (analysis) {
      // This will trigger a re-analysis with the new player count
      // The cards will remain the same, but the analysis will update
    }
  }, [analysis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Poker Table */}
          <div className="lg:col-span-1">
            <PokerTable 
              onCardsChange={handleCardsChange}
              onPlayersChange={handlePlayersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Analysis Dashboard */}
          <div className="lg:col-span-1">
            <ProbabilityDashboard 
              analysis={analysis} 
              playerCount={playerCount}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            <span className="font-semibold">Powered by:</span> Monte Carlo simulations (100,000 iterations) 
            and combinatorial analysis using the Treys poker evaluation engine.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;