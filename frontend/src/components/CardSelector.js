import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { generateDeck, SUIT_SYMBOLS, SUIT_COLORS } from '../mock';

const PlayingCard = ({ card, isSelected, onSelect, disabled }) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`
        w-12 h-16 p-1 text-xs font-bold border-2 transition-all duration-200
        ${isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md'}
        ${card ? SUIT_COLORS[card.suit] : ''}
      `}
      onClick={() => !disabled && onSelect(card)}
      disabled={disabled}
    >
      {card && (
        <div className="flex flex-col items-center justify-center">
          <span>{card.rank}</span>
          <span className="text-lg">{SUIT_SYMBOLS[card.suit]}</span>
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
          className="h-20 w-16 border-2 border-dashed border-gray-400 hover:border-gray-600 transition-colors"
          disabled={disabled}
        >
          <span className="text-2xl text-gray-500">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-13 gap-2 p-4">
          {deck.map(card => (
            <PlayingCard
              key={card.id}
              card={card}
              onSelect={handleCardSelect}
              disabled={isCardDisabled(card)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardSelector;