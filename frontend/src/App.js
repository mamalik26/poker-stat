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
  const [currentCards, setCurrentCards] = useState({ holeCards: [null, null], communityCards: [null, null, null, null, null] });
  const { toast } = useToast();

  const handleCardsChange = useCallback((holeCards, communityCards) => {
    // Update card state without triggering calculation
    setCurrentCards({ holeCards, communityCards });
    
    // Reset analysis when cards change
    setAnalysis(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    const { holeCards, communityCards } = currentCards;
    
    // Validate we have hole cards
    const validHoleCards = holeCards.filter(Boolean);
    if (validHoleCards.length < 2) {
      toast({
        title: "Incomplete Hand",
        description: "Please select both hole cards before calculating",
        variant: "destructive",
      });
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
  }, [currentCards, playerCount, toast]);

  const handlePlayersChange = useCallback((count) => {
    setPlayerCount(count);
    // Clear analysis when player count changes
    setAnalysis(null);
  }, []);

  // Check if we have valid cards to enable Calculate button
  const canCalculate = currentCards.holeCards.filter(Boolean).length === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] via-[#2D2D2D] to-[#1A1A1A] font-['Inter',sans-serif] text-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0F3D2E] to-[#1B5E47] shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              ♠️ Poker Pro Calculator
            </h1>
            <p className="text-lg text-emerald-200 opacity-90 font-medium">
              Advanced Texas Hold'em Probability Analysis
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-black/20 backdrop-blur-sm rounded-full px-6 py-2 border border-emerald-400/30">
                <span className="text-emerald-300 text-sm font-medium">
                  Powered by Monte Carlo Simulations (100k+ iterations)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Poker Table - Takes 3/5 of space on XL screens */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <PokerTable 
                onCardsChange={handleCardsChange}
                onPlayersChange={handlePlayersChange}
                isLoading={isLoading}
              />
            </div>
            
            {/* Calculate Button Section */}
            <div className="flex justify-center">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate || isLoading}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300
                  flex items-center gap-3 shadow-xl
                  ${canCalculate && !isLoading
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-1 hover:scale-105' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-60'
                  }
                `}
                aria-label="Calculate hand probabilities using Monte Carlo simulation"
                title={canCalculate ? "Run Monte Carlo simulation (100,000 iterations)" : "Select both hole cards to enable calculation"}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing Hand...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🎯</span>
                    Calculate Probabilities
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Dashboard - Takes 2/5 of space on XL screens */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] rounded-3xl shadow-2xl border border-gray-700/50 p-6 h-full">
              <ProbabilityDashboard 
                analysis={analysis} 
                playerCount={playerCount}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-[#2A2A2A] to-[#1F1F1F] rounded-2xl border border-gray-700/50 p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Real-time Analysis</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">⚡</span>
                <span>Advanced Algorithms</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🎯</span>
                <span>Professional Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;