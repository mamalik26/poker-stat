import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { generateDeck, SUIT_SYMBOLS, SUIT_COLORS } from '../mock';
import { Plus, Search } from 'lucide-react';

const PlayingCard = ({ card, isSelected, onSelect, disabled }) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`
        w-12 h-16 p-1 text-xs font-bold border-2 transition-all duration-200 
        bg-gradient-to-br from-white via-gray-50 to-gray-100
        ${isSelected 
          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 shadow-lg shadow-emerald-500/20' 
          : 'border-gray-300 hover:border-emerald-400/50 hover:bg-gray-100 hover:shadow-lg'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md cursor-pointer'}
        ${card ? SUIT_COLORS[card.suit] : 'text-gray-600'}
        rounded-xl shadow-sm
      `}
      onClick={() => !disabled && onSelect(card)}
      disabled={disabled}
    >
      {card && (
        <div className="flex flex-col items-center justify-center">
          <span className="font-black text-sm drop-shadow-sm">{card.rank}</span>
          <span className="text-lg drop-shadow-sm">{SUIT_SYMBOLS[card.suit]}</span>
        </div>
      )}
    </Button>
  );
};

const CardSelector = ({ selectedCards, onCardSelect, title, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const deck = generateDeck();
  
  const handleCardSelect = (card) => {
    onCardSelect(card);
    setIsOpen(false);
  };

  const isCardDisabled = (card) => {
    return selectedCards.some(selected => 
      selected && selected.id === card.id
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`
            h-20 w-16 border-2 border-dashed rounded-xl transition-all duration-300
            ${disabled 
              ? 'border-gray-600 cursor-not-allowed opacity-50' 
              : 'border-gray-400 hover:border-emerald-400 hover:bg-emerald-500/5 hover:scale-105'
            }
            bg-black/10 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/10
          `}
          disabled={disabled}
        >
          <div className="flex flex-col items-center gap-1">
            <Plus className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Add</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#2A2A2A] to-[#1F1F1F] border border-gray-700/50 rounded-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-center text-gray-100 flex items-center justify-center gap-3">
            <Search className="w-6 h-6 text-emerald-400" />
            {title}
          </DialogTitle>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mx-auto mt-3"></div>
        </DialogHeader>
        
        {/* Suits Section */}
        <div className="space-y-8 p-4">
          {['spades', 'hearts', 'diamonds', 'clubs'].map(suit => (
            <div key={suit} className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 backdrop-blur-sm border ${
                  suit === 'hearts' || suit === 'diamonds' 
                    ? 'border-red-500/30 text-red-400' 
                    : 'border-gray-600/30 text-gray-300'
                }`}>
                  <span className="text-2xl">{SUIT_SYMBOLS[suit]}</span>
                  <span className="font-semibold capitalize">{suit}</span>
                </div>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-13 gap-2">
                {deck.filter(card => card.suit === suit).map(card => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    onSelect={handleCardSelect}
                    disabled={isCardDisabled(card)}
                    isSelected={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardSelector;