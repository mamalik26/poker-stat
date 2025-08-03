import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, RotateCcw } from 'lucide-react';
import CardSelector from './CardSelector';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../mock';

const PlayingCardDisplay = ({ card, onRemove, position }) => {
  if (!card) return null;

  return (
    <div className="relative group">
      <div className={`
        w-16 h-20 bg-white border-2 border-gray-300 rounded-lg shadow-lg 
        flex flex-col items-center justify-center font-bold text-sm
        transition-all duration-200 hover:shadow-xl hover:-translate-y-1
        ${SUIT_COLORS[card.suit]}
      `}>
        <span className="text-lg">{card.rank}</span>
        <span className="text-xl">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(position)}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};

const PokerTable = ({ onCardsChange, onPlayersChange }) => {
  const [holeCards, setHoleCards] = useState([null, null]);
  const [communityCards, setCommunityCards] = useState([null, null, null, null, null]);
  const [playerCount, setPlayerCount] = useState(2);

  const allSelectedCards = [...holeCards.filter(Boolean), ...communityCards.filter(Boolean)];

  const handleHoleCardSelect = (card, position) => {
    const newHoleCards = [...holeCards];
    newHoleCards[position] = card;
    setHoleCards(newHoleCards);
    onCardsChange(newHoleCards, communityCards);
  };

  const handleCommunityCardSelect = (card, position) => {
    const newCommunityCards = [...communityCards];
    newCommunityCards[position] = card;
    setCommunityCards(newCommunityCards);
    onCardsChange(holeCards, newCommunityCards);
  };

  const removeCard = (type, position) => {
    if (type === 'hole') {
      const newHoleCards = [...holeCards];
      newHoleCards[position] = null;
      setHoleCards(newHoleCards);
      onCardsChange(newHoleCards, communityCards);
    } else {
      const newCommunityCards = [...communityCards];
      newCommunityCards[position] = null;
      setCommunityCards(newCommunityCards);
      onCardsChange(holeCards, newCommunityCards);
    }
  };

  const clearAll = () => {
    setHoleCards([null, null]);
    setCommunityCards([null, null, null, null, null]);
    onCardsChange([null, null], [null, null, null, null, null]);
  };

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    onPlayersChange(count);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-green-800 to-green-900 border-green-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-center text-2xl font-bold">
          Texas Hold'em Probability Calculator
        </CardTitle>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label className="text-white">Players:</Label>
            <Input
              type="number"
              min="2"
              max="10"
              value={playerCount}
              onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
              className="w-16 bg-white"
            />
          </div>
          <Button variant="outline" onClick={clearAll} className="bg-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Your Hole Cards */}
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-4">Your Hole Cards</h3>
          <div className="flex justify-center gap-4">
            {holeCards.map((card, index) => (
              <div key={`hole-${index}`}>
                {card ? (
                  <PlayingCardDisplay 
                    card={card} 
                    onRemove={(pos) => removeCard('hole', pos)}
                    position={index}
                  />
                ) : (
                  <CardSelector
                    selectedCards={allSelectedCards}
                    onCardSelect={(card) => handleHoleCardSelect(card, index)}
                    title={`Select Hole Card ${index + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Community Cards */}
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-4">Community Cards</h3>
          
          {/* Flop */}
          <div className="mb-6">
            <h4 className="text-white text-sm mb-3 opacity-80">Flop</h4>
            <div className="flex justify-center gap-2">
              {communityCards.slice(0, 3).map((card, index) => (
                <div key={`flop-${index}`}>
                  {card ? (
                    <PlayingCardDisplay 
                      card={card} 
                      onRemove={(pos) => removeCard('community', pos)}
                      position={index}
                    />
                  ) : (
                    <CardSelector
                      selectedCards={allSelectedCards}
                      onCardSelect={(card) => handleCommunityCardSelect(card, index)}
                      title={`Select Flop Card ${index + 1}`}
                      disabled={index > 0 && !communityCards[index - 1]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Turn */}
          <div className="mb-6">
            <h4 className="text-white text-sm mb-3 opacity-80">Turn</h4>
            <div className="flex justify-center">
              {communityCards[3] ? (
                <PlayingCardDisplay 
                  card={communityCards[3]} 
                  onRemove={(pos) => removeCard('community', pos)}
                  position={3}
                />
              ) : (
                <CardSelector
                  selectedCards={allSelectedCards}
                  onCardSelect={(card) => handleCommunityCardSelect(card, 3)}
                  title="Select Turn Card"
                  disabled={!communityCards[2]}
                />
              )}
            </div>
          </div>

          {/* River */}
          <div>
            <h4 className="text-white text-sm mb-3 opacity-80">River</h4>
            <div className="flex justify-center">
              {communityCards[4] ? (
                <PlayingCardDisplay 
                  card={communityCards[4]} 
                  onRemove={(pos) => removeCard('community', pos)}
                  position={4}
                />
              ) : (
                <CardSelector
                  selectedCards={allSelectedCards}
                  onCardSelect={(card) => handleCommunityCardSelect(card, 4)}
                  title="Select River Card"
                  disabled={!communityCards[3]}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PokerTable;